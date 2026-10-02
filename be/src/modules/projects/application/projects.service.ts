import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BoxDimensions, MaterialSpecification } from '@wrapfit/shared';
import { paginate, Paginated, toSkipTake } from '../../../common/dto/pagination.dto';
import {
  canDeletePermanently,
  canEdit,
  findDimensionViolations,
  readDimensionLimits,
} from '../domain/project.policy';
import { changeStatus, duplicateTitle, purgeCutoff } from '../domain/project-lifecycle';
import {
  DEFAULT_MATERIAL,
  EMPTY_CANVAS,
  MAX_TITLE_LENGTH,
  ProjectDetail,
  ProjectStatus,
  ProjectSummary,
  ProjectVisibility,
} from '../domain/project.types';
import { CreateProjectDto } from '../presentation/dto/create-project.dto';
import { BoxDimensionsDto } from '../presentation/dto/project-spec.dto';
import { NO_COLLECTION, QueryProjectsDto } from '../presentation/dto/query-projects.dto';
import { UpdateProjectDto } from '../presentation/dto/update-project.dto';
import { IProjectFiles, PROJECT_FILES } from './ports/project-files.port';
import { IProjectRepository, PROJECT_REPOSITORY, ProjectChanges } from './ports/project.repository.port';

/** Projects permanently deleted per trash purge run. */
const PURGE_BATCH = 500;

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projects: IProjectRepository,
    @Inject(PROJECT_FILES) private readonly files: IProjectFiles,
  ) {}

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectDetail> {
    const template = await this.projects.findTemplateRules(dto.templateId);
    if (!template?.isActive) {
      throw new BadRequestException(`Unknown or inactive template: ${dto.templateId}`);
    }
    if (dto.collectionId) await this.assertCollectionOwner(dto.collectionId, userId);

    // Template hub (UC-13): the curated design provides the material and canvas the client did not send
    // (a client that resized the design sends its own scaled canvas).
    const design = dto.designTemplateId ? await this.projects.findDesignTemplate(dto.designTemplateId) : null;
    if (dto.designTemplateId) {
      if (!design?.isActive) throw new BadRequestException('Unknown or inactive design template');
      if (design.boxTemplateId !== template.id) {
        throw new BadRequestException(`templateId must be ${design.boxTemplateId} for this design template`);
      }
    }

    const materialSpec = dto.materialSpec ?? design?.materialSpec ?? DEFAULT_MATERIAL;
    const dimensions = this.completeDimensions(dto.dimensions, materialSpec);
    this.assertDimensionsFit(dimensions, template.formulaSchema);

    const project = await this.projects.create({
      userId,
      templateId: template.id,
      collectionId: dto.collectionId ?? null,
      title: dto.title,
      dimensions,
      materialSpec,
      canvasState: dto.canvasState ?? design?.canvasState ?? EMPTY_CANVAS,
      tags: dto.tags ?? [],
      occasion: dto.occasion ?? null,
      industry: dto.industry ?? null,
    });
    if (design) await this.projects.countTemplateUse(design.id);
    return project;
  }

  async list(userId: string, query: QueryProjectsDto): Promise<Paginated<ProjectSummary>> {
    const { items, total } = await this.projects.list({
      userId,
      status: query.status,
      collectionId: query.collectionId === NO_COLLECTION ? null : query.collectionId,
      search: query.q || undefined,
      sortBy: query.sortBy,
      order: query.order,
      ...toSkipTake(query),
    });
    return paginate(items, total, query);
  }

  /** Ownership is checked before by ProjectOwnerGuard. */
  async findOne(projectId: string): Promise<ProjectDetail> {
    const project = await this.projects.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto): Promise<ProjectDetail> {
    const project = await this.findOne(projectId);
    if (!canEdit(project.status)) {
      throw new ConflictException('Restore the project from the trash before editing it');
    }
    if (dto.collectionId) await this.assertCollectionOwner(dto.collectionId, userId);

    const changes: ProjectChanges = {
      title: dto.title,
      collectionId: dto.collectionId,
      materialSpec: dto.materialSpec,
      canvasState: dto.canvasState,
      thumbnailUrl: dto.thumbnailUrl,
      tags: dto.tags,
      occasion: dto.occasion,
      industry: dto.industry,
    };

    if (dto.dimensions) {
      const template = await this.projects.findTemplateRules(project.template.id);
      changes.dimensions = this.completeDimensions(dto.dimensions, dto.materialSpec ?? project.materialSpec);
      this.assertDimensionsFit(changes.dimensions, template?.formulaSchema);
    }

    return this.projects.update(projectId, changes);
  }

  /** Archive, move to the trash or restore. Setting the current status again changes nothing. */
  async changeStatus(projectId: string, status: ProjectStatus): Promise<ProjectDetail> {
    const project = await this.findOne(projectId);
    const next = changeStatus(project, status, new Date());
    return next ? this.projects.setLifecycle(projectId, next) : project;
  }

  /** Privacy (UC-08): PRIVATE / UNLISTED (secret link) / PUBLIC, and whether others may remix it. */
  async changeVisibility(
    projectId: string,
    change: { visibility?: ProjectVisibility; allowFork?: boolean },
  ): Promise<ProjectDetail> {
    const project = await this.findOne(projectId);
    if (!canEdit(project.status)) {
      throw new ConflictException('Restore the project from the trash before sharing it');
    }
    return this.projects.update(projectId, { visibility: change.visibility, allowFork: change.allowFork });
  }

  /** Independent copy in the owner's workspace (UC-06), titled `[Bản sao] <title>`. */
  async duplicate(projectId: string, userId: string): Promise<ProjectDetail> {
    const source = await this.findOne(projectId);
    if (!canEdit(source.status)) {
      throw new ConflictException('Restore the project from the trash before duplicating it');
    }
    return this.copy(source, userId, {
      title: duplicateTitle(source.title, MAX_TITLE_LENGTH),
      collectionId: source.collection?.id ?? null,
      forkedFromId: null,
    });
  }

  /**
   * Remix of someone else's shared project (UC-11): a copy in the remixer's workspace, outside any collection,
   * linked to the original by `forkedFromId`. Who may fork what is decided by the caller (public showcase).
   */
  async fork(sourceId: string, userId: string): Promise<ProjectDetail> {
    const source = await this.findOne(sourceId);
    return this.copy(source, userId, { title: source.title, collectionId: null, forkedFromId: source.id });
  }

  /**
   * Same template, dimensions, material, canvas, FitCheck result and tags; new id and slug. The copy starts ACTIVE
   * and PRIVATE; the thumbnail is not shared (its file belongs to the source project).
   */
  private copy(
    source: ProjectDetail,
    userId: string,
    target: { title: string; collectionId: string | null; forkedFromId: string | null },
  ): Promise<ProjectDetail> {
    return this.projects.create({
      userId,
      templateId: source.template.id,
      dimensions: source.dimensions,
      materialSpec: source.materialSpec,
      canvasState: source.canvasState,
      fitcheckState: source.fitcheckState,
      tags: source.tags,
      occasion: source.occasion,
      industry: source.industry,
      ...target,
    });
  }

  /**
   * Called by TrashPurgeTask: permanently deletes projects that stayed in the trash for 30 days, then their files
   * in object storage. Works in batches; what is left is handled by the next run.
   */
  async purgeExpiredTrash(now = new Date()): Promise<number> {
    const cutoff = purgeCutoff(now);
    const candidates = await this.projects.findTrashedBefore(cutoff, PURGE_BATCH);
    if (!candidates.length) return 0;

    const files = await this.files.listProjectFiles(candidates);
    const deleted = new Set(await this.projects.deleteTrashed(candidates, cutoff));
    await this.files.deleteObjects(files.filter((file) => deleted.has(file.projectId)).map((file) => file.key));
    return deleted.size;
  }

  async remove(projectId: string): Promise<void> {
    const project = await this.findOne(projectId);
    if (!canDeletePermanently(project.status)) {
      throw new ConflictException('Move the project to the trash before deleting it permanently');
    }
    const files = await this.files.listProjectFiles([projectId]);
    await this.projects.delete(projectId);
    await this.files.deleteObjects(files.map((file) => file.key));
  }

  /** Throws 404 when the project does not exist or belongs to someone else (no information leak). */
  async assertOwner(projectId: string, userId: string): Promise<void> {
    const ownerId = await this.projects.findOwnerId(projectId);
    if (ownerId !== userId) throw new NotFoundException('Project not found');
  }

  private async assertCollectionOwner(collectionId: string, userId: string): Promise<void> {
    if (!(await this.projects.isCollectionOwnedBy(collectionId, userId))) {
      throw new BadRequestException('collectionId must be one of your collections');
    }
  }

  /** The paper thickness defaults to the caliper of the chosen material. */
  private completeDimensions(dto: BoxDimensionsDto, material: MaterialSpecification): BoxDimensions {
    return {
      length: dto.length,
      width: dto.width,
      height: dto.height,
      paperThickness: dto.paperThickness ?? material.caliper,
    };
  }

  private assertDimensionsFit(dimensions: BoxDimensions, formulaSchema: unknown): void {
    const violations = findDimensionViolations(dimensions, readDimensionLimits(formulaSchema));
    if (violations.length) throw new BadRequestException(violations);
  }
}

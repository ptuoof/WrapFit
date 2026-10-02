import type { BoxDimensions, MaterialSpecification } from '@wrapfit/shared';
import type { LifecycleState } from '../../domain/project-lifecycle';
import type {
  CanvasState,
  ProjectDetail,
  ProjectStatus,
  ProjectSummary,
  ProjectVisibility,
  Industry,
  Occasion,
} from '../../domain/project.types';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface TemplateRules {
  id: string;
  isActive: boolean;
  formulaSchema: unknown;
}

export interface NewProject {
  userId: string;
  templateId: string;
  collectionId: string | null;
  title: string;
  dimensions: BoxDimensions;
  materialSpec: MaterialSpecification;
  canvasState: CanvasState;
  tags: string[];
  occasion?: Occasion | null;
  industry?: Industry | null;
  /** Copied by duplicate / fork; new projects start without a FitCheck result. */
  fitcheckState?: unknown;
  /** Set by a remix (fork) of a public project. */
  forkedFromId?: string | null;
}

/** `undefined` = leave unchanged, `null` = clear. */
export interface ProjectChanges {
  title?: string;
  collectionId?: string | null;
  dimensions?: BoxDimensions;
  materialSpec?: MaterialSpecification;
  canvasState?: CanvasState;
  thumbnailUrl?: string | null;
  tags?: string[];
  occasion?: Occasion | null;
  industry?: Industry | null;
  visibility?: ProjectVisibility;
  allowFork?: boolean;
}

export interface ProjectListQuery {
  userId: string;
  status: ProjectStatus;
  /** `null` = only projects outside any collection. */
  collectionId?: string | null;
  search?: string;
  sortBy: 'updatedAt' | 'createdAt' | 'title';
  order: 'asc' | 'desc';
  skip: number;
  take: number;
}

/** A curated design of the template hub that a new project starts from (UC-13). */
export interface DesignTemplateSource {
  id: string;
  boxTemplateId: string;
  isActive: boolean;
  materialSpec: MaterialSpecification;
  canvasState: CanvasState;
}

export interface IProjectRepository {
  findTemplateRules(templateId: string): Promise<TemplateRules | null>;
  findDesignTemplate(designTemplateId: string): Promise<DesignTemplateSource | null>;
  /** Usage counter of a curated design (template hub). */
  countTemplateUse(designTemplateId: string): Promise<void>;
  isCollectionOwnedBy(collectionId: string, userId: string): Promise<boolean>;
  /** Minimal lookup used by ProjectOwnerGuard. */
  findOwnerId(projectId: string): Promise<string | null>;
  findById(projectId: string): Promise<ProjectDetail | null>;
  list(query: ProjectListQuery): Promise<{ items: ProjectSummary[]; total: number }>;
  create(project: NewProject): Promise<ProjectDetail>;
  update(projectId: string, changes: ProjectChanges): Promise<ProjectDetail>;
  setLifecycle(projectId: string, state: LifecycleState): Promise<ProjectDetail>;
  delete(projectId: string): Promise<void>;
  /** Ids of projects moved to the trash before `cutoff` (at most `limit`). */
  findTrashedBefore(cutoff: Date, limit: number): Promise<string[]>;
  /**
   * Permanently deletes those of `projectIds` that are still in the trash since before `cutoff` (one may have
   * been restored meanwhile) and returns the ids actually deleted.
   */
  deleteTrashed(projectIds: string[], cutoff: Date): Promise<string[]>;
}

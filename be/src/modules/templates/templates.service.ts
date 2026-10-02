import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginate, Paginated, toSkipTake } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { readDimensionLimits } from '../projects/domain/project.policy';
import { QueryHubDto } from './dto/query-hub.dto';

const structureSelect = { select: { id: true, name: true } } as const;

const curatedCardSelect = {
  id: true,
  title: true,
  description: true,
  boxTemplate: structureSelect,
  occasion: true,
  industry: true,
  dimensions: true,
  materialSpec: true,
  thumbnailUrl: true,
  tags: true,
  usesCount: true,
} satisfies Prisma.DesignTemplateSelect;

const communityCardSelect = {
  slug: true,
  title: true,
  template: structureSelect,
  occasion: true,
  industry: true,
  dimensions: true,
  materialSpec: true,
  thumbnailUrl: true,
  tags: true,
  likesCount: true,
  viewsCount: true,
  user: { select: { fullName: true, shopName: true, avatarUrl: true } },
  _count: { select: { forks: true } },
} satisfies Prisma.PackagingProjectSelect;

type CuratedRow = Prisma.DesignTemplateGetPayload<{ select: typeof curatedCardSelect }>;
type CommunityRow = Prisma.PackagingProjectGetPayload<{ select: typeof communityCardSelect }>;

/** A card of the hub grid. Curated cards are opened by `id`, community cards by `slug` (public page). */
const curatedCard = ({ boxTemplate, ...row }: CuratedRow) => ({ ...row, structure: boxTemplate });
const communityCard = ({ template, user, _count, ...row }: CommunityRow) => ({
  ...row,
  structure: template,
  author: user,
  usesCount: _count.forks, // remixes
});

export type CuratedCard = ReturnType<typeof curatedCard>;
export type CommunityCard = ReturnType<typeof communityCard>;

/**
 * Template hub (UC-12): "WrapFit Curated" designs and the community's PUBLIC projects, with the same filters.
 * Simple module: Service -> PrismaService. Responses are cached for a minute by the controller.
 */
@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Box structures available in the project wizard, with the allowed size range of each dimension. */
  async structures() {
    const rows = await this.prisma.boxTemplate.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true, description: true, preview3dUrl: true, formulaSchema: true },
      orderBy: { id: 'asc' },
    });
    return rows.map(({ formulaSchema, ...row }) => ({ ...row, dimensionLimits: readDimensionLimits(formulaSchema) }));
  }

  hub(query: QueryHubDto): Promise<Paginated<CuratedCard> | Paginated<CommunityCard>> {
    return query.section === 'community' ? this.community(query) : this.curated(query);
  }

  /** A curated design with everything needed to start a project from it (UC-13). */
  async findOne(id: string) {
    const row = await this.prisma.designTemplate.findFirst({
      where: { id, isActive: true, boxTemplate: { isActive: true } },
      select: {
        ...curatedCardSelect,
        canvasState: true,
        boxTemplate: { select: { id: true, name: true, formulaSchema: true } },
      },
    });
    if (!row) throw new NotFoundException('Template not found');
    const { boxTemplate, ...template } = row;
    return {
      ...template,
      structure: { id: boxTemplate.id, name: boxTemplate.name },
      // For the "use my gift's size" modal: the new size must stay inside these limits.
      dimensionLimits: readDimensionLimits(boxTemplate.formulaSchema),
    };
  }

  private async curated(query: QueryHubDto): Promise<Paginated<CuratedCard>> {
    const where: Prisma.DesignTemplateWhereInput = {
      isActive: true,
      boxTemplate: { isActive: true },
      boxTemplateId: query.structure,
      occasion: query.occasion,
      industry: query.industry,
      ...(query.material && { materialSpec: { path: ['type'], equals: query.material } }),
      ...(query.q && { OR: this.search(query.q) }),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.designTemplate.findMany({
        where,
        select: curatedCardSelect,
        orderBy: [{ sortOrder: 'asc' }, { usesCount: 'desc' }, { id: 'asc' }],
        ...toSkipTake(query),
      }),
      this.prisma.designTemplate.count({ where }),
    ]);
    return paginate(rows.map(curatedCard), total, query);
  }

  /** PUBLIC projects that are not archived or trashed, most liked first. */
  private async community(query: QueryHubDto): Promise<Paginated<CommunityCard>> {
    const where: Prisma.PackagingProjectWhereInput = {
      visibility: 'PUBLIC',
      status: 'ACTIVE',
      templateId: query.structure,
      occasion: query.occasion,
      industry: query.industry,
      ...(query.material && { materialSpec: { path: ['type'], equals: query.material } }),
      ...(query.q && { OR: this.search(query.q) }),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.packagingProject.findMany({
        where,
        select: communityCardSelect,
        orderBy: [{ likesCount: 'desc' }, { viewsCount: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
        ...toSkipTake(query),
      }),
      this.prisma.packagingProject.count({ where }),
    ]);
    return paginate(rows.map(communityCard), total, query);
  }

  private search(q: string) {
    return [{ title: { contains: q, mode: 'insensitive' as const } }, { tags: { has: q.toLowerCase() } }];
  }
}

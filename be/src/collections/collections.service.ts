import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../shared/prisma';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

export const MAX_COLLECTIONS_PER_USER = 100;

const collectionSelect = {
  id: true,
  title: true,
  description: true,
  colorTag: true,
  createdAt: true,
  updatedAt: true,
  // Projects in the trash are not counted: the folder shows what the user can still work with.
  _count: { select: { projects: { where: { status: { not: 'DELETED' } } } } },
} satisfies Prisma.ProjectCollectionSelect;

type CollectionRow = Prisma.ProjectCollectionGetPayload<{ select: typeof collectionSelect }>;

export interface CollectionView {
  id: string;
  title: string;
  description: string | null;
  colorTag: string | null;
  projectCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const toView = ({ _count, ...collection }: CollectionRow): CollectionView => ({
  ...collection,
  projectCount: _count.projects,
});

/** Folders that group a user's projects (UC-05). Every query is scoped to the owner. */
@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** All collections of the user, most recently changed first (a sidebar list: no pagination). */
  async list(userId: string): Promise<CollectionView[]> {
    const rows = await this.prisma.projectCollection.findMany({
      where: { userId },
      select: collectionSelect,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
    });
    return rows.map(toView);
  }

  async findOne(id: string, userId: string): Promise<CollectionView> {
    const row = await this.prisma.projectCollection.findFirst({ where: { id, userId }, select: collectionSelect });
    if (!row) throw new NotFoundException('Collection not found');
    return toView(row);
  }

  async create(userId: string, dto: CreateCollectionDto): Promise<CollectionView> {
    if ((await this.prisma.projectCollection.count({ where: { userId } })) >= MAX_COLLECTIONS_PER_USER) {
      throw new ConflictException(`You can have at most ${MAX_COLLECTIONS_PER_USER} collections`);
    }
    const row = await this.prisma.projectCollection.create({
      data: { userId, title: dto.title, description: dto.description || null, colorTag: dto.colorTag },
      select: collectionSelect,
    });
    return toView(row);
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto): Promise<CollectionView> {
    await this.assertOwner(id, userId);
    const row = await this.prisma.projectCollection.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description === undefined ? undefined : dto.description || null,
        colorTag: dto.colorTag,
      },
      select: collectionSelect,
    });
    return toView(row);
  }

  /** Deletes the folder only: its projects stay and become uncategorized (`ON DELETE SET NULL`). */
  async remove(id: string, userId: string): Promise<void> {
    const { count } = await this.prisma.projectCollection.deleteMany({ where: { id, userId } });
    if (count === 0) throw new NotFoundException('Collection not found');
  }

  private async assertOwner(id: string, userId: string): Promise<void> {
    if ((await this.prisma.projectCollection.count({ where: { id, userId } })) === 0) {
      throw new NotFoundException('Collection not found');
    }
  }
}

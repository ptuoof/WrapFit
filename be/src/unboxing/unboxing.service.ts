import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { AppConfigService } from '../config/config.interface';
import { PrismaService } from '../shared/prisma/prisma.service';
import { assetUrl, toClientCanvas } from '../storage/asset-keys';
import { StorageService } from '../storage/storage.service';
import { authorSelect, presentAuthor } from '../users/user.select';
import { SaveUnboxingDto } from './dto/save-unboxing.dto';
import { qrPng, qrSvg } from './qr-code';

const configSelect = {
  projectId: true,
  slug: true,
  recipientName: true,
  giftNote: true,
  audioTrackUrl: true,
  particleEffect: true,
  viewsCount: true,
  createdAt: true,
} satisfies Prisma.UnboxingExperienceSelect;

type ConfigRow = Prisma.UnboxingExperienceGetPayload<{ select: typeof configSelect }>;

/**
 * 3D unboxing experience (UC "Mở hộp 3D qua QR"): a gift note, music and particle effect shown when the recipient
 * scans the QR code printed on the box bottom. One experience per project; its slug never changes once created,
 * because the QR code may already be printed.
 */
@Injectable()
export class UnboxingService {
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    config: ConfigService,
  ) {
    this.frontendUrl = (config as unknown as AppConfigService).get('FRONTEND_URL', { infer: true }).replace(/\/+$/, '');
  }

  /** The page the QR code opens (Next.js route /unbox/[slug]). */
  unboxUrl(slug: string): string {
    return `${this.frontendUrl}/unbox/${slug}`;
  }

  async find(projectId: string) {
    const row = await this.prisma.unboxingExperience.findUnique({ where: { projectId }, select: configSelect });
    if (!row) throw new NotFoundException('This project has no unboxing experience yet');
    return this.view(row);
  }

  /** Creates or replaces the configuration, then (re)generates the QR code files. */
  async save(projectId: string, userId: string, dto: SaveUnboxingDto) {
    const project = await this.prisma.packagingProject.findUniqueOrThrow({
      where: { id: projectId },
      select: { status: true },
    });
    if (project.status === 'DELETED') {
      throw new ConflictException('Restore the project from the trash before setting up its unboxing');
    }

    const data = {
      recipientName: dto.recipientName,
      giftNote: dto.giftNote,
      audioTrackUrl: dto.audioTrackUrl ?? null,
      particleEffect: dto.particleEffect ?? 'confetti',
    };
    const existed = (await this.prisma.unboxingExperience.count({ where: { projectId } })) > 0;
    const row = await this.prisma.unboxingExperience.upsert({
      where: { projectId },
      create: { projectId, ...data },
      update: data,
      select: configSelect,
    });

    // Regenerated on every save so the code always points at the current FRONTEND_URL.
    await this.storeQrCode(projectId, userId, row.slug);
    return { created: !existed, experience: this.view(row) };
  }

  async remove(projectId: string): Promise<void> {
    const row = await this.prisma.unboxingExperience.findUnique({ where: { projectId }, select: { slug: true } });
    if (!row) throw new NotFoundException('This project has no unboxing experience yet');

    const keys = Object.values(this.qrKeys(projectId, row.slug));
    await this.prisma.$transaction([
      this.prisma.unboxingExperience.delete({ where: { projectId } }),
      this.prisma.storedFile.deleteMany({ where: { key: { in: keys } } }),
    ]);
    await this.storage.deleteObjects(keys);
  }

  /** QR code image generated on the fly (works without object storage). */
  async qrImage(projectId: string, format: 'png' | 'svg') {
    const { slug } = await this.find(projectId);
    const url = this.unboxUrl(slug);
    return {
      fileName: `wrapfit-qr-${slug}.${format}`,
      contentType: format === 'png' ? 'image/png' : 'image/svg+xml',
      body: format === 'png' ? await qrPng(url) : Buffer.from(await qrSvg(url)),
    };
  }

  /** Data for the public unboxing page. The slug is the secret: it works even when the design itself is PRIVATE. */
  async publicView(slug: string) {
    const row = await this.prisma.unboxingExperience.findUnique({
      where: { slug },
      select: {
        ...configSelect,
        project: {
          select: {
            status: true,
            title: true,
            template: { select: { id: true, name: true } },
            dimensions: true,
            materialSpec: true,
            canvasState: true,
            thumbnailKey: true,
            user: { select: authorSelect },
          },
        },
      },
    });
    if (!row || row.project.status === 'DELETED') throw new NotFoundException('Unboxing not found');

    const { viewsCount } = await this.prisma.unboxingExperience.update({
      where: { slug },
      data: { viewsCount: { increment: 1 } },
      select: { viewsCount: true },
    });
    const { status: _status, user, thumbnailKey, canvasState, ...box } = row.project;
    return {
      recipientName: row.recipientName,
      giftNote: row.giftNote,
      audioTrackUrl: row.audioTrackUrl,
      particleEffect: row.particleEffect,
      viewsCount,
      sender: presentAuthor(user),
      box: { ...box, canvasState: toClientCanvas(canvasState as never), thumbnailUrl: assetUrl(thumbnailKey) },
    };
  }

  private qrKeys(projectId: string, slug: string) {
    const base = `projects/${projectId}/unboxing/qr-${slug}`;
    return { png: `${base}.png`, svg: `${base}.svg` };
  }

  /** Uploads PNG + SVG (nothing while object storage is not configured). */
  private async storeQrCode(projectId: string, userId: string, slug: string): Promise<void> {
    if (!this.storage.enabled) return;
    const url = this.unboxUrl(slug);
    const keys = this.qrKeys(projectId, slug);
    const common = { userId, projectId, purpose: 'QR_CODE' as const };
    await Promise.all([
      this.storage.putGeneratedFile({ ...common, key: keys.png, contentType: 'image/png', body: await qrPng(url) }),
      this.storage.putGeneratedFile({
        ...common,
        key: keys.svg,
        contentType: 'image/svg+xml',
        body: Buffer.from(await qrSvg(url)),
      }),
    ]);
  }

  /** The QR files have fixed keys: their URLs are computed (null while object storage is not configured). */
  private view({ projectId, ...row }: ConfigRow) {
    const keys = this.qrKeys(projectId, row.slug);
    const urlOf = (key: string) => (this.storage.enabled ? assetUrl(key) : null);
    return {
      ...row,
      qrCodeUrl: urlOf(keys.png),
      unboxUrl: this.unboxUrl(row.slug),
      // The vector file for the print export.
      qrCodeSvgUrl: urlOf(keys.svg),
    };
  }
}

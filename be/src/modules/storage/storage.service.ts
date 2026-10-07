import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { FilePurpose, Prisma } from '@prisma/client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { AppConfigService } from '../../config/app-config.type';
import { PrismaService } from '../../prisma/prisma.service';
import type { IProjectFiles, ProjectFile } from '../projects/application/ports/project-files.port';
import { PresignUploadDto } from './dto/presign-upload.dto';
import {
  CONFIRM_UPLOADS_AFTER_MS,
  PENDING_UPLOAD_RESERVE_MS,
  STORAGE_QUOTA_BYTES,
  UPLOAD_RULES,
  UPLOAD_URL_TTL_SECONDS,
} from './storage.rules';

export interface PresignedUpload {
  fileId: string;
  key: string;
  /** PUT the raw file here, with exactly the headers below, before `expiresIn` seconds. */
  uploadUrl: string;
  method: 'PUT';
  headers: { 'Content-Type': string };
  /** Public URL of the file once uploaded (use it in canvasState, thumbnailUrl, avatarUrl...). */
  fileUrl: string;
  expiresIn: number;
}

const DELETE_BATCH = 1000; // S3 DeleteObjects limit
/** Rows handled per maintenance run (StorageMaintenanceTask); the rest wait for the next run. */
const MAINTENANCE_BATCH = 200;
/** A bucket object that still cannot be deleted after this many retries is left for an operator (logged). */
const MAX_DELETE_ATTEMPTS = 10;

/** Prisma client or transaction client: quota reads run inside the transaction that records the upload. */
type Db = Prisma.TransactionClient;

/**
 * S3-compatible object storage (Cloudflare R2 in production, SeaweedFS locally). The browser uploads directly
 * with a pre-signed PUT URL whose signature locks the Content-Type and Content-Length, so the API never
 * streams file bytes. Disabled (503) while STORAGE_BUCKET is empty.
 */
@Injectable()
export class StorageService implements IProjectFiles {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly client?: S3Client;
  /** Signs URLs with the address the browser uses (may differ from the server's, e.g. inside Docker). */
  private readonly signer?: S3Client;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const env = config as unknown as AppConfigService;
    this.bucket = env.get('STORAGE_BUCKET', { infer: true });
    this.publicUrl = env.get('STORAGE_PUBLIC_URL', { infer: true }).replace(/\/+$/, '');
    if (!this.bucket) return;

    const endpoint = env.get('STORAGE_ENDPOINT', { infer: true }) || undefined;
    const base: S3ClientConfig = {
      region: env.get('STORAGE_REGION', { infer: true }),
      forcePathStyle: env.get('STORAGE_FORCE_PATH_STYLE', { infer: true }) === 'true',
      credentials: {
        accessKeyId: env.get('STORAGE_ACCESS_KEY_ID', { infer: true }),
        secretAccessKey: env.get('STORAGE_SECRET_ACCESS_KEY', { infer: true }),
      },
      // Newer SDKs add CRC32 checksums by default; browsers would have to send them, and R2 / SeaweedFS do not need them.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    };
    this.client = new S3Client({ ...base, endpoint });
    this.signer = new S3Client({ ...base, endpoint: env.get('STORAGE_PUBLIC_ENDPOINT', { infer: true }) || endpoint });
  }

  get enabled(): boolean {
    return this.client !== undefined;
  }

  async presignUpload(userId: string, dto: PresignUploadDto): Promise<PresignedUpload> {
    if (!this.signer) throw new ServiceUnavailableException('File upload is not configured');

    const rule = UPLOAD_RULES[dto.purpose];
    const extension = rule.types[dto.contentType];
    if (!extension) {
      throw new BadRequestException(`contentType must be one of: ${Object.keys(rule.types).join(', ')}`);
    }
    if (dto.size > rule.maxBytes) {
      throw new HttpException(
        `A ${dto.purpose} file can be at most ${rule.maxBytes / 1024 / 1024} MB`,
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }
    if (dto.projectId) await this.assertEditableProject(dto.projectId, userId);

    const key = `users/${userId}/${dto.purpose.toLowerCase()}/${randomUUID()}.${extension}`;
    // Check and reserve the space in one transaction, serialized per user: parallel requests cannot all pass the check.
    const file = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(4801, hashtext(${userId}))`;
      await this.assertQuota(tx, userId, dto.size);
      return tx.storedFile.create({
        data: { userId, projectId: dto.projectId, key, purpose: dto.purpose, contentType: dto.contentType, size: dto.size },
        select: { id: true },
      });
    });

    const uploadUrl = await getSignedUrl(
      this.signer,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: dto.contentType, ContentLength: dto.size }),
      { expiresIn: UPLOAD_URL_TTL_SECONDS, signableHeaders: new Set(['content-type', 'content-length']) },
    );

    return {
      fileId: file.id,
      key,
      uploadUrl,
      method: 'PUT',
      headers: { 'Content-Type': dto.contentType },
      fileUrl: `${this.publicUrl}/${key}`,
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    };
  }

  /**
   * Stores a file generated by the backend (e.g. a QR code) and records it like an upload, so it counts in the
   * owner's usage and is deleted with its project. Writing the same key again replaces the file.
   * Returns the public URL, or null while storage is not configured.
   */
  async putGeneratedFile(file: {
    userId: string;
    projectId?: string;
    key: string;
    purpose: FilePurpose;
    contentType: string;
    body: Buffer;
  }): Promise<string | null> {
    if (!this.client) return null;
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: file.key, ContentType: file.contentType, Body: file.body }),
    );
    const record = {
      userId: file.userId,
      projectId: file.projectId,
      purpose: file.purpose,
      contentType: file.contentType,
      size: file.body.length,
      confirmedAt: new Date(), // written by the server itself: it exists
    };
    await this.prisma.storedFile.upsert({
      where: { key: file.key },
      create: { key: file.key, ...record },
      update: record,
    });
    return `${this.publicUrl}/${file.key}`;
  }

  /**
   * Key of a file uploaded by a user (`users/...`) from its public URL, or null for any other URL. The scheme is
   * ignored (clients may store the https form of the URL).
   */
  uploadedKeyOf(url: string): string | null {
    if (!this.publicUrl) return null;
    const strip = (value: string) => value.replace(/^https?:\/\//, '');
    const base = `${strip(this.publicUrl)}/`;
    const target = strip(url).split(/[?#]/)[0];
    if (!target.startsWith(base)) return null;
    const key = decodeURIComponent(target.slice(base.length));
    return key.startsWith('users/') ? key : null;
  }

  /** Downloads a file from the bucket (print exports embed the user's images). */
  async getObject(key: string): Promise<{ body: Buffer; contentType: string }> {
    if (!this.client) throw new ServiceUnavailableException('File storage is not configured');
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    const bytes = await result.Body!.transformToByteArray();
    return { body: Buffer.from(bytes), contentType: result.ContentType ?? 'application/octet-stream' };
  }

  /** Short-lived download link that saves the file under `fileName` (print exports). */
  presignDownload(key: string, fileName: string, expiresIn: number): Promise<string> {
    if (!this.signer) throw new ServiceUnavailableException('File storage is not configured');
    return getSignedUrl(
      this.signer,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${fileName.replace(/[^\w.-]/g, '_')}"`,
      }),
      { expiresIn },
    );
  }

  /**
   * Counts confirmed files, plus recent uploads not confirmed yet (their space is reserved while the browser
   * uploads). Uploads that never happened stop counting after PENDING_UPLOAD_RESERVE_MS and are then removed.
   */
  async usage(userId: string, db: Db = this.prisma) {
    const pendingSince = new Date(Date.now() - PENDING_UPLOAD_RESERVE_MS);
    const [user, files] = await Promise.all([
      db.user.findUniqueOrThrow({ where: { id: userId }, select: { subscriptionTier: true } }),
      db.storedFile.aggregate({
        where: { userId, OR: [{ confirmedAt: { not: null } }, { createdAt: { gt: pendingSince } }] },
        _sum: { size: true },
        _count: true,
      }),
    ]);
    return {
      tier: user.subscriptionTier,
      usedBytes: files._sum.size ?? 0,
      quotaBytes: STORAGE_QUOTA_BYTES[user.subscriptionTier],
      fileCount: files._count,
    };
  }

  async detachSharedFiles(projectIds: string[]): Promise<void> {
    if (!projectIds.length) return;
    // Only canvas assets are copied by duplicate / remix; QR codes, exports and thumbnails stay with their project.
    await this.prisma.$executeRaw`
      UPDATE stored_files f SET project_id = NULL
      WHERE f.project_id = ANY(${projectIds}::uuid[]) AND f.purpose IN ('LOGO', 'IMAGE')
        AND (
          EXISTS (SELECT 1 FROM packaging_projects p
                  WHERE p.id <> ALL(${projectIds}::uuid[]) AND strpos(p.canvas_state::text, f.key) > 0)
          OR EXISTS (SELECT 1 FROM project_snapshots s
                     WHERE s.project_id <> ALL(${projectIds}::uuid[]) AND strpos(s.canvas_state::text, f.key) > 0)
        )`;
  }

  /**
   * Keys of the objects to delete with a user: their uploads and the generated files of their projects, except the
   * uploads that projects of other users still show (a remix copies the canvas with its image URLs). Read it before
   * deleting the user: the file rows go away with them (ON DELETE CASCADE).
   */
  async listUserFiles(userId: string): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ key: string }[]>`
      SELECT f.key FROM stored_files f
      LEFT JOIN packaging_projects owner ON owner.id = f.project_id
      WHERE (f.user_id = ${userId}::uuid OR owner.user_id = ${userId}::uuid)
        AND NOT (f.purpose IN ('LOGO', 'IMAGE') AND (
          EXISTS (SELECT 1 FROM packaging_projects p
                  WHERE p.user_id <> ${userId}::uuid AND strpos(p.canvas_state::text, f.key) > 0)
          OR EXISTS (SELECT 1 FROM project_snapshots s JOIN packaging_projects sp ON sp.id = s.project_id
                     WHERE sp.user_id <> ${userId}::uuid AND strpos(s.canvas_state::text, f.key) > 0)
        ))`;
    return rows.map((row) => row.key);
  }

  listProjectFiles(projectIds: string[]): Promise<ProjectFile[]> {
    if (!projectIds.length) return Promise.resolve([]);
    return this.prisma.storedFile.findMany({
      where: { projectId: { in: projectIds } },
      select: { projectId: true, key: true },
    }) as Promise<ProjectFile[]>;
  }

  /**
   * Never throws: a file that could not be deleted only costs storage, it must not block a project deletion.
   * Keys that failed are recorded in `orphaned_objects` and retried by StorageMaintenanceTask.
   */
  async deleteObjects(keys: string[]): Promise<void> {
    const failed = await this.tryDeleteObjects(keys);
    if (!failed.length) return;
    try {
      await this.prisma.orphanedObject.createMany({
        data: failed.map(({ key, error }) => ({ key, lastError: error.slice(0, 1000) })),
        skipDuplicates: true,
      });
    } catch (error) {
      this.logger.error(
        `Could not record ${failed.length} undeleted file(s): ${failed.map((f) => f.key).join(', ')}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Called by StorageMaintenanceTask. Checks the uploads whose pre-signed URL has expired: the row is confirmed with
   * the real size when the object exists, and deleted when the browser never uploaded it (it would otherwise count
   * against the quota forever).
   */
  async confirmPendingUploads(now = new Date()): Promise<{ confirmed: number; dropped: number }> {
    const result = { confirmed: 0, dropped: 0 };
    if (!this.client) return result;
    const pending = await this.prisma.storedFile.findMany({
      where: { confirmedAt: null, createdAt: { lt: new Date(now.getTime() - CONFIRM_UPLOADS_AFTER_MS) } },
      select: { id: true, key: true },
      orderBy: { createdAt: 'asc' },
      take: MAINTENANCE_BATCH,
    });
    for (const file of pending) {
      const size = await this.objectSize(file.key);
      if (size === undefined) continue; // storage unreachable: next run
      if (size === null) {
        const { count } = await this.prisma.storedFile.deleteMany({ where: { id: file.id, confirmedAt: null } });
        result.dropped += count;
      } else {
        await this.prisma.storedFile.updateMany({ where: { id: file.id }, data: { confirmedAt: now, size } });
        result.confirmed++;
      }
    }
    return result;
  }

  /** Called by StorageMaintenanceTask: retries deleting orphaned objects. Returns how many are gone. */
  async retryOrphanedObjects(): Promise<number> {
    if (!this.client) return 0;
    const orphans = await this.prisma.orphanedObject.findMany({
      where: { attempts: { lt: MAX_DELETE_ATTEMPTS } },
      select: { key: true },
      orderBy: { createdAt: 'asc' },
      take: MAINTENANCE_BATCH,
    });
    if (!orphans.length) return 0;

    const failed = await this.tryDeleteObjects(orphans.map((orphan) => orphan.key));
    const failedKeys = new Set(failed.map((f) => f.key));
    const deleted = orphans.map((orphan) => orphan.key).filter((key) => !failedKeys.has(key));
    if (deleted.length) await this.prisma.orphanedObject.deleteMany({ where: { key: { in: deleted } } });
    for (const { key, error } of failed) {
      const row = await this.prisma.orphanedObject.update({
        where: { key },
        data: { attempts: { increment: 1 }, lastError: error.slice(0, 1000) },
        select: { attempts: true },
      });
      if (row.attempts >= MAX_DELETE_ATTEMPTS) this.logger.error(`Giving up deleting ${key}: ${error}`);
    }
    return deleted.length;
  }

  /** Deletes objects in batches and returns the keys that could not be deleted, with the reason. */
  private async tryDeleteObjects(keys: string[]): Promise<{ key: string; error: string }[]> {
    if (!this.client || !keys.length) return [];
    const failed: { key: string; error: string }[] = [];
    for (let i = 0; i < keys.length; i += DELETE_BATCH) {
      const batch = keys.slice(i, i + DELETE_BATCH);
      try {
        const result = await this.client.send(
          new DeleteObjectsCommand({ Bucket: this.bucket, Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true } }),
        );
        for (const error of result.Errors ?? []) {
          this.logger.warn(`Could not delete ${error.Key}: ${error.Message}`);
          if (error.Key) failed.push({ key: error.Key, error: error.Message ?? 'unknown error' });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Could not delete ${batch.length} file(s): ${message}`);
        failed.push(...batch.map((key) => ({ key, error: message })));
      }
    }
    return failed;
  }

  /** Size of an object in bytes, `null` when it does not exist, `undefined` when storage could not be reached. */
  private async objectSize(key: string): Promise<number | null | undefined> {
    try {
      const head = await this.client!.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return head.ContentLength ?? 0;
    } catch (error) {
      if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return null;
      this.logger.warn(`Could not check ${key}: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }
  }

  private async assertEditableProject(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.packagingProject.findUnique({
      where: { id: projectId },
      select: { userId: true, status: true },
    });
    if (project?.userId !== userId) throw new NotFoundException('Project not found');
    if (project.status === 'DELETED') {
      throw new ConflictException('Restore the project from the trash before uploading files to it');
    }
  }

  private async assertQuota(db: Db, userId: string, size: number): Promise<void> {
    const { usedBytes, quotaBytes } = await this.usage(userId, db);
    if (usedBytes + size > quotaBytes) {
      throw new ForbiddenException(
        `Storage quota exceeded: ${Math.ceil(usedBytes / 1024 / 1024)} MB of ${quotaBytes / 1024 / 1024} MB used`,
      );
    }
  }
}

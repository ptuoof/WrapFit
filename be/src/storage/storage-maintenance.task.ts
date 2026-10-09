import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { StorageService } from './storage.service';

/**
 * Every 10 minutes (API process): confirms or drops the uploads whose pre-signed URL has expired, so the quota only
 * counts files that exist, and retries deleting bucket objects that a deletion left behind.
 * Running it on several instances at once is harmless.
 */
@Injectable()
export class StorageMaintenanceTask {
  private readonly logger = new Logger(StorageMaintenanceTask.name);

  constructor(private readonly storage: StorageService) {}

  @Interval('storage-maintenance', 10 * 60 * 1000)
  async run(): Promise<void> {
    try {
      const { confirmed, dropped } = await this.storage.confirmPendingUploads();
      const deleted = await this.storage.retryOrphanedObjects();
      if (confirmed || dropped || deleted) {
        this.logger.log(
          `Uploads: ${confirmed} confirmed, ${dropped} never uploaded; orphaned objects deleted: ${deleted}`,
        );
      }
    } catch (error) {
      // The database or the bucket is down: the next run retries.
      this.logger.error('Storage maintenance failed', error instanceof Error ? error.stack : String(error));
    }
  }
}

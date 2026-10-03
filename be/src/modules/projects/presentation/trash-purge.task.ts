import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProjectsService } from '../application/projects.service';

/**
 * Every day at 02:00 (Vietnam time), permanently deletes the projects that have been in the trash for
 * more than 30 days (UC-04). Running it twice, or on several instances at once, is harmless.
 */
@Injectable()
export class TrashPurgeTask {
  private readonly logger = new Logger(TrashPurgeTask.name);

  constructor(private readonly projects: ProjectsService) {}

  @Cron('0 2 * * *', { name: 'trash-purge', timeZone: 'Asia/Ho_Chi_Minh' })
  async run(): Promise<void> {
    try {
      const count = await this.projects.purgeExpiredTrash();
      if (count > 0) this.logger.log(`Purged ${count} project(s) from the trash`);
    } catch (error) {
      // A failed run is retried by the next day's run; never let it crash the process.
      this.logger.error('Trash purge failed', error instanceof Error ? error.stack : String(error));
    }
  }
}

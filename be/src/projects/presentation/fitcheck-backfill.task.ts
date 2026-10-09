import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ProjectsService } from '../application/projects.service';

/**
 * At startup, gives a FitCheck score to the projects saved before scores were stored, so they can be listed in the
 * community template hub (UC-14). Only projects without a score are read: after the first run it is a single query.
 */
@Injectable()
export class FitCheckBackfillTask implements OnApplicationBootstrap {
  private readonly logger = new Logger(FitCheckBackfillTask.name);

  constructor(private readonly projects: ProjectsService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const count = await this.projects.backfillFitChecks();
      if (count > 0) this.logger.log(`Computed the FitCheck of ${count} project(s)`);
    } catch (error) {
      // Not critical: the next start retries, and every save recomputes the score anyway.
      this.logger.error('FitCheck backfill failed', error instanceof Error ? error.stack : String(error));
    }
  }
}

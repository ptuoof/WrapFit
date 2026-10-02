import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { PublicProjectsController } from './public-projects.controller';
import { PublicProjectsService } from './public-projects.service';

/** Public page, remix and likes (UC-08 to UC-11). Simple module: Controller -> Service -> Prisma. */
@Module({
  imports: [ProjectsModule],
  controllers: [PublicProjectsController],
  providers: [PublicProjectsService],
})
export class PublicShowcaseModule {}

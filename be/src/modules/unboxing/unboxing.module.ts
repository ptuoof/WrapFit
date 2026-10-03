import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { PublicUnboxingController, UnboxingController } from './unboxing.controller';
import { UnboxingService } from './unboxing.service';

/** 3D unboxing experience & QR code. Uses ProjectOwnerGuard (projects) and the global StorageService. */
@Module({
  imports: [ProjectsModule],
  controllers: [UnboxingController, PublicUnboxingController],
  providers: [UnboxingService],
})
export class UnboxingModule {}

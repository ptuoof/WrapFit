import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';

/** Template hub (UC-12, UC-13). Simple module: Controller -> Service -> PrismaService, in-memory cache. */
@Module({
  imports: [CacheModule.register()],
  controllers: [TemplatesController],
  providers: [TemplatesService],
})
export class TemplatesModule {}

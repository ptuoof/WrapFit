import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EXPORT_QUEUE } from '../export';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [BullModule.registerQueue({ name: EXPORT_QUEUE })],
  controllers: [HealthController],
})
export class BaseModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { queueRootModule } from './common/queue.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpThrottlerGuard } from './common/guards/http-throttler.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfigService } from './config/app-config.type';
import { validateEnv } from './config/env.validation';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExportModule } from './modules/export/export.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PublicShowcaseModule } from './modules/public-showcase/public-showcase.module';
import { StorageModule } from './modules/storage/storage.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { UnboxingModule } from './modules/unboxing/unboxing.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const env = config as unknown as AppConfigService;
        return [
          {
            ttl: env.get('THROTTLE_TTL_SECONDS', { infer: true }) * 1000,
            limit: env.get('THROTTLE_LIMIT', { infer: true }),
          },
        ];
      },
    }),
    ScheduleModule.forRoot(), // @Cron tasks, e.g. TrashPurgeTask
    EventEmitterModule.forRoot(), // internal events, e.g. project.forked
    PrismaModule,
    StorageModule,
    queueRootModule('producer'), // BullMQ (Redis): jobs are processed by src/worker.ts
    AuthModule,
    UsersModule,
    ProjectsModule,
    CollectionsModule,
    PublicShowcaseModule,
    TemplatesModule,
    AiModule,
    UnboxingModule,
    ExportModule,
    EventsModule,
    HealthModule,
  ],
  providers: [
    // Guards run in this order: rate limit -> authentication -> role check.
    { provide: APP_GUARD, useClass: HttpThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}

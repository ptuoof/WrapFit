import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { middleware } from './app.middleware';
import { createAppLogger } from './config/logger.config';
import { AppConfigService } from './config/config.interface';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createAppLogger(),
  });
  middleware(app);
  setupSwagger(app);

  const config = app.get(ConfigService) as unknown as AppConfigService;
  const port = config.get('PORT', { infer: true });
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API:     http://localhost:${port}/api`);
  logger.log(`Health:  http://localhost:${port}/api/health`);
  if (config.get('SWAGGER_ENABLED', { infer: true }) === 'true') {
    logger.log(`Swagger: http://localhost:${port}/api/docs`);
  }
}

bootstrap();

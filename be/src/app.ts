import { Logger } from '@nestjs/common';
import { ConfigService } from './common/providers/config.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { middleware } from './app.middleware';
import { createAppLogger } from './config/logger.config';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createAppLogger(),
  });
  middleware(app);
  setupSwagger(app);

  const config = app.get(ConfigService);
  const port = config.get('app.port');
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API:     http://localhost:${port}/api`);
  logger.log(`Health:  http://localhost:${port}/api/health`);
  if (config.get('app.swaggerEnabled')) {
    logger.log(`Swagger: http://localhost:${port}/api/docs`);
  }
}

bootstrap();

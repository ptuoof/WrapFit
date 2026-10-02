import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from './config/app-config.type';
import { ACCESS_COOKIE } from './modules/auth/auth.constants';

export function setupSwagger(app: INestApplication): void {
  const config = app.get(ConfigService) as unknown as AppConfigService;
  if (config.get('SWAGGER_ENABLED', { infer: true }) !== 'true') return;

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('WrapFit API')
      .setDescription(
        'WrapFit platform REST API. Authentication uses HttpOnly cookies: call `POST /api/auth/login` from this page and ' +
          'the browser sends the `wf_access` cookie on every following request. Real-time events: Socket.IO namespace ' +
          '`/events` at path `/api/socket.io`.',
      )
      .setVersion('1.0')
      .addCookieAuth(ACCESS_COOKIE)
      .addBearerAuth()
      .build(),
  );

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}

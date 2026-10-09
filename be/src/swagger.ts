import { INestApplication } from '@nestjs/common';
import { ConfigService } from './common/providers/config.service';
import { DocumentBuilder, getSchemaPath, SwaggerModule } from '@nestjs/swagger';
import { ErrorResponseDto } from './common/dto/error-response.dto';
import { ACCESS_COOKIE } from './auth/auth.constants';

export function setupSwagger(app: INestApplication): void {
  const config = app.get(ConfigService);
  if (!config.get('app.swaggerEnabled')) return;

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
    { extraModels: [ErrorResponseDto] },
  );

  // Every operation documents the common error body (status codes are listed in docs/03_API_DESIGN.md).
  const errorResponse = {
    description: 'Error (4xx / 5xx), normalized by AllExceptionsFilter',
    content: { 'application/json': { schema: { $ref: getSchemaPath(ErrorResponseDto) } } },
  };
  for (const pathItem of Object.values(document.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (operation && typeof operation === 'object' && 'responses' in operation) {
        operation.responses.default ??= errorResponse;
      }
    }
  }

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}

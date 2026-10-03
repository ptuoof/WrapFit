import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    const log = (status: number) =>
      this.logger.log(`${request.method} ${request.originalUrl} ${status} +${Date.now() - startedAt}ms`);

    return next.handle().pipe(
      tap({
        next: () => log(response.statusCode),
        error: (error: unknown) => log(error instanceof HttpException ? error.getStatus() : 500),
      }),
    );
  }
}

import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { currentRequestId } from '../common/context/request-context';

type JsonLogOptions = {
  context: string;
  logLevel: LogLevel;
  writeStreamType?: 'stdout' | 'stderr';
  errorStack?: unknown;
};

/**
 * Nest console logger that adds the request id (see request-context.ts) to every line, so the logs of one request,
 * and of the export job it queued, can be found together. One JSON object per line in production
 * (LOG_FORMAT=json, the default when NODE_ENV=production), readable colored text in development.
 */
export class AppLogger extends ConsoleLogger {
  protected getJsonLogObject(message: unknown, options: JsonLogOptions) {
    const requestId = currentRequestId();
    return {
      ...super.getJsonLogObject(message, options),
      ...(requestId && { requestId }),
    };
  }

  protected formatContext(context: string): string {
    const requestId = currentRequestId();
    if (!requestId) return super.formatContext(context);
    return super.formatContext(context ? `${context}] [${requestId}` : requestId);
  }
}

/** Logger of a process (API or worker). Read from process.env directly: it is created before ConfigModule. */
export function createAppLogger(): AppLogger {
  const format = process.env.LOG_FORMAT || (process.env.NODE_ENV === 'production' ? 'json' : 'text');
  return new AppLogger({ json: format === 'json' });
}

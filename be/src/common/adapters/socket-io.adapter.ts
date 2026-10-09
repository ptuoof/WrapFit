import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { isAllowedOrigin } from '../utils/cors.util';

/**
 * Socket.IO adapter that reuses the HTTP CORS configuration from the environment. CORS only covers the polling
 * transport: `allowRequest` also refuses a WebSocket handshake that a browser sends from another origin (the
 * `wf_access` cookie would otherwise travel with it). Clients without `Origin` (not a browser) still need a token.
 */
export class SocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly corsOrigins: '*' | string[],
    /** `allowedOrigins()`: null = any origin (CORS_ORIGINS is "*"). */
    private readonly allowedOrigins: Set<string> | null,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const serverOptions: Partial<ServerOptions> = {
      ...options,
      cors: { origin: this.corsOrigins, credentials: this.corsOrigins !== '*' },
      allowRequest: (req, callback) => {
        const origin = req.headers.origin;
        callback(null, !this.allowedOrigins || !origin || isAllowedOrigin(origin, this.allowedOrigins, req.headers.host));
      },
    };
    return super.createIOServer(port, serverOptions);
  }
}

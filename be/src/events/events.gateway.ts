import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Role } from '@prisma/client';
import { parse as parseCookies } from 'cookie';
import { Namespace, Socket } from 'socket.io';
import { ACCESS_COOKIE, AuthUser, ConfigService, JwtPayload } from '../common';
import { PrismaService } from '../shared/prisma';

/**
 * Real-time channel: Socket.IO namespace `/events`, served under `/api/socket.io` so that the `wf_access`
 * cookie (path `/api`) is sent with the handshake and the Next.js `/api/*` proxy covers it.
 *
 * Browser:  io(`${API_ORIGIN}/events`, { path: '/api/socket.io', withCredentials: true })
 * Other clients may pass the access token instead: { auth: { token: '<accessToken>' } }
 * Every socket joins the room `user:<id>` (and `admins` for admins).
 */
@WebSocketGateway({ namespace: 'events', path: '/api/socket.io' })
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  private server: Namespace;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Namespace): void {
    // Handshake authentication: reject the connection before it is established.
    server.use(async (socket, next) => {
      try {
        const token = this.extractToken(socket);
        if (!token) throw new Error('Missing token');

        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: this.config.get('auth.jwt.accessSecret'),
        });
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, email: true, role: true, isActive: true },
        });
        if (!user || !user.isActive) throw new Error('Inactive user');

        const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
        socket.data.user = authUser;
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  async handleConnection(client: Socket): Promise<void> {
    const user = client.data.user as AuthUser;
    await client.join(`user:${user.id}`);
    if (user.role === Role.ADMIN) await client.join('admins');
    this.logger.log(`Client connected: ${client.id} (user ${user.id})`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  /** Sends an event to every connected client. */
  emitToAll(event: string, payload: unknown): void {
    this.server.emit(event, payload);
  }

  /** Sends an event to all sockets of one user (any device). */
  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  private extractToken(socket: Socket): string | undefined {
    const fromAuth = socket.handshake.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth) return fromAuth;

    const header = socket.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) return header.slice(7);

    const cookieHeader = socket.handshake.headers.cookie;
    return cookieHeader ? parseCookies(cookieHeader)[ACCESS_COOKIE] : undefined;
  }
}

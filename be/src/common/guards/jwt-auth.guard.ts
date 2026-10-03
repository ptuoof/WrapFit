import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, OPTIONAL_AUTH_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // WebSocket connections are authenticated in the gateway's handshake middleware.
    if (context.getType() !== 'http') return true;

    if (this.flag(context, OPTIONAL_AUTH_KEY)) {
      // handleRequest() never throws here, so a missing or bad token just means "anonymous".
      await (super.canActivate(context) as Promise<boolean>);
      return true;
    }
    if (this.flag(context, IS_PUBLIC_KEY)) return true;

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser>(err: unknown, user: TUser | false, _info: unknown, context: ExecutionContext): TUser {
    if (this.flag(context, OPTIONAL_AUTH_KEY)) return (user || undefined) as TUser;
    if (err || !user) throw err instanceof Error ? err : new UnauthorizedException();
    return user;
  }

  private flag(context: ExecutionContext, key: string): boolean {
    return this.reflector.getAllAndOverride<boolean>(key, [context.getHandler(), context.getClass()]) === true;
  }
}

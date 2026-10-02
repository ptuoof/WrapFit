import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../interfaces/auth.interfaces';

/** Injects `request.user`, or one of its fields: `@CurrentUser('id') userId: string`. */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<{ user?: AuthUser }>().user;
    return field ? user?.[field] : user;
  },
);

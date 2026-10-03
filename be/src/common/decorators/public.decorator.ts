import { applyDecorators, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const OPTIONAL_AUTH_KEY = 'optionalAuth';

/** Marks a route as accessible without a JWT (all routes require auth by default). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Public route that still identifies the caller when a valid access token is sent:
 * `@CurrentUser()` is the user, or `undefined` for anonymous visitors. Invalid or expired tokens
 * are treated as anonymous instead of answering 401.
 */
export const OptionalAuth = () => applyDecorators(Public(), SetMetadata(OPTIONAL_AUTH_KEY, true));

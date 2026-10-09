import { createHash } from 'crypto';
import type { Redis } from 'ioredis';

/** Seconds during which one viewer counts a single view of a page. */
export const VIEW_DEDUP_SECONDS = 600;

/** Who opens a public page: the signed-in user, otherwise the IP address and the browser. */
export interface Viewer {
  userId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * True the first time `viewer` opens `page` within VIEW_DEDUP_SECONDS: reloading or scripting the public page from
 * one place no longer inflates the view counter (it orders the community hub). While Redis is down every view counts.
 * The key holds a hash, never the IP address.
 */
export async function isFirstView(redis: Redis, page: string, viewer: Viewer): Promise<boolean> {
  const who = viewer.userId
    ? `user:${viewer.userId}`
    : `anon:${createHash('sha256').update(`${viewer.ip ?? ''}|${viewer.userAgent ?? ''}`).digest('hex').slice(0, 32)}`;
  try {
    return (await redis.set(`wrapfit:view:${page}:${who}`, '1', 'EX', VIEW_DEDUP_SECONDS, 'NX')) === 'OK';
  } catch {
    return true;
  }
}

import { randomBytes } from 'crypto';

/**
 * UUID version 7 (RFC 9562): 48-bit Unix time in milliseconds, then random bits. Same format as Prisma's
 * `@default(uuid(7))`, for the rare row whose id must be known before it is inserted.
 */
export function uuidv7(now = Date.now()): string {
  const bytes = randomBytes(16);
  let time = now;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = time % 256;
    time = Math.floor(time / 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 9562 variant
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// The database stores object keys of uploads (`users/<id>/<purpose>/<uuid>.<ext>`), never their URLs: moving the
// bucket or changing the CDN domain then needs a new STORAGE_PUBLIC_URL, not a rewrite of every row. The API keeps
// speaking URLs (`thumbnailUrl`, `avatarUrl`, canvas `content`): they are built here when a row is read and turned
// back into keys when a request is saved. Plain functions so mappers and the worker can use them without DI.

/** Canvas element types whose `content` is the URL of a file (an upload, a static asset or an external image). */
const FILE_ELEMENT_TYPES = new Set(['logo', 'image', 'pattern']);

/** Keys of user uploads: the only keys a client may point at (exports, QR codes... are never placed on a canvas). */
const UPLOAD_KEY = /^users\/[^/?#]+\/[a-z_]+\/[^/?#]+$/;

/**
 * Keys of files that must never have a public URL (print exports): StorageService keeps them in the private bucket
 * and hands them out only through short-lived pre-signed links.
 */
export const PRIVATE_KEY_PREFIX = 'private/';

let publicBase = '';

/** Called once by StorageService with STORAGE_PUBLIC_URL (empty while storage is disabled). */
export function configureAssetBase(publicUrl: string): void {
  publicBase = publicUrl.replace(/\/+$/, '');
}

/** Public URL of a stored key; null without a key, or while storage is disabled. */
export function assetUrl(key: string | null | undefined): string | null {
  return key && publicBase ? `${publicBase}/${key}` : null;
}

export const isUploadKey = (value: string) => UPLOAD_KEY.test(value);

/**
 * Key of a user upload from its public URL, or null for any other URL (static asset, other host, data URL). The
 * scheme is ignored (clients may store the https form of the URL) and so are a query string and a fragment.
 */
export function uploadKeyOf(url: string): string | null {
  if (!publicBase) return null;
  const strip = (value: string) => value.replace(/^https?:\/\//, '');
  const base = `${strip(publicBase)}/`;
  const target = strip(url).split(/[?#]/)[0];
  if (!target.startsWith(base)) return null;
  const key = decodeURIComponent(target.slice(base.length));
  return isUploadKey(key) ? key : null;
}

interface CanvasLike {
  elements?: { type: string; content: string }[];
}

const mapFileContents = <T extends CanvasLike>(canvas: T, map: (content: string) => string): T =>
  Array.isArray(canvas?.elements)
    ? {
        ...canvas,
        elements: canvas.elements.map((element) =>
          FILE_ELEMENT_TYPES.has(element.type) && typeof element.content === 'string'
            ? { ...element, content: map(element.content) }
            : element,
        ),
      }
    : canvas;

/** Canvas as stored: upload URLs become keys, every other content is kept as sent. Idempotent. */
export const toStoredCanvas = <T extends CanvasLike>(canvas: T): T =>
  mapFileContents(canvas, (content) => uploadKeyOf(content) ?? content);

/** Canvas as returned to clients: keys become URLs (left as keys while storage is disabled). */
export const toClientCanvas = <T extends CanvasLike>(canvas: T): T =>
  mapFileContents(canvas, (content) => (isUploadKey(content) ? (assetUrl(content) ?? content) : content));

/** Upload keys a stored canvas points at (each once). */
export function storedCanvasKeys(canvas: CanvasLike | null | undefined): string[] {
  const keys = new Set<string>();
  for (const element of canvas?.elements ?? []) {
    if (FILE_ELEMENT_TYPES.has(element.type) && typeof element.content === 'string' && isUploadKey(element.content)) {
      keys.add(element.content);
    }
  }
  return [...keys];
}

/** Brand kit as returned to clients: `logoKey` -> `logoUrl` (rows written before keys keep their `logoUrl`). */
export function toClientBrandKit(brandKit: unknown): unknown {
  if (!brandKit || typeof brandKit !== 'object') return brandKit;
  const { logoKey, ...rest } = brandKit as { logoKey?: string | null; logoUrl?: string | null };
  return logoKey !== undefined ? { logoUrl: assetUrl(logoKey), ...rest } : rest;
}

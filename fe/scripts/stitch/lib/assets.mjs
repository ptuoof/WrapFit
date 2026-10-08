import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ASSET_INDEX_FILE, PUBLIC_IMAGE_DIR, PUBLIC_IMAGE_URL, SOURCE_DIR } from './paths.mjs';

/** Remote images Stitch hotlinks. Their URLs are temporary, so they are vendored into `public/`. */
const REMOTE_IMAGE = /https:\/\/(?:lh3\.googleusercontent\.com|images\.unsplash\.com)\/[^"'\s)<>]+/g;

const EXTENSIONS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg' };

const decodeEntities = (url) => url.replace(/&amp;/g, '&');

function readIndex() {
  return fs.existsSync(ASSET_INDEX_FILE) ? JSON.parse(fs.readFileSync(ASSET_INDEX_FILE, 'utf8')) : {};
}

/**
 * Downloads every remote image referenced by the Stitch sources (once) and returns a
 * rewriter that swaps those URLs for the local copies.
 */
export async function vendorRemoteImages() {
  const index = readIndex();
  const urls = new Set();
  for (const file of fs.readdirSync(SOURCE_DIR)) {
    const html = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf8');
    for (const match of html.matchAll(REMOTE_IMAGE)) urls.add(decodeEntities(match[0]));
  }

  fs.mkdirSync(PUBLIC_IMAGE_DIR, { recursive: true });
  const missing = [...urls].filter((url) => !index[url] || !fs.existsSync(path.join(PUBLIC_IMAGE_DIR, index[url])));
  const failed = [];
  for (const url of missing) {
    const response = await fetch(url);
    if (!response.ok) {
      // Kept remote: Stitch itself cannot load it either, so the screen renders the same broken image.
      failed.push(`${url.slice(0, 60)}… HTTP ${response.status}`);
      continue;
    }
    const type = (response.headers.get('content-type') ?? '').split(';')[0];
    const name = crypto.createHash('sha1').update(url).digest('hex').slice(0, 16) + (EXTENSIONS[type] ?? '.bin');
    fs.writeFileSync(path.join(PUBLIC_IMAGE_DIR, name), Buffer.from(await response.arrayBuffer()));
    index[url] = name;
  }

  const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(ASSET_INDEX_FILE, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`assets: ${urls.size} remote images (${missing.length - failed.length} downloaded)`);
  for (const line of failed) console.warn(`assets: not downloadable, left remote: ${line}`);

  return (html) =>
    html.replace(REMOTE_IMAGE, (raw) => {
      const local = index[decodeEntities(raw)];
      return local ? `${PUBLIC_IMAGE_URL}/${local}` : raw;
    });
}

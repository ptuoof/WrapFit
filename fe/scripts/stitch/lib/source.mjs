import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import * as cheerio from 'cheerio';
import { MANIFEST_FILE, OVERRIDES_FILE, SOURCE_DIR } from './paths.mjs';

export function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
}

export function readOverrides() {
  return JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8'));
}

function applyTextFixes(html, textFixes) {
  let out = html;
  for (const [broken, fixed] of Object.entries(textFixes)) out = out.split(broken).join(fixed);
  return out;
}

function applySourcePatches(html, screenId, patches = []) {
  let out = html;
  for (const patch of patches.filter((p) => p.screen === screenId)) {
    if (!out.includes(patch.find)) throw new Error(`stitch/overrides.json: patch for ${screenId} no longer matches: ${patch.find}`);
    out = out.split(patch.find).join(patch.replace);
  }
  return out;
}

function readTailwindConfig(html) {
  const match = html.match(/tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/);
  if (!match) return { theme: { extend: {} } };
  return vm.runInNewContext(`(${match[1]})`);
}

/**
 * Parses one Stitch export into the parts the generators need.
 * `rewriteHtml` runs on the raw HTML first (asset URL rewriting).
 */
export function loadScreen(screen, { textFixes, sourcePatches, rewriteHtml }) {
  const file = path.join(SOURCE_DIR, `${screen.id}.html`);
  let html = applySourcePatches(applyTextFixes(fs.readFileSync(file, 'utf8'), textFixes), screen.id, sourcePatches);
  if (rewriteHtml) html = rewriteHtml(html);

  const $ = cheerio.load(html);
  const config = readTailwindConfig(html);
  const scriptSources = $('script[src]')
    .map((_, el) => $(el).attr('src'))
    .get();

  const inlineScripts = $('script:not([src])')
    .map((_, el) => $(el).html() ?? '')
    .get()
    .filter((code) => code.trim() && !/tailwind\.config\s*=/.test(code));

  const styles = $('style')
    .map((_, el) => $(el).html() ?? '')
    .get()
    .join('\n');

  const fontLinks = $('link[href*="fonts.googleapis.com/css"]')
    .map((_, el) => $(el).attr('href'))
    .get();

  return {
    ...screen,
    file: path.relative(path.dirname(SOURCE_DIR), file).replace(/\\/g, '/'),
    $,
    config,
    extend: config.theme?.extend ?? {},
    usesFormsPlugin: scriptSources.some((src) => /cdn\.tailwindcss\.com.*plugins=[^&]*forms/.test(src)),
    usesThree: scriptSources.some((src) => /three(\.min)?\.js/.test(src)),
    inlineScripts,
    styles,
    // Screens that load Material Symbols without the `opsz` axis render icons at a fixed 24pt optical size.
    iconOpticalSizing: fontLinks.some((href) => /Material\+Symbols\+Outlined:[^&]*opsz/.test(href)),
    htmlAttributes: $('html').attr() ?? {},
    bodyAttributes: $('body').attr() ?? {},
  };
}

/** Removes the parenthesised style label Stitch appends to screen titles. */
export function cleanTitle(title) {
  return title.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

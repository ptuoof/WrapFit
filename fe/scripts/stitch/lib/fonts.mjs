import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { PUBLIC_FONT_DIR, PUBLIC_FONT_URL, STYLES_DIR, generatedBanner } from './paths.mjs';

/**
 * Union of the Google Fonts the Stitch screens load. Self-hosting them (instead of a
 * `<link>` to Google) lets `fonts.css` sit before Tailwind in the cascade, the same
 * order as in Stitch, so utilities such as `text-[15px]` win over the icon font's
 * default 24px.
 */
const GOOGLE_FONTS_CSS =
  'https://fonts.googleapis.com/css2' +
  '?family=Inter:wght@300..700' +
  '&family=JetBrains+Mono:wght@400..700' +
  '&family=Playfair+Display:ital,wght@0,400..700;1,400..700' +
  '&family=Plus+Jakarta+Sans:wght@300..800' +
  '&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' +
  '&display=swap';

// A desktop Chrome user agent makes Google serve woff2 split by unicode-range.
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** The class rule Google ships with the icon font. It lands before Tailwind, so utilities override it as in Stitch. */
const MATERIAL_SYMBOLS_CLASS = `.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}`;

export async function vendorFonts({ refresh = false } = {}) {
  const target = path.join(STYLES_DIR, 'fonts.css');
  if (!refresh && fs.existsSync(target)) {
    console.log('fonts: up to date (pass --refresh-fonts to download again)');
    return;
  }

  const response = await fetch(GOOGLE_FONTS_CSS, { headers: { 'user-agent': USER_AGENT } });
  if (!response.ok) throw new Error(`Google Fonts CSS: HTTP ${response.status}`);
  const root = postcss.parse(await response.text());

  fs.mkdirSync(PUBLIC_FONT_DIR, { recursive: true });
  const downloads = [];
  root.walkAtRules('font-face', (rule) => {
    rule.walkDecls('src', (decl) => {
      decl.value = decl.value.replace(/url\((https:[^)]+)\)/g, (_, url) => {
        const name = crypto.createHash('sha1').update(url).digest('hex').slice(0, 16) + path.extname(new URL(url).pathname);
        downloads.push([url, path.join(PUBLIC_FONT_DIR, name)]);
        return `url(${PUBLIC_FONT_URL}/${name})`;
      });
    });
  });
  root.walkRules((rule) => rule.remove());

  for (const [url, file] of downloads) {
    if (fs.existsSync(file)) continue;
    const font = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
    if (!font.ok) throw new Error(`Font ${url}: HTTP ${font.status}`);
    fs.writeFileSync(file, Buffer.from(await font.arrayBuffer()));
  }

  root.walkComments((comment) => {
    comment.text = comment.text.trim();
  });
  const css = `/* ${generatedBanner('Google Fonts')} */\n${root.toString().trim()}\n\n${MATERIAL_SYMBOLS_CLASS}\n`;
  fs.writeFileSync(target, css);
  console.log(`fonts: ${downloads.length} font files`);
}

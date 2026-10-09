import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const defaultTheme = require('tailwindcss/defaultTheme');
const defaultColors = require('tailwindcss/colors');

/**
 * Every Stitch screen ships its own `tailwind.config`, and the same token name often
 * means different values on different screens (`primary` is #004ac6 on most screens,
 * #133020 on /support). The app compiles one Tailwind theme, so each token the screens
 * define becomes a CSS variable: `[data-stitch="<slug>"]` sets the screen's values and
 * `:root` keeps the app's own values for everything outside Stitch screens.
 */

const SECTIONS = {
  colors: 'c',
  fontFamily: 'ff',
  borderRadius: 'r',
  spacing: 'sp',
  boxShadow: 'sh',
  fontSize: 'fs',
};

const FONT_SIZE_PARTS = { size: 'fs', lineHeight: 'lh', letterSpacing: 'ls', fontWeight: 'fw' };

const sanitize = (key) => key.replace(/[^a-zA-Z0-9-]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}`);
const varName = (abbr, key) => `--st-${abbr}-${sanitize(key)}`;

function flattenColors(colors, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(colors ?? {})) {
    const name = key === 'DEFAULT' ? prefix.replace(/-$/, '') : `${prefix}${key}`;
    if (value && typeof value === 'object') Object.assign(out, flattenColors(value, `${name}-`));
    else out[name] = value;
  }
  return out;
}

// Tailwind still exposes v2 palette names as deprecated getters that log a warning when read.
const DEPRECATED_COLORS = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'];
const DEFAULT_COLORS = flattenColors(
  Object.fromEntries(Object.keys(defaultColors).filter((k) => !DEPRECATED_COLORS.includes(k)).map((k) => [k, defaultColors[k]])),
);

/** `#rrggbb` / `#rgb` / `rgb(r, g, b)` → `"r g b"`; anything with alpha or a keyword → null. */
export function toChannels(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');
  }
  m = v.match(/^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/i);
  return m ? `${m[1]} ${m[2]} ${m[3]}` : null;
}

const fontFamilyValue = (value) => (Array.isArray(value) ? value.join(', ') : String(value));

function fontSizeParts(value) {
  if (typeof value === 'string') return { size: value };
  const [size, extra] = value;
  if (typeof extra === 'string') return { size, lineHeight: extra };
  return { size, ...(extra ?? {}) };
}

function screenTokens(extend) {
  return {
    colors: flattenColors(extend.colors),
    fontFamily: extend.fontFamily ?? {},
    borderRadius: extend.borderRadius ?? {},
    spacing: extend.spacing ?? {},
    boxShadow: extend.boxShadow ?? {},
    fontSize: extend.fontSize ?? {},
  };
}

const tailwindDefault = (section, key) => {
  if (section === 'colors') return DEFAULT_COLORS[key];
  return defaultTheme[section]?.[key];
};

/**
 * Builds the union of tokens across screens.
 * Returns `theme` (consumed by tailwind.config.ts) and `cssVariablesFor(screen)`.
 */
export function buildTokenTheme(screens) {
  const perScreen = new Map(screens.map((s) => [s.slug, screenTokens(s.extend)]));
  const union = Object.fromEntries(Object.keys(SECTIONS).map((section) => [section, new Map()]));

  // The preflight and the screen root read sans/serif/mono, so they always take part.
  for (const key of ['sans', 'serif', 'mono']) union.fontFamily.set(key, []);

  for (const [slug, tokens] of perScreen) {
    for (const section of Object.keys(SECTIONS)) {
      for (const [key, value] of Object.entries(tokens[section])) {
        if (!union[section].has(key)) union[section].set(key, []);
        union[section].get(key).push([slug, value]);
      }
    }
  }

  const theme = { colors: {}, fontFamily: {}, borderRadius: {}, spacing: {}, boxShadow: {}, fontSize: {} };

  for (const [key, entries] of union.colors) {
    const fallback = tailwindDefault('colors', key) ?? entries[0][1];
    const channels = [fallback, ...entries.map(([, v]) => v)].every((v) => toChannels(v) !== null);
    theme.colors[key] = { var: varName('c', key), channels, fallback: channels ? toChannels(fallback) : fallback };
  }
  for (const section of ['fontFamily', 'borderRadius', 'spacing', 'boxShadow']) {
    const format = section === 'fontFamily' ? fontFamilyValue : String;
    for (const [key, entries] of union[section]) {
      const fallback = tailwindDefault(section, key) ?? entries[0]?.[1];
      theme[section][key] = { var: varName(SECTIONS[section], key), fallback: fallback === undefined ? null : format(fallback) };
    }
  }
  for (const [key, entries] of union.fontSize) {
    const fallback = fontSizeParts(tailwindDefault('fontSize', key) ?? entries[0][1]);
    theme.fontSize[key] = Object.fromEntries(
      Object.entries(FONT_SIZE_PARTS).map(([part, abbr]) => [part, { var: varName(abbr, key), fallback: fallback[part] ?? null }]),
    );
  }
  theme.formsScreens = screens.filter((s) => s.usesFormsPlugin).map((s) => s.slug);

  /** Declarations for `[data-stitch="<slug>"]`: the screen's value, Tailwind's default, or `initial` (the class did not exist on that screen). */
  function cssVariablesFor(screen) {
    const tokens = perScreen.get(screen.slug);
    const lines = [];
    for (const [key, token] of Object.entries(theme.colors)) {
      const own = tokens.colors[key];
      const value = own ?? tailwindDefault('colors', key);
      lines.push(`${token.var}: ${value === undefined ? 'initial' : token.channels ? toChannels(value) : value};`);
    }
    for (const section of ['fontFamily', 'borderRadius', 'spacing', 'boxShadow']) {
      const format = section === 'fontFamily' ? fontFamilyValue : String;
      for (const [key, token] of Object.entries(theme[section])) {
        const value = tokens[section][key] ?? tailwindDefault(section, key);
        lines.push(`${token.var}: ${value === undefined ? 'initial' : format(value)};`);
      }
    }
    for (const [key, parts] of Object.entries(theme.fontSize)) {
      const value = tokens.fontSize[key] ?? tailwindDefault('fontSize', key);
      const resolved = value === undefined ? {} : fontSizeParts(value);
      for (const [part, token] of Object.entries(parts)) lines.push(`${token.var}: ${resolved[part] ?? 'initial'};`);
    }
    return lines;
  }

  return { theme, cssVariablesFor, colorsFor: (slug) => ({ ...DEFAULT_COLORS, ...perScreen.get(slug).colors }) };
}

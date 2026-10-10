import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { toChannels } from './tokens.mjs';

/**
 * Turns a screen's `<style>` blocks into CSS that only applies inside
 * `[data-stitch="<slug>"]`, without changing selector specificity, so the cascade
 * against Tailwind stays the same as in Stitch (custom CSS first, Tailwind after).
 *
 *   .glass-card        → .glass-card:where(<root>, <root> *)
 *   body               → :where(<root>)                 (the root div plays <body>)
 *   html / :root       → :where(:root:has(<root>))
 *   body { background } also feeds body:has(<root>), because a body background paints the whole canvas.
 */

const CANVAS_PROPERTIES = /^(background|overflow|overscroll-behavior|user-select|-webkit-user-select)/;

const HTML_CLASS_RULES = {
  'h-full': 'height: 100%',
  'scroll-smooth': 'scroll-behavior: smooth',
};

function scopeSelectorList(selector, root) {
  const scopeAny = `:where(${root}, ${root} *)`;
  return selectorParser((selectors) => {
    selectors.each((complex) => {
      let touched = false;
      complex.each((node) => {
        const tag = node.type === 'tag' ? node.value.toLowerCase() : null;
        if (tag === 'body') {
          // Zero specificity, like the type selector it replaces.
          node.replaceWith(selectorParser.pseudo({ value: `:where(${root})` }));
          touched = true;
        } else if (tag === 'html' || (node.type === 'pseudo' && node.value === ':root')) {
          node.replaceWith(selectorParser.pseudo({ value: `:where(:root:has(${root}))` }));
          touched = true;
        }
      });
      if (touched) return;

      // Insert the scope into the first compound, before any pseudo-element.
      const first = [];
      for (const node of complex.nodes) {
        if (node.type === 'combinator') break;
        first.push(node);
      }
      const pseudoElement = first.find((n) => n.type === 'pseudo' && (n.value.startsWith('::') || /^:(before|after|first-line|first-letter)$/.test(n.value)));
      const scope = selectorParser.pseudo({ value: scopeAny });
      if (pseudoElement) complex.insertBefore(pseudoElement, scope);
      else if (first.length) complex.insertAfter(first[first.length - 1], scope);
      else complex.prepend(scope);
    });
  }).processSync(selector);
}

function scopeStyles(css, root, warn) {
  const ast = postcss.parse(css);
  ast.walkAtRules('import', (rule) => {
    // Google Fonts are self-hosted in fonts.css; anything else would be lost, so report it.
    if (!rule.params.includes('fonts.googleapis.com')) warn(`dropped @import ${rule.params}`);
    rule.remove();
  });
  // In Stitch these blocks are plain <style>, so `@layer base {}` is a native cascade layer
  // (it loses to every unlayered rule). Tailwind's build would claim the names base,
  // components and utilities, so rename them; the cascade behaviour is unchanged.
  ast.walkAtRules('layer', (rule) => {
    rule.params = rule.params
      .split(',')
      .map((name) => `stitch-${name.trim()}`)
      .join(', ');
  });
  ast.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    const isBody = rule.selectors.some((s) => s.trim().toLowerCase() === 'body');
    if (isBody) {
      const canvas = rule.nodes.filter((n) => n.type === 'decl' && CANVAS_PROPERTIES.test(n.prop)).map((d) => d.clone());
      if (canvas.length) rule.before(postcss.rule({ selector: `body:has(${root})`, nodes: canvas }));
    }
    rule.selector = scopeSelectorList(rule.selector, root);
  });
  return ast.toString().trim();
}

/** Background colour of `<body>` from its classes, so the canvas outside the root matches Stitch. */
function bodyBackground(classes, colors) {
  for (const cls of classes.split(/\s+/)) {
    const m = cls.match(/^bg-(.+)$/);
    if (!m || cls.includes(':') || cls.includes('/')) continue;
    const token = m[1];
    const arbitrary = token.match(/^\[(#[0-9a-fA-F]{3,8}|rgba?\([^\]]+\))\]$/);
    if (arbitrary) return arbitrary[1].replace(/_/g, ' ');
    if (colors[token] !== undefined) return colors[token];
  }
  return null;
}

export function buildScreenCss(screen, { cssVariables, colors, banner, warn }) {
  const root = `[data-stitch="${screen.slug}"]`;
  const out = [`/* ${banner} */`, `${root} {\n  ${cssVariables.join('\n  ')}\n}`];

  const htmlRules = String(screen.htmlAttributes.class ?? '')
    .split(/\s+/)
    .map((cls) => HTML_CLASS_RULES[cls])
    .filter(Boolean);
  if (htmlRules.length) out.push(`:where(:root:has(${root})) {\n  ${htmlRules.join(';\n  ')};\n}`);

  // Without a background of its own, Stitch's body shows the white canvas.
  out.push(`body:has(${root}) {\n  background-color: #fff;\n}`);

  if (!screen.iconOpticalSizing) {
    out.push(`.material-symbols-outlined:where(${root}, ${root} *) {\n  font-optical-sizing: none;\n}`);
  }

  if (screen.styles.trim()) out.push(scopeStyles(screen.styles, root, warn));

  const background = bodyBackground(String(screen.bodyAttributes.class ?? ''), colors);
  if (background) {
    const channels = toChannels(background);
    out.push(`body:has(${root}) {\n  background-color: ${channels ? `rgb(${channels})` : background};\n}`);
  }

  return out.join('\n\n') + '\n';
}

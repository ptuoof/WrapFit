/**
 * Converts a Stitch `<body>` into JSX for a React Server Component.
 *
 * Differences from a naive conversion, all aimed at rendering exactly like the HTML:
 * - Whitespace between inline elements is kept (`{" "}`), as JSX would otherwise drop it.
 * - Inline `on*` handlers become `data-st-on="click:3"`; the code goes to the behavior module.
 * - `<a href="#">` whose label is in `overrides.links` becomes a `next/link` to the real route.
 * - Form state attributes become their uncontrolled React equivalents (`defaultValue`, `defaultChecked`).
 */

const SKIPPED_TAGS = new Set(['script', 'style', 'link', 'meta', 'title', 'noscript', 'base']);

const VOID_TAGS = new Set(['area', 'br', 'col', 'embed', 'hr', 'img', 'input', 'source', 'track', 'wbr']);

const ATTRIBUTE_NAMES = {
  class: 'className',
  for: 'htmlFor',
  'accept-charset': 'acceptCharset',
  accesskey: 'accessKey',
  allowfullscreen: 'allowFullScreen',
  autocapitalize: 'autoCapitalize',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  charset: 'charSet',
  colspan: 'colSpan',
  contenteditable: 'contentEditable',
  crossorigin: 'crossOrigin',
  datetime: 'dateTime',
  enctype: 'encType',
  enterkeyhint: 'enterKeyHint',
  fetchpriority: 'fetchPriority',
  formnovalidate: 'formNoValidate',
  frameborder: 'frameBorder',
  'http-equiv': 'httpEquiv',
  inputmode: 'inputMode',
  maxlength: 'maxLength',
  minlength: 'minLength',
  novalidate: 'noValidate',
  playsinline: 'playsInline',
  readonly: 'readOnly',
  referrerpolicy: 'referrerPolicy',
  rowspan: 'rowSpan',
  spellcheck: 'spellCheck',
  srcset: 'srcSet',
  srclang: 'srcLang',
  tabindex: 'tabIndex',
  usemap: 'useMap',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
  'xmlns:xlink': 'xmlnsXlink',
};

const BOOLEAN_ATTRIBUTES = new Set([
  'allowFullScreen', 'async', 'autoFocus', 'autoPlay', 'controls', 'default', 'defer', 'disabled', 'formNoValidate',
  'hidden', 'loop', 'multiple', 'muted', 'noValidate', 'open', 'playsInline', 'readOnly', 'required', 'reversed',
]);

// parse5 restores the case of most SVG tags, but not of filter primitives added after its table.
const SVG_TAG_CASE = Object.fromEntries(
  ['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
   'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
   'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight',
   'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence'].map((tag) => [tag.toLowerCase(), tag]),
);

// React types these as numbers.
const NUMERIC_ATTRIBUTES = new Set(['tabIndex', 'colSpan', 'rowSpan', 'maxLength', 'minLength', 'size', 'cols', 'rows', 'span', 'start']);

const camel = (name) => name.replace(/[-:]([a-z])/g, (_, c) => c.toUpperCase());

function attributeName(raw) {
  const lower = raw.toLowerCase();
  if (ATTRIBUTE_NAMES[lower]) return ATTRIBUTE_NAMES[lower];
  if (lower.startsWith('data-') || lower.startsWith('aria-')) return lower;
  return raw.includes('-') || raw.includes(':') ? camel(raw) : raw;
}

/** Splits `a: b; c: url(x;y)` on top-level semicolons. */
function splitDeclarations(style) {
  const out = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (const ch of style) {
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((d) => d.trim()).filter(Boolean);
}

function styleObject(style) {
  const entries = [];
  for (const declaration of splitDeclarations(style)) {
    const colon = declaration.indexOf(':');
    if (colon < 0) continue;
    const prop = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    let key;
    if (prop.startsWith('--')) key = prop;
    else if (prop.startsWith('-ms-')) key = camel(prop.slice(1));
    else if (prop.startsWith('-')) key = camel(prop.slice(1)).replace(/^./, (c) => c.toUpperCase());
    else key = camel(prop.toLowerCase());
    entries.push(`${JSON.stringify(key)}: ${JSON.stringify(value)}`);
  }
  return `{{ ${entries.join(', ')} }}`;
}

const SAFE_ATTRIBUTE = /^[^"&{}<>\\\n]*$/;
const attributeValue = (value) => (SAFE_ATTRIBUTE.test(value) ? `"${value}"` : `{${JSON.stringify(value)}}`);

// HTML collapses only these characters; `\s` would also eat U+00A0 (&nbsp;).
const HTML_SPACE = /[ \t\n\r\f]+/g;
const SAFE_TEXT = /^[^{}<>& \t\n\r\f]([^{}<>&\n]*[^{}<>& \t\n\r\f])?$/;

function textNode(text, preserve) {
  if (preserve) return `{${JSON.stringify(text)}}`;
  const collapsed = text.replace(HTML_SPACE, ' ');
  if (collapsed === ' ') return '{" "}';
  return SAFE_TEXT.test(collapsed) && !collapsed.includes('  ') ? collapsed : `{${JSON.stringify(collapsed)}}`;
}

const isPreformatted = (el) => ['pre', 'textarea'].includes(el.name) || /\bwhitespace-pre/.test(el.attribs?.class ?? '');

/**
 * @param $ cheerio root
 * @param options.links          label → route map
 * @param options.registerHandler (event, code) → handler id
 * @param options.warn           collects conversion warnings
 */
export function bodyToJsx($, { links, registerHandler, warn }) {
  const usage = { link: false };

  const linkLabel = (el) => {
    const clone = $(el).clone();
    clone.find('.material-symbols-outlined, .material-icons').remove();
    return clone.text().replace(/\s+/g, ' ').trim();
  };

  function element(el, depth, preserve) {
    if (el.type === 'text') return textNode(el.data ?? '', preserve);
    if (el.type === 'comment') {
      const text = (el.data ?? '').replace(/\*\//g, '* /').trim();
      return text ? `{/* ${text} */}` : '';
    }
    if (el.type !== 'tag') return '';

    const tag = el.name;
    if (SKIPPED_TAGS.has(tag)) return '';
    if (tag === 'template') {
      warn('dropped <template>');
      return '';
    }

    const props = [];
    const handlers = [];
    let jsxTag = SVG_TAG_CASE[tag] ?? tag;
    const attribs = { ...el.attribs };

    if (tag === 'a' && attribs.href === '#' && !Object.keys(attribs).some((k) => k.startsWith('on'))) {
      const route = links[linkLabel(el)];
      if (route) {
        jsxTag = 'Link';
        attribs.href = route;
        usage.link = true;
      }
    }

    if (tag === 'select') {
      const selected = $(el).find('option[selected]').first();
      if (selected.length) props.push(`defaultValue=${attributeValue(selected.attr('value') ?? selected.text())}`);
    }

    for (const [rawName, value] of Object.entries(attribs)) {
      const lower = rawName.toLowerCase();
      if (lower.startsWith('on')) {
        handlers.push(`${lower.slice(2)}:${registerHandler(lower.slice(2), value)}`);
        continue;
      }
      if (tag === 'option' && lower === 'selected') continue;
      if (lower === 'style') {
        if (value.trim()) props.push(`style=${styleObject(value)}`);
        continue;
      }
      if (lower === 'checked') {
        props.push('defaultChecked');
        continue;
      }
      if (lower === 'value' && (tag === 'input' || tag === 'textarea')) {
        props.push(`defaultValue=${attributeValue(value)}`);
        continue;
      }
      const name = attributeName(rawName);
      if (BOOLEAN_ATTRIBUTES.has(name)) {
        props.push(name);
        continue;
      }
      if (NUMERIC_ATTRIBUTES.has(name) && /^-?\d+$/.test(value.trim())) {
        props.push(`${name}={${value.trim()}}`);
        continue;
      }
      if (name === 'contentEditable') props.push('suppressContentEditableWarning');
      props.push(`${name}=${attributeValue(value)}`);
    }
    if (handlers.length) props.push(`data-st-on="${handlers.join(' ')}"`);

    const childPreserve = preserve || isPreformatted(el);
    let children = el.children ?? [];
    if (tag === 'textarea') {
      const text = $(el).text();
      if (text) props.push(`defaultValue={${JSON.stringify(text)}}`);
      children = [];
    }

    const open = `<${jsxTag}${props.length ? ' ' + props.join(' ') : ''}`;
    if (VOID_TAGS.has(tag) || !children.length) return `${open} />`;
    const inner = children.map((child) => element(child, depth + 1, childPreserve)).join('');
    return `${open}>${inner}</${jsxTag}>`;
  }

  const body = $('body').get(0);
  const jsx = (body?.children ?? []).map((child) => element(child, 0, false)).join('\n');
  return { jsx, usesLink: usage.link };
}

/** Props for the root `<div data-stitch>` that stands in for `<body>`. */
export function rootProps(bodyAttributes, slug) {
  const props = [`data-stitch="${slug}"`];
  for (const [raw, value] of Object.entries(bodyAttributes)) {
    const lower = raw.toLowerCase();
    if (lower.startsWith('on')) continue;
    if (lower === 'style') {
      if (value.trim()) props.push(`style=${styleObject(value)}`);
    } else props.push(`${attributeName(raw)}=${attributeValue(value)}`);
  }
  return props.join(' ');
}

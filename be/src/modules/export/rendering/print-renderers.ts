// Print files from a PrintLayout. Units are mm everywhere. Line conventions follow AGENTS.md:
// cut = solid red, crease = dashed blue (4,4); in the PDF they use CMYK process colors for the print shop.
import PDFDocument from 'pdfkit';
import type { PrintLayout } from './print-layout';

const COLORS = { cut: '#E53E3E', crease: '#3182CE' };
/** CMYK (0-100) for the PDF: cut = 100 % magenta + yellow, crease = 100 % cyan. */
const CMYK = { cut: [0, 100, 100, 0], crease: [100, 0, 0, 0], text: [0, 0, 0, 100], info: [0, 0, 0, 60] } as const;
const LINE_MM = 0.25;
const DASH_MM = 4;
const PT_PER_MM = 72 / 25.4;
const FONT = require.resolve('@expo-google-fonts/be-vietnam-pro/400Regular/BeVietnamPro_400Regular.ttf');

const n = (value: number) => Number(value.toFixed(3)).toString();

/** Files of the layout images, by URL (the export worker loads them from storage). Missing URLs are not drawn. */
export type Artwork = Map<string, { body: Buffer; contentType: string }>;

/** PDFKit embeds PNG and JPEG only (WebP, SVG and PDF logos are left out of the PDF; the SVG export keeps them). */
export function canEmbedInPdf(body: Buffer): boolean {
  const isPng = body.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  const isJpeg = body[0] === 0xff && body[1] === 0xd8;
  return isPng || isJpeg;
}

/** Naive RGB -> CMYK (0-100) for artwork colors; the print shop does the final color management. */
export function hexToCmyk(hex: string): [number, number, number, number] {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) return [0, 0, 0, 100];
  const [r, g, b] = match.slice(1).map((h) => parseInt(h, 16) / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  const c = (x: number) => Math.round(((1 - x - k) / (1 - k)) * 100);
  return [c(r), c(g), c(b), Math.round(k * 100)];
}
const escapeXml = (text: string) =>
  text.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);
const specLine = (layout: PrintLayout) =>
  `WrapFit — ${layout.title} — ${layout.structure} ${layout.dimensions.length} x ${layout.dimensions.width} x ${layout.dimensions.height} mm, giấy ${layout.dimensions.paperThickness} mm`;

/** Layered SVG (layers: info, crease, cut, artwork) for cutting plotters such as Cricut or laser cutters. */
export function renderSvg(layout: PrintLayout, artwork: Artwork = new Map()): string {
  const lines = { cut: [] as string[], crease: [] as string[] };
  for (const piece of layout.pieces) {
    for (const seg of piece.geometry.segments) {
      if (seg.type !== 'cut' && seg.type !== 'crease') continue;
      lines[seg.type].push(
        seg.pathString
          ? `<path transform="translate(${n(piece.x)} ${n(piece.y)})" d="${escapeXml(seg.pathString)}"/>`
          : `<line x1="${n(piece.x + seg.start.x)}" y1="${n(piece.y + seg.start.y)}" x2="${n(piece.x + seg.end.x)}" y2="${n(piece.y + seg.end.y)}"/>`,
      );
    }
  }
  // Images are embedded as data URIs so the file works offline in Cricut Design Space / Illustrator.
  const images = layout.images.flatMap((image) => {
    const file = artwork.get(image.url);
    if (!file?.contentType.startsWith('image/')) return [];
    return [
      `<image x="${n(image.x)}" y="${n(image.y)}" width="${n(image.width)}" height="${n(image.height)}" preserveAspectRatio="none"` +
        (image.rotation ? ` transform="rotate(${n(image.rotation)} ${n(image.x)} ${n(image.y)})"` : '') +
        ` href="data:${escapeXml(file.contentType)};base64,${file.body.toString('base64')}"/>`,
    ];
  });
  const texts = layout.texts.map(
    (t) =>
      `<text x="${n(t.x)}" y="${n(t.y + t.fontSizeMm)}" font-size="${n(t.fontSizeMm)}" fill="${escapeXml(t.color)}"` +
      (t.rotation ? ` transform="rotate(${n(t.rotation)} ${n(t.x)} ${n(t.y)})"` : '') +
      `>${escapeXml(t.content)}</text>`,
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${n(layout.width)}mm" height="${n(layout.height)}mm" viewBox="0 0 ${n(layout.width)} ${n(layout.height)}">`,
    `<g id="info" font-family="sans-serif" font-size="4" fill="#64748B"><text x="${n(layout.pieces[0].x)}" y="${n(layout.pieces[0].y - 8)}">${escapeXml(specLine(layout))}</text></g>`,
    `<g id="crease" fill="none" stroke="${COLORS.crease}" stroke-width="${LINE_MM}" stroke-dasharray="${DASH_MM},${DASH_MM}">${lines.crease.join('')}</g>`,
    `<g id="cut" fill="none" stroke="${COLORS.cut}" stroke-width="${LINE_MM}">${lines.cut.join('')}</g>`,
    `<g id="artwork" font-family="Be Vietnam Pro, sans-serif">${images.join('')}${texts.join('')}</g>`,
    '</svg>',
  ].join('\n');
}

/** Vector PDF at true size (1 mm = 2.8346 pt) with CMYK colors and an embedded Vietnamese font. */
export function renderPdf(layout: PrintLayout, artwork: Artwork = new Map()): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [layout.width * PT_PER_MM, layout.height * PT_PER_MM],
      margin: 0,
      info: { Title: layout.title, Creator: 'WrapFit', Subject: specLine(layout) },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.registerFont('body', FONT);
    doc.scale(PT_PER_MM); // draw in mm from here on

    doc.font('body').fontSize(4).fillColor([...CMYK.info]);
    doc.text(specLine(layout), layout.pieces[0].x, layout.pieces[0].y - 10, { lineBreak: false });

    // Artwork under the dielines, so the cut and crease lines stay visible to the print shop.
    for (const image of layout.images) {
      const file = artwork.get(image.url);
      if (!file || !canEmbedInPdf(file.body)) continue;
      doc.save();
      if (image.rotation) doc.rotate(image.rotation, { origin: [image.x, image.y] });
      doc.image(file.body, image.x, image.y, { width: image.width, height: image.height });
      doc.restore();
    }

    for (const type of ['crease', 'cut'] as const) {
      doc.save().lineWidth(LINE_MM).strokeColor([...CMYK[type]]);
      if (type === 'crease') doc.dash(DASH_MM, { space: DASH_MM });
      for (const piece of layout.pieces) {
        for (const seg of piece.geometry.segments.filter((s) => s.type === type)) {
          if (seg.pathString) {
            doc.save().translate(piece.x, piece.y).path(seg.pathString).stroke().restore();
          } else {
            doc.moveTo(piece.x + seg.start.x, piece.y + seg.start.y).lineTo(piece.x + seg.end.x, piece.y + seg.end.y).stroke();
          }
        }
      }
      doc.undash().restore();
    }

    for (const t of layout.texts) {
      doc.save();
      if (t.rotation) doc.rotate(t.rotation, { origin: [t.x, t.y] });
      doc.font('body').fontSize(t.fontSizeMm).fillColor(hexToCmyk(t.color));
      doc.text(t.content, t.x, t.y, { width: t.width, lineBreak: true });
      doc.restore();
    }
    doc.end();
  });
}

/**
 * ASCII DXF (R12) in mm with layers CUT (red, ACI 1) and CREASE (blue, ACI 5, dashed) for CNC die-cutting machines.
 * Curved segments are approximated by their chord until the shared engine exposes curve points.
 */
export function renderDxf(layout: PrintLayout): string {
  const out: (string | number)[] = [];
  const pair = (code: number, value: string | number) => out.push(code, value);
  pair(0, 'SECTION');
  pair(2, 'HEADER');
  pair(9, '$INSUNITS');
  pair(70, 4); // millimetres
  pair(0, 'ENDSEC');
  pair(0, 'SECTION');
  pair(2, 'TABLES');
  pair(0, 'TABLE');
  pair(2, 'LTYPE');
  pair(70, 1);
  pair(0, 'LTYPE');
  pair(2, 'DASHED');
  pair(70, 0);
  pair(3, 'Dashed 4 mm');
  pair(72, 65);
  pair(73, 2);
  pair(40, 2 * DASH_MM);
  pair(49, DASH_MM);
  pair(49, -DASH_MM);
  pair(0, 'ENDTAB');
  pair(0, 'TABLE');
  pair(2, 'LAYER');
  pair(70, 2);
  for (const [name, color, ltype] of [
    ['CUT', 1, 'CONTINUOUS'],
    ['CREASE', 5, 'DASHED'],
  ] as const) {
    pair(0, 'LAYER');
    pair(2, name);
    pair(70, 0);
    pair(62, color);
    pair(6, ltype);
  }
  pair(0, 'ENDTAB');
  pair(0, 'ENDSEC');
  pair(0, 'SECTION');
  pair(2, 'ENTITIES');
  for (const piece of layout.pieces) {
    for (const seg of piece.geometry.segments) {
      if (seg.type !== 'cut' && seg.type !== 'crease') continue;
      // DXF y axis points up: flip so the drawing is not mirrored.
      pair(0, 'LINE');
      pair(8, seg.type === 'cut' ? 'CUT' : 'CREASE');
      pair(10, n(piece.x + seg.start.x));
      pair(20, n(layout.height - (piece.y + seg.start.y)));
      pair(11, n(piece.x + seg.end.x));
      pair(21, n(layout.height - (piece.y + seg.end.y)));
    }
  }
  pair(0, 'ENDSEC');
  pair(0, 'EOF');
  return out.join('\n') + '\n';
}

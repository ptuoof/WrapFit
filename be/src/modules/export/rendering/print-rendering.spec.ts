import { fileNameFor } from '../export.service';
import { buildPrintLayout, PIECE_GAP_MM, SHEET_MARGIN_MM, UnsupportedStructureError } from './print-layout';
import { hexToCmyk, renderDxf, renderPdf, renderSvg } from './print-renderers';

const dimensions = { length: 120, width: 80, height: 60, paperThickness: 0.4 };
const greeting = {
  id: 't1',
  type: 'text' as const,
  panelId: 'front',
  x: 10,
  y: 12,
  width: 60,
  height: 10,
  rotation: 0,
  content: 'Chúc mừng năm mới <Tết> & an khang',
  style: { fontSize: 14, color: '#C0392B' },
};
const layoutOf = (structure: string, elements = [greeting]) =>
  buildPrintLayout({ title: 'Hộp nến Tết', structure, dimensions, elements });

describe('print layout', () => {
  it.each([
    ['tuck-top', 1],
    ['pillow', 1],
    ['lid-base', 2],
    ['sleeve-drawer', 2],
  ])('lays out the %s dieline as %i piece(s) side by side', (structure, count) => {
    const layout = layoutOf(structure);
    expect(layout.pieces).toHaveLength(count);
    expect(layout.pieces[0]).toMatchObject({ x: SHEET_MARGIN_MM, y: SHEET_MARGIN_MM });
    if (count === 2) {
      const [first, second] = layout.pieces;
      expect(second.x).toBe(first.x + first.geometry.totalBoundingBox.width + PIECE_GAP_MM);
    }
    const last = layout.pieces[count - 1];
    expect(layout.width).toBeCloseTo(last.x + last.geometry.totalBoundingBox.width + SHEET_MARGIN_MM);
  });

  it('places text elements on their panel ("front" or "panel_front")', () => {
    const layout = layoutOf('tuck-top');
    const front = layout.pieces[0].geometry.panels.find((p) => p.id === 'panel_front')!;
    expect(layout.texts).toEqual([
      expect.objectContaining({
        x: SHEET_MARGIN_MM + front.bounds.x + 10,
        y: SHEET_MARGIN_MM + front.bounds.y + 12,
        fontSizeMm: expect.closeTo(4.94, 2), // 14 pt
      }),
    ]);
    expect(layoutOf('tuck-top', [{ ...greeting, panelId: 'nowhere' }]).texts).toEqual([]);
  });

  it('rejects unknown structures', () => {
    expect(() => layoutOf('hexagon')).toThrow(UnsupportedStructureError);
  });
});

describe('print renderers', () => {
  it('writes a layered SVG at true size with escaped text', () => {
    const svg = renderSvg(layoutOf('tuck-top'));
    expect(svg).toMatch(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="[\d.]+mm" height="[\d.]+mm"/);
    for (const layer of ['info', 'crease', 'cut', 'artwork']) expect(svg).toContain(`<g id="${layer}"`);
    expect(svg).toContain('stroke="#E53E3E"');
    expect(svg).toContain('stroke-dasharray="4,4"');
    expect(svg).toContain('Chúc mừng năm mới &lt;Tết&gt; &amp; an khang');
    // Curved segments (pillow box) keep their path data, moved to the piece position.
    expect(renderSvg(layoutOf('pillow'))).toContain(
      `<path transform="translate(${SHEET_MARGIN_MM} ${SHEET_MARGIN_MM})" d="M `,
    );
  });

  it('writes a vector PDF of the sheet size with the Vietnamese font embedded', async () => {
    const layout = layoutOf('lid-base');
    const pdf = await renderPdf(layout);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    const text = pdf.toString('latin1');
    expect(text).toContain('BeVietnamPro');
    const [width, height] = /\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/.exec(text)!.slice(1).map(Number);
    expect(width).toBeCloseTo((layout.width * 72) / 25.4, 1);
    expect(height).toBeCloseTo((layout.height * 72) / 25.4, 1);
  });

  it('writes a DXF in mm with CUT and CREASE layers', () => {
    const layout = layoutOf('sleeve-drawer');
    const dxf = renderDxf(layout);
    expect(dxf.startsWith('0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n4\n')).toBe(true);
    expect(dxf).toContain('\nLAYER\n2\nCUT\n');
    expect(dxf).toContain('\nLAYER\n2\nCREASE\n');
    // One LINE per dieline segment of both pieces (sleeve + drawer).
    const segments = layout.pieces.reduce((sum, piece) => sum + piece.geometry.segments.length, 0);
    expect(dxf.match(/\nLINE\n/g)).toHaveLength(segments);
    expect(dxf.trimEnd().endsWith('EOF')).toBe(true);
  });

  it('converts artwork colors to CMYK and names files safely', () => {
    expect(hexToCmyk('#000000')).toEqual([0, 0, 0, 100]);
    expect(hexToCmyk('#FF0000')).toEqual([0, 100, 100, 0]);
    expect(hexToCmyk('#FFFFFF')).toEqual([0, 0, 0, 0]);
    expect(fileNameFor('Hộp nến Tết Đoàn Viên!', 'PDF_CMYK')).toBe('hop-nen-tet-doan-vien-pdf-cmyk.pdf');
    expect(fileNameFor('***', 'DXF')).toBe('wrapfit-dxf.dxf');
  });
});

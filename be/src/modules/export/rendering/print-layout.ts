// Pure layout for print files: which dieline pieces a box has and where each one sits on the sheet (mm).
// Geometry comes from the parametric engine of IT2 (`@wrapfit/shared`); nothing here depends on NestJS.
import {
  type BoxDimensions,
  type CanvasElement,
  type DielineGeometry,
  generateLidBaseDieline,
  generatePillowBoxDieline,
  generateSleeveDrawerDieline,
  generateTuckTopDieline,
} from '@wrapfit/shared';

/** Margin around the artwork and gap between pieces, in mm. */
export const SHEET_MARGIN_MM = 20;
export const PIECE_GAP_MM = 20;

export interface PlacedPiece {
  name: string;
  geometry: DielineGeometry;
  /** Top-left corner of the piece on the sheet, mm. */
  x: number;
  y: number;
}

export interface PrintLayout {
  title: string;
  structure: string;
  dimensions: BoxDimensions;
  /** Sheet size including margins, mm. */
  width: number;
  height: number;
  pieces: PlacedPiece[];
  /** Text elements placed on the sheet (mm, top-left of the element box). */
  texts: { content: string; x: number; y: number; width: number; fontSizeMm: number; color: string; rotation: number }[];
}

export class UnsupportedStructureError extends Error {}

/** Every box is printed as one or more flat pieces (two-piece boxes: base + lid, sleeve + drawer). */
export function dielinePieces(structure: string, dimensions: BoxDimensions): { name: string; geometry: DielineGeometry }[] {
  switch (structure) {
    case 'tuck-top':
      return [{ name: 'Thân hộp', geometry: generateTuckTopDieline(dimensions) }];
    case 'pillow':
      return [{ name: 'Thân hộp', geometry: generatePillowBoxDieline(dimensions) }];
    case 'lid-base': {
      const { base, lid } = generateLidBaseDieline(dimensions);
      return [
        { name: 'Đáy (hộp dương)', geometry: base },
        { name: 'Nắp (hộp âm)', geometry: lid },
      ];
    }
    case 'sleeve-drawer': {
      const { sleeve, drawer } = generateSleeveDrawerDieline(dimensions);
      return [
        { name: 'Vỏ bao', geometry: sleeve },
        { name: 'Khay kéo', geometry: drawer },
      ];
    }
    default:
      throw new UnsupportedStructureError(`No dieline generator for box structure "${structure}"`);
  }
}

const PT_PER_MM = 72 / 25.4;

/** Lays the pieces out left to right and places the text elements on their panels. */
export function buildPrintLayout(input: {
  title: string;
  structure: string;
  dimensions: BoxDimensions;
  elements: CanvasElement[];
}): PrintLayout {
  const pieces: PlacedPiece[] = [];
  let cursor = SHEET_MARGIN_MM;
  let tallest = 0;
  for (const piece of dielinePieces(input.structure, input.dimensions)) {
    pieces.push({ ...piece, x: cursor, y: SHEET_MARGIN_MM });
    cursor += piece.geometry.totalBoundingBox.width + PIECE_GAP_MM;
    tallest = Math.max(tallest, piece.geometry.totalBoundingBox.height);
  }

  // Canvas elements reference a panel id: "front" or the full "panel_front" both work. The first piece that has
  // the panel wins (two-piece boxes may repeat panel names).
  const texts: PrintLayout['texts'] = [];
  for (const element of input.elements) {
    if (element.type !== 'text' || !element.content.trim()) continue;
    for (const piece of pieces) {
      const panel = piece.geometry.panels.find((p) => p.id === element.panelId || p.id === `panel_${element.panelId}`);
      if (!panel) continue;
      texts.push({
        content: element.content,
        x: piece.x + panel.bounds.x + element.x,
        y: piece.y + panel.bounds.y + element.y,
        width: element.width,
        // Font sizes are points in the editor.
        fontSizeMm: (element.style?.fontSize ?? 12) / PT_PER_MM,
        color: element.style?.color ?? '#000000',
        rotation: element.rotation,
      });
      break;
    }
  }

  return {
    title: input.title,
    structure: input.structure,
    dimensions: input.dimensions,
    width: cursor - PIECE_GAP_MM + SHEET_MARGIN_MM,
    height: tallest + 2 * SHEET_MARGIN_MM,
    pieces,
    texts,
  };
}

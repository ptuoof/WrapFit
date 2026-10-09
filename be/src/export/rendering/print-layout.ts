// Pure layout for print files: which dieline pieces a box has and where each one sits on the sheet (mm).
// Geometry comes from the parametric engine of IT2 (`@wrapfit/shared`); nothing here depends on NestJS.
import type { BoxDimensions, CanvasElement, DielineGeometry } from '@wrapfit/shared';
import { dielinePieces, matchesPanel } from '../../projects';

export { dielinePieces, matchesPanel, UnsupportedFormulaVersionError, UnsupportedStructureError } from '../../projects';

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
  /** Logos, images and patterns (by URL) placed on the sheet, drawn under the texts (mm, top-left of the box). */
  images: { url: string; x: number; y: number; width: number; height: number; rotation: number }[];
}

/** Element types drawn from an uploaded file; `content` is the file URL. */
const IMAGE_TYPES = new Set<CanvasElement['type']>(['logo', 'image', 'pattern']);

const PT_PER_MM = 72 / 25.4;

/** Lays the pieces out left to right and places the text and image elements on their panels. */
export function buildPrintLayout(input: {
  title: string;
  structure: string;
  /** Dieline formulas the project is pinned to. */
  formulaVersion: number;
  dimensions: BoxDimensions;
  elements: CanvasElement[];
}): PrintLayout {
  const pieces: PlacedPiece[] = [];
  let cursor = SHEET_MARGIN_MM;
  let tallest = 0;
  for (const piece of dielinePieces(input.structure, input.dimensions, input.formulaVersion)) {
    pieces.push({ ...piece, x: cursor, y: SHEET_MARGIN_MM });
    cursor += piece.geometry.totalBoundingBox.width + PIECE_GAP_MM;
    tallest = Math.max(tallest, piece.geometry.totalBoundingBox.height);
  }

  const texts: PrintLayout['texts'] = [];
  const images: PrintLayout['images'] = [];
  for (const element of input.elements) {
    const isText = element.type === 'text';
    if (isText ? !element.content.trim() : !IMAGE_TYPES.has(element.type) || !/^https?:\/\//.test(element.content)) {
      continue; // barcodes are not rendered yet
    }
    // The first piece that has the panel wins (see matchesPanel for the accepted ids).
    const piece = pieces.find((p) => p.geometry.panels.some((panel) => matchesPanel(panel, element.panelId)));
    const panel = piece?.geometry.panels.find((p) => matchesPanel(p, element.panelId));
    if (!piece || !panel) continue;
    const x = piece.x + panel.bounds.x + element.x;
    const y = piece.y + panel.bounds.y + element.y;
    if (isText) {
      texts.push({
        content: element.content,
        x,
        y,
        width: element.width,
        // Font sizes are points in the editor.
        fontSizeMm: (element.style?.fontSize ?? 12) / PT_PER_MM,
        color: element.style?.color ?? '#000000',
        rotation: element.rotation,
      });
    } else {
      images.push({ url: element.content, x, y, width: element.width, height: element.height, rotation: element.rotation });
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
    images,
  };
}

/**
 * Versioned registry of the dieline formulas.
 *
 * A project is pinned to the formula version that was current when it was created (`formulaVersion`), so changing a
 * formula never moves the cut lines of a design that was already checked or printed. To change a formula, keep the
 * old generator under its version and register the new one under the next version.
 */

import { BoxDimensions, DielineGeometry } from "../types/dieline";
import { generateLidBaseDieline } from "./lid-base";
import { generatePillowBoxDieline } from "./pillow";
import { generateSleeveDrawerDieline } from "./sleeve-drawer";
import { generateTuckTopDieline } from "./tuck-top";

/** Version given to new projects. */
export const CURRENT_FORMULA_VERSION = 1;

/** One flat piece of a box: two-piece boxes print as base + lid, sleeve + drawer. */
export interface DielinePiece {
  name: string;
  geometry: DielineGeometry;
}

export class UnsupportedStructureError extends Error {}
export class UnsupportedFormulaVersionError extends Error {}

type PieceGenerator = (dimensions: BoxDimensions) => DielinePiece[];

const FORMULAS: Record<number, Record<string, PieceGenerator>> = {
  1: {
    "tuck-top": (d) => [{ name: "Thân hộp", geometry: generateTuckTopDieline(d) }],
    pillow: (d) => [{ name: "Thân hộp", geometry: generatePillowBoxDieline(d) }],
    "lid-base": (d) => {
      const { base, lid } = generateLidBaseDieline(d);
      return [
        { name: "Đáy (hộp dương)", geometry: base },
        { name: "Nắp (hộp âm)", geometry: lid },
      ];
    },
    "sleeve-drawer": (d) => {
      const { sleeve, drawer } = generateSleeveDrawerDieline(d);
      return [
        { name: "Vỏ bao", geometry: sleeve },
        { name: "Khay kéo", geometry: drawer },
      ];
    },
  },
};

/**
 * Pieces of a box with the formulas of `formulaVersion`. Throws UnsupportedFormulaVersionError for a version that was
 * never registered (a data bug, never silently replaced by the current formulas) and UnsupportedStructureError for a
 * structure without a generator in that version.
 */
export function generateDielinePieces(
  structure: string,
  dimensions: BoxDimensions,
  formulaVersion: number,
): DielinePiece[] {
  const formulas = FORMULAS[formulaVersion];
  if (!formulas) throw new UnsupportedFormulaVersionError(`Unknown dieline formula version ${formulaVersion}`);
  const generate = formulas[structure];
  if (!generate) {
    throw new UnsupportedStructureError(`No dieline generator for box structure "${structure}" (v${formulaVersion})`);
  }
  return generate(dimensions);
}

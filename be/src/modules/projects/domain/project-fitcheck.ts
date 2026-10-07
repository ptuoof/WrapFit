// Dieline pieces of a box and the server-side FitCheck of a project. Plain TypeScript: geometry and rules come from
// the parametric engine of IT2 (`@wrapfit/shared`); used by the projects module and by the print export.
import {
  type BoxDimensions,
  type CanvasElement,
  type DielinePiece,
  type FitCheckReport,
  generateDielinePieces,
  type PanelFace,
  runFitCheck,
  UnsupportedStructureError,
} from '@wrapfit/shared';

export { UnsupportedFormulaVersionError, UnsupportedStructureError } from '@wrapfit/shared';

/**
 * Every box is printed as one or more flat pieces (two-piece boxes: base + lid, sleeve + drawer), drawn with the
 * formulas of the version the project is pinned to.
 */
export function dielinePieces(structure: string, dimensions: BoxDimensions, formulaVersion: number): DielinePiece[] {
  return generateDielinePieces(structure, dimensions, formulaVersion);
}

/** Canvas elements reference a panel by its full id (`panel_front`) or its short name (`front`). */
export function matchesPanel(panel: PanelFace, panelId: string): boolean {
  return panel.id === panelId || panel.id === `panel_${panelId}`;
}

/** FitCheck score a design needs to be listed in the community template hub (UC-14). */
export const MIN_COMMUNITY_FITCHECK_SCORE = 90;

/**
 * FitCheck of a whole box: one run over the panels of every piece (two-piece boxes), so each element is checked once
 * and the score counts all violations. Panel ids are resolved like the print layout ("front" = "panel_front").
 */
export function checkProject(
  structure: string,
  dimensions: BoxDimensions,
  elements: CanvasElement[],
  formulaVersion: number,
): FitCheckReport {
  const pieces = dielinePieces(structure, dimensions, formulaVersion);
  const panels = pieces.flatMap((piece) => piece.geometry.panels);
  const resolved = elements.map((element) => {
    const panel = panels.find((p) => matchesPanel(p, element.panelId));
    return panel ? { ...element, panelId: panel.id } : element;
  });
  return runFitCheck(resolved, { ...pieces[0].geometry, panels });
}

/** Same as checkProject, but `null` for a structure that has no dieline generator yet (nothing to check against). */
export function fitCheckOf(
  structure: string,
  dimensions: BoxDimensions,
  elements: CanvasElement[],
  formulaVersion: number,
): FitCheckReport | null {
  try {
    return checkProject(structure, dimensions, elements, formulaVersion);
  } catch (error) {
    if (error instanceof UnsupportedStructureError) return null;
    throw error;
  }
}

// Dieline pieces of a box and the server-side FitCheck of a project. Plain TypeScript: geometry and rules come from
// the parametric engine of IT2 (`@wrapfit/shared`); used by the projects module and by the print export.
import {
  type BoxDimensions,
  type CanvasElement,
  type DielineGeometry,
  type FitCheckReport,
  generateLidBaseDieline,
  generatePillowBoxDieline,
  generateSleeveDrawerDieline,
  generateTuckTopDieline,
  type PanelFace,
  runFitCheck,
} from '@wrapfit/shared';

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
export function checkProject(structure: string, dimensions: BoxDimensions, elements: CanvasElement[]): FitCheckReport {
  const pieces = dielinePieces(structure, dimensions);
  const panels = pieces.flatMap((piece) => piece.geometry.panels);
  const resolved = elements.map((element) => {
    const panel = panels.find((p) => matchesPanel(p, element.panelId));
    return panel ? { ...element, panelId: panel.id } : element;
  });
  return runFitCheck(resolved, { ...pieces[0].geometry, panels });
}

/** Same as checkProject, but `null` for a structure that has no dieline generator yet (nothing to check against). */
export function fitCheckOf(structure: string, dimensions: BoxDimensions, elements: CanvasElement[]): FitCheckReport | null {
  try {
    return checkProject(structure, dimensions, elements);
  } catch (error) {
    if (error instanceof UnsupportedStructureError) return null;
    throw error;
  }
}

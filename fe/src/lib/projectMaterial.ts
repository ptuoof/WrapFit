import type { MaterialSpecification } from "@wrapfit/shared";
import type { BoxMaterialTheme } from "@/components/three/InteractiveFoldingBox3D";

/**
 * Printable paper stock (`materialSpec`, validated by the API) behind each paper look of the editor.
 * Same papers as PAPER_MATERIALS in Step2DimensionAndMaterial; the caliper comes from the dimensions.
 */
const STOCK_OF_THEME: Record<BoxMaterialTheme, Omit<MaterialSpecification, "caliper">> = {
  ivory: { type: "ivory", gsm: 300, finish: "matte" }, // Ivory 300 GSM, cán mờ
  kraft: { type: "kraft", gsm: 300, finish: "raw" }, // Kraft 300 GSM, mộc
  forest: { type: "duplex", gsm: 350, finish: "matte" }, // Duplex 350 GSM, soft-touch
  gold_foil: { type: "duplex", gsm: 400, finish: "glossy" }, // Carton bồi 400 GSM, ép kim
};

const THEMES = Object.keys(STOCK_OF_THEME) as BoxMaterialTheme[];

export function materialSpecFor(theme: BoxMaterialTheme, caliper: number): MaterialSpecification {
  return { ...STOCK_OF_THEME[theme], caliper };
}

/**
 * Paper look of a saved project: the one the editor stored in the canvas, otherwise the closest look for the stock
 * (projects created elsewhere, e.g. from a template).
 */
export function materialThemeOf(
  stored: string | null | undefined,
  spec: MaterialSpecification | undefined
): BoxMaterialTheme {
  if (stored && (THEMES as string[]).includes(stored)) return stored as BoxMaterialTheme;
  if (spec?.type === "kraft") return "kraft";
  if (spec?.type === "duplex") return spec.gsm >= 400 ? "gold_foil" : "forest";
  return "ivory";
}

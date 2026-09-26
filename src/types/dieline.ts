/**
 * Core Dieline Geometry & Physics Types
 * Owned by IT 2 (Math & Geometry) & consumed by IT 1 (2D Canvas & 3D Web)
 */

export type BoxStructureType = "tuck-top" | "sleeve-drawer" | "lid-base" | "pillow";

export interface BoxDimensions {
  length: number; // L (mm)
  width: number;  // W (mm)
  height: number; // H (mm)
  paperThickness: number; // t (mm, e.g., 0.35mm for 300 GSM)
}

export type LineType = "cut" | "crease" | "bleed" | "safe-margin";

export interface Point2D {
  x: number;
  y: number;
}

export interface DielineSegment {
  id: string;
  type: LineType;
  start: Point2D;
  end: Point2D;
  pathString?: string; // For curved tabs / notches
}

export interface PanelFace {
  id: string;
  name: string; // e.g. "front", "back", "top_lid", "bottom", "left", "right"
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  hingeAxis?: "top" | "bottom" | "left" | "right";
  hingeOffset?: number; // Fold angle relative to parent
}

export interface DielineGeometry {
  structureType: BoxStructureType;
  dimensions: BoxDimensions;
  totalBoundingBox: {
    width: number;  // Total flat paper sheet width
    height: number; // Total flat paper sheet height
  };
  panels: PanelFace[];
  segments: DielineSegment[];
}

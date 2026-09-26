/**
 * Project State & Customization Types
 * Shared Contract between IT 1 (Editor UI), IT 2 (Export/Validation) & IT 3 (DB/API)
 */

import { BoxDimensions, BoxStructureType } from "./dieline";

export type MaterialType = "ivory" | "kraft" | "duplex";

export interface MaterialSpecification {
  type: MaterialType;
  gsm: number; // e.g. 250, 300, 350
  caliper: number; // thickness in mm
  finish: "matte" | "glossy" | "raw";
}

export type CanvasElementType = "text" | "logo" | "image" | "pattern" | "barcode";

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  panelId: string; // Target panel: 'front', 'top_lid', etc.
  x: number; // mm relative to panel
  y: number; // mm relative to panel
  width: number; // mm
  height: number; // mm
  rotation: number; // degrees
  content: string; // text string or image URL
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    fillColor?: string;
    opacity?: number;
  };
  dpi?: number; // for raster images
}

export interface PackagingProject {
  id: string;
  userId: string;
  title: string;
  structureType: BoxStructureType;
  dimensions: BoxDimensions;
  material: MaterialSpecification;
  elements: CanvasElement[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Request and response shapes of the WrapFit API, as used by `src/api`. */

import { BoxDimensions, CanvasState, MaterialSpecification } from "@wrapfit/shared";

export interface ProjectDto {
  id: string;
  /** Box structure as returned by the API (`template.id`); `templateId` is only set by the offline demo data. */
  template?: { id: string; name: string };
  templateId?: string;
  title: string;
  /** Increases on every save; send it back with the next save so an older tab cannot overwrite a newer save (409). */
  version?: number;
  dimensions: BoxDimensions;
  materialSpec?: MaterialSpecification;
  canvasState?: CanvasState;
  status?: string;
  thumbnailUrl?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SnapshotDto {
  id: string;
  projectId: string;
  name: string;
  previewUrl?: string;
  createdAt: string;
}

export interface AiPatternResponse {
  theme: string;
  palette: string[];
  svgTile: string;
  description?: string;
}

export interface ExportJobStatus {
  jobId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress?: number;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

export type UnboxingParticleEffect = "confetti" | "sparkles" | "petals" | "stars";

export interface PublicUnboxingData {
  slug: string;
  recipientName: string;
  giftNote: string;
  audioTrackUrl?: string | null;
  particleEffect: UnboxingParticleEffect;
  qrCodeUrl?: string;
  viewsCount?: number;
  project?: {
    title: string;
    template?: { id: string; name: string };
    dimensions?: BoxDimensions;
    materialSpec?: any;
    canvasState?: any;
  };
}

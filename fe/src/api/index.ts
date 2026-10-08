/**
 * WrapFit API — one module per backend module (`be/src/modules/<name>`).
 * `apiClient` groups every endpoint for callers that prefer one object.
 */

import * as aiApi from "./ai";
import * as exportsApi from "./exports";
import * as projectsApi from "./projects";
import * as storageApi from "./storage";
import * as unboxingApi from "./unboxing";

export const apiClient = {
  ...projectsApi,
  ...aiApi,
  ...exportsApi,
  ...storageApi,
  ...unboxingApi,
};

export { ApiError } from "@/services/api";
export type {
  AiPatternResponse,
  ExportJobStatus,
  ProjectDto,
  PublicUnboxingData,
  SnapshotDto,
  UnboxingParticleEffect,
} from "@/types/api";

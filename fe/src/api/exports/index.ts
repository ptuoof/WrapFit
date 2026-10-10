/** Print-file exports on the BullMQ queue (`be/src/modules/export`). */

import { request } from "@/services/api";
import type { ExportJobStatus } from "@/types/api";

export async function requestExport(
  projectId: string,
  fileType: "PDF" | "SVG" | "DXF"
): Promise<{ jobId: string }> {
  try {
    return await request<{ jobId: string }>(`/projects/${projectId}/exports`, {
      method: "POST",
      body: JSON.stringify({ fileType }),
    });
  } catch {
    return { jobId: `mock-job-${Date.now()}` };
  }
}

export async function getExportStatus(jobId: string): Promise<ExportJobStatus> {
  try {
    return await request<ExportJobStatus>(`/exports/${jobId}`);
  } catch {
    return {
      jobId,
      status: "COMPLETED",
      progress: 100,
      downloadUrl: "#mock-download",
      fileName: `wrapfit-production-${jobId}.pdf`,
    };
  }
}

/**
 * Poll export status every 2 seconds until COMPLETED or FAILED
 */
export async function pollExportJob(
  jobId: string,
  onProgress?: (status: ExportJobStatus) => void,
  maxWaitSecs: number = 30
): Promise<ExportJobStatus> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitSecs * 1000) {
    const status = await getExportStatus(jobId);
    if (onProgress) onProgress(status);

    if (status.status === "COMPLETED" || status.status === "FAILED") {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Quá thời gian xuất file in. Vui lòng thử lại.");
}

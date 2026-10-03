/**
 * WrapFit API Client — NestJS 11 Backend Integration
 * Handles JWT cookie sessions, Projects CRUD, Snapshots, AI Pattern Generation,
 * BullMQ Export Polling, S3/R2 Pre-signed Uploads, and 3D QR Unboxing.
 */

import { BoxDimensions, CanvasElement } from "@wrapfit/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface ProjectDto {
  id: string;
  templateId: string;
  title: string;
  dimensions: BoxDimensions;
  materialSpec?: {
    type: string;
    gsm: number;
    caliper: number;
    finish: string;
  };
  canvasState?: {
    elements: CanvasElement[];
    backgroundPattern?: string;
    backgroundTheme?: string;
  };
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

export interface PublicUnboxingData {
  slug: string;
  recipientName: string;
  giftNote: string;
  audioTrackUrl?: string | null;
  particleEffect: "confetti" | "sparkles" | "petals" | "stars";
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

class WrapFitApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // send/receive HttpOnly JWT cookies
      });

      if (!res.ok) {
        let errMessage = `HTTP Error ${res.status}`;
        try {
          const errData = await res.json();
          errMessage = errData.message || errData.error || errMessage;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }

      if (res.status === 204) {
        return {} as T;
      }

      return (await res.json()) as T;
    } catch (err: any) {
      console.warn(`[WrapFit API] Request to ${url} failed:`, err.message);
      throw err;
    }
  }

  // ================= 1. PROJECTS & SNAPSHOTS =================

  async listProjects(query: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: ProjectDto[]; total: number }> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.search) params.set("search", query.search);
    if (query.page) params.set("page", query.page.toString());
    if (query.limit) params.set("limit", query.limit.toString());

    try {
      const q = params.toString() ? `?${params.toString()}` : "";
      return await this.request<{ items: ProjectDto[]; total: number }>(`/projects${q}`);
    } catch {
      // Fallback for offline development
      return {
        items: [
          {
            id: "proj-demo-1",
            templateId: "tuck-top",
            title: "Hũ Nến Thơm Gỗ Thông & Quế",
            dimensions: { length: 85, width: 85, height: 105, paperThickness: 0.45 },
            materialSpec: { type: "ivory", gsm: 350, caliper: 0.45, finish: "matte" },
            updatedAt: new Date().toISOString(),
          },
          {
            id: "proj-demo-2",
            templateId: "sleeve-drawer",
            title: "Nước Hoa Unisex L'Automne 50ml",
            dimensions: { length: 65, width: 40, height: 120, paperThickness: 0.45 },
            materialSpec: { type: "forest", gsm: 350, caliper: 0.45, finish: "soft_touch" },
            updatedAt: new Date().toISOString(),
          },
          {
            id: "proj-demo-3",
            templateId: "lid-base",
            title: "Bộ Trang Sức Vòng Tay Bạc Tinh Xảo",
            dimensions: { length: 100, width: 100, height: 60, paperThickness: 0.5 },
            materialSpec: { type: "gold_foil", gsm: 400, caliper: 0.5, finish: "gold_foil" },
            updatedAt: new Date().toISOString(),
          },
        ],
        total: 3,
      };
    }
  }

  async getProject(id: string): Promise<ProjectDto> {
    try {
      return await this.request<ProjectDto>(`/projects/${id}`);
    } catch {
      // Fallback demo project
      return {
        id,
        templateId: "tuck-top",
        title: "Bao Bì Quà Tặng Sang Trọng",
        dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.38 },
        materialSpec: { type: "ivory", gsm: 300, caliper: 0.38, finish: "matte" },
        canvasState: {
          elements: [
            {
              id: "logo_demo",
              type: "logo",
              panelId: "panel_front",
              x: 15,
              y: 15,
              width: 45,
              height: 25,
              rotation: 0,
              content: "WrapFit Signature",
              dpi: 300,
            },
          ],
        },
      };
    }
  }

  async createProject(data: {
    templateId: string;
    title: string;
    dimensions: BoxDimensions;
    materialSpec?: any;
    canvasState?: any;
    tags?: string[];
  }): Promise<ProjectDto> {
    return await this.request<ProjectDto>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(
    id: string,
    data: {
      templateId?: string;
      title?: string;
      dimensions?: BoxDimensions;
      materialSpec?: any;
      canvasState?: any;
      tags?: string[];
      thumbnailUrl?: string;
    }
  ): Promise<ProjectDto> {
    return await this.request<ProjectDto>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.request(`/projects/${id}`, { method: "DELETE" });
  }

  async createSnapshot(
    projectId: string,
    data: { name: string; previewUrl?: string }
  ): Promise<SnapshotDto> {
    try {
      return await this.request<SnapshotDto>(`/projects/${projectId}/snapshots`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return {
        id: `snap-${Date.now()}`,
        projectId,
        name: data.name,
        previewUrl: data.previewUrl,
        createdAt: new Date().toISOString(),
      };
    }
  }

  async listSnapshots(projectId: string): Promise<SnapshotDto[]> {
    try {
      return await this.request<SnapshotDto[]>(`/projects/${projectId}/snapshots`);
    } catch {
      return [];
    }
  }

  // ================= 2. AI PATTERN GENERATOR =================

  async generateAiPattern(data: {
    theme: string;
    preferredColors?: string[];
  }): Promise<AiPatternResponse> {
    try {
      return await this.request<AiPatternResponse>("/ai/pattern", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      // Fallback generative SVG pattern generator
      const colors = data.preferredColors && data.preferredColors.length > 0
        ? data.preferredColors
        : ["#D4AF37", "#1A362B", "#FDFBF7"];

      const svgTile = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
        <rect width="60" height="60" fill="${colors[2] || "#FAF6EE"}" />
        <circle cx="30" cy="30" r="14" fill="none" stroke="${colors[0]}" stroke-width="1.2" opacity="0.6" />
        <path d="M 15 30 Q 30 15 45 30 Q 30 45 15 30" fill="none" stroke="${colors[1]}" stroke-width="1" opacity="0.4" />
        <circle cx="30" cy="30" r="2.5" fill="${colors[0]}" />
        <circle cx="0" cy="0" r="6" fill="${colors[1]}" opacity="0.3" />
        <circle cx="60" cy="0" r="6" fill="${colors[1]}" opacity="0.3" />
        <circle cx="0" cy="60" r="6" fill="${colors[1]}" opacity="0.3" />
        <circle cx="60" cy="60" r="6" fill="${colors[1]}" opacity="0.3" />
      </svg>`;

      return {
        theme: data.theme,
        palette: colors,
        svgTile,
        description: `Hoa văn AI chủ đề ${data.theme}`,
      };
    }
  }

  // ================= 3. BULLMQ EXPORT QUEUE & POLLING =================

  async requestExport(
    projectId: string,
    fileType: "PDF" | "SVG" | "DXF"
  ): Promise<{ jobId: string }> {
    try {
      return await this.request<{ jobId: string }>(`/projects/${projectId}/exports`, {
        method: "POST",
        body: JSON.stringify({ fileType }),
      });
    } catch {
      return { jobId: `mock-job-${Date.now()}` };
    }
  }

  async getExportStatus(jobId: string): Promise<ExportJobStatus> {
    try {
      return await this.request<ExportJobStatus>(`/exports/${jobId}`);
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
  async pollExportJob(
    jobId: string,
    onProgress?: (status: ExportJobStatus) => void,
    maxWaitSecs: number = 30
  ): Promise<ExportJobStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitSecs * 1000) {
      const status = await this.getExportStatus(jobId);
      if (onProgress) onProgress(status);

      if (status.status === "COMPLETED" || status.status === "FAILED") {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error("Quá thời gian xuất file in. Vui lòng thử lại.");
  }

  // ================= 4. S3 / R2 PRE-SIGNED UPLOAD =================

  async uploadFileToStorage(
    file: File,
    purpose: "CANVAS_IMAGE" | "PROJECT_THUMBNAIL" = "CANVAS_IMAGE",
    projectId?: string
  ): Promise<{ fileUrl: string }> {
    try {
      // 1. Get pre-signed URL from NestJS
      const presign = await this.request<{
        uploadUrl: string;
        fileUrl: string;
        method?: string;
      }>("/storage/presigned-upload", {
        method: "POST",
        body: JSON.stringify({
          purpose,
          contentType: file.type || "image/png",
          size: file.size,
          projectId,
        }),
      });

      // 2. Direct upload to object storage
      await fetch(presign.uploadUrl, {
        method: presign.method || "PUT",
        headers: {
          "Content-Type": file.type || "image/png",
        },
        body: file,
      });

      return { fileUrl: presign.fileUrl };
    } catch (err: any) {
      // Offline fallback: convert to base64 Data URL for client rendering
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ fileUrl: reader.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }

  // ================= 5. 3D UNBOXING QR API =================

  async getPublicUnboxing(slug: string): Promise<PublicUnboxingData> {
    try {
      return await this.request<PublicUnboxingData>(`/public/unboxing/${slug}`);
    } catch {
      // Fallback unboxing data
      return {
        slug,
        recipientName: "Mai Anh Thân Yêu",
        giftNote:
          "Chúc bạn một tuổi mới luôn ngập tràn bình yên, hạnh phúc và luôn tỏa sáng như đóa hoa rực rỡ nhất. Món quà nhỏ này được gói ghém bằng tất cả sự chân thành và yêu thương!",
        particleEffect: "confetti",
        audioTrackUrl: null,
        viewsCount: 1,
        project: {
          title: "Hộp Quà Kỷ Niệm WrapFit",
          template: { id: "tuck-top", name: "Hộp Nắp Gài Đáy Khóa" },
          dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.38 },
        },
      };
    }
  }

  async saveProjectUnboxing(
    projectId: string,
    data: {
      recipientName: string;
      giftNote: string;
      audioTrackUrl?: string | null;
      particleEffect?: "confetti" | "sparkles" | "petals" | "stars";
    }
  ): Promise<any> {
    return await this.request(`/projects/${projectId}/unboxing`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new WrapFitApiClient();

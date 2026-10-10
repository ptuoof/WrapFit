/** Projects and snapshots (`be/src/modules/projects`). Reads fall back to demo data while the API is offline. */

import { BoxDimensions, CanvasState, MaterialSpecification } from "@wrapfit/shared";
import { request } from "@/services/api";
import type { ProjectDto, SnapshotDto } from "@/types/api";

export async function listProjects(query: {
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
    return await request<{ items: ProjectDto[]; total: number }>(`/projects${q}`);
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
          materialSpec: { type: "duplex", gsm: 350, caliper: 0.45, finish: "matte" },
          updatedAt: new Date().toISOString(),
        },
        {
          id: "proj-demo-3",
          templateId: "lid-base",
          title: "Bộ Trang Sức Vòng Tay Bạc Tinh Xảo",
          dimensions: { length: 100, width: 100, height: 60, paperThickness: 0.5 },
          materialSpec: { type: "duplex", gsm: 400, caliper: 0.5, finish: "glossy" },
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 3,
    };
  }
}

export async function getProject(id: string): Promise<ProjectDto> {
  try {
    return await request<ProjectDto>(`/projects/${id}`);
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

export async function createProject(data: {
  templateId: string;
  title: string;
  dimensions: BoxDimensions;
  materialSpec?: any;
  canvasState?: any;
  tags?: string[];
}): Promise<ProjectDto> {
  return await request<ProjectDto>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: string,
  // Fields of the API's UpdateProjectDto: anything else is rejected with 400 (the box structure cannot change).
  data: {
    title?: string;
    dimensions?: BoxDimensions;
    materialSpec?: MaterialSpecification;
    canvasState?: CanvasState;
    tags?: string[];
    thumbnailUrl?: string;
    version?: number;
  }
): Promise<ProjectDto> {
  return await request<ProjectDto>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await request(`/projects/${id}`, { method: "DELETE" });
}

export async function createSnapshot(
  projectId: string,
  data: { name: string; previewUrl?: string }
): Promise<SnapshotDto> {
  try {
    return await request<SnapshotDto>(`/projects/${projectId}/snapshots`, {
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

export async function listSnapshots(projectId: string): Promise<SnapshotDto[]> {
  try {
    return await request<SnapshotDto[]>(`/projects/${projectId}/snapshots`);
  } catch {
    return [];
  }
}

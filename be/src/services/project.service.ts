import { prisma } from "../lib/prisma";
import { CreateProjectInput, UpdateProjectInput } from "../schemas/project.schema";
import {
  BoxDimensions,
  BoxStructureType,
  CanvasElement,
  DielineGeometry,
  generateTuckTopDieline,
  generateSleeveDrawerDieline,
  generateLidBaseDieline,
  generatePillowBoxDieline,
  runFitCheck,
  FitCheckReport
} from "@wrapfit/shared";

/**
 * Combines two multi-piece dielines (e.g. Sleeve + Drawer or Lid + Base)
 * into a single unified dieline geometry for layout and FitCheck audit.
 */
function combineGeometries(geomA: DielineGeometry, geomB: DielineGeometry, gap = 20): DielineGeometry {
  const offsetX = geomA.totalBoundingBox.width + gap;
  const shiftedBPanels = geomB.panels.map((p) => ({
    ...p,
    bounds: { ...p.bounds, x: p.bounds.x + offsetX }
  }));
  const shiftedBSegments = geomB.segments.map((s) => ({
    ...s,
    start: { x: s.start.x + offsetX, y: s.start.y },
    end: { x: s.end.x + offsetX, y: s.end.y },
    pathString: s.pathString
  }));

  return {
    structureType: geomA.structureType,
    dimensions: geomA.dimensions,
    totalBoundingBox: {
      width: geomA.totalBoundingBox.width + geomB.totalBoundingBox.width + gap,
      height: Math.max(geomA.totalBoundingBox.height, geomB.totalBoundingBox.height)
    },
    panels: [...geomA.panels, ...shiftedBPanels],
    segments: [...geomA.segments, ...shiftedBSegments]
  };
}

/**
 * Helper to generate dieline geometry based on template structure type
 */
export function getDielineForStructure(
  structureType: BoxStructureType,
  dimensions: BoxDimensions
): DielineGeometry {
  switch (structureType) {
    case "sleeve-drawer": {
      const { sleeve, drawer } = generateSleeveDrawerDieline(dimensions);
      return combineGeometries(sleeve, drawer);
    }
    case "lid-base": {
      const { base, lid } = generateLidBaseDieline(dimensions);
      return combineGeometries(base, lid);
    }
    case "pillow":
      return generatePillowBoxDieline(dimensions);
    case "tuck-top":
    default:
      return generateTuckTopDieline(dimensions);
  }
}

/**
 * Automatically ensures the user exists (especially for demo-user-id)
 */
async function ensureUserExists(userId: string) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@wrapfit.local`,
        shopName: "WrapFit Craft Studio",
        subscriptionTier: "pro"
      }
    });
  }
}

export class ProjectService {
  /**
   * Create a new packaging project
   */
  static async createProject(data: CreateProjectInput) {
    const userId = data.userId || "demo-user-id";
    await ensureUserExists(userId);

    // Initial FitCheck audit if elements exist
    let fitcheckReport: FitCheckReport | null = null;
    const elements = (data.canvasState?.elements || []) as CanvasElement[];

    if (elements.length > 0) {
      const dieline = getDielineForStructure(
        (data.templateId as BoxStructureType) || "tuck-top",
        data.dimensions
      );
      fitcheckReport = runFitCheck(elements, dieline);
    }

    const project = await prisma.packagingProject.create({
      data: {
        userId,
        templateId: data.templateId,
        title: data.title,
        dimensions: data.dimensions as any,
        materialSpec: data.materialSpec as any,
        canvasState: data.canvasState as any,
        thumbnailUrl: data.thumbnailUrl || null,
        fitcheckState: (fitcheckReport as any) || null
      },
      include: {
        template: true
      }
    });

    return project;
  }

  /**
   * List projects with pagination and user filtering
   */
  static async listProjects(params: { userId?: string; limit?: number; page?: number }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId) {
      where.userId = params.userId;
    }

    const [total, projects] = await Promise.all([
      prisma.packagingProject.count({ where }),
      prisma.packagingProject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          template: {
            select: { id: true, name: true }
          },
          _count: {
            select: { exportJobs: true }
          }
        }
      })
    ]);

    return {
      data: projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single project by ID
   */
  static async getProjectById(id: string) {
    return prisma.packagingProject.findUnique({
      where: { id },
      include: {
        template: true,
        exportJobs: {
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, data: UpdateProjectInput) {
    const existing = await prisma.packagingProject.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const updatedDimensions = (data.dimensions || existing.dimensions) as unknown as BoxDimensions;
    const updatedTemplateId = (data.templateId || existing.templateId) as BoxStructureType;
    const updatedCanvasState = (data.canvasState || existing.canvasState) as any;
    const elements = (updatedCanvasState?.elements || []) as CanvasElement[];

    // Re-evaluate FitCheck on update
    const dieline = getDielineForStructure(updatedTemplateId, updatedDimensions);
    const fitcheckReport = runFitCheck(elements, dieline);

    return prisma.packagingProject.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.templateId ? { templateId: data.templateId } : {}),
        ...(data.dimensions ? { dimensions: data.dimensions as any } : {}),
        ...(data.materialSpec ? { materialSpec: data.materialSpec as any } : {}),
        ...(data.canvasState ? { canvasState: data.canvasState as any } : {}),
        ...(data.thumbnailUrl !== undefined ? { thumbnailUrl: data.thumbnailUrl } : {}),
        fitcheckState: (data.fitcheckState || fitcheckReport) as any
      },
      include: {
        template: true
      }
    });
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string) {
    const existing = await prisma.packagingProject.findUnique({ where: { id } });
    if (!existing) return null;

    return prisma.packagingProject.delete({ where: { id } });
  }

  /**
   * Run and record an explicit FitCheck audit on a project
   */
  static async auditProject(id: string) {
    const project = await prisma.packagingProject.findUnique({ where: { id } });
    if (!project) return null;

    const dims = project.dimensions as unknown as BoxDimensions;
    const structureType = project.templateId as BoxStructureType;
    const elements = ((project.canvasState as any)?.elements || []) as CanvasElement[];

    const dieline = getDielineForStructure(structureType, dims);
    const report = runFitCheck(elements, dieline);

    const updated = await prisma.packagingProject.update({
      where: { id },
      data: { fitcheckState: report as any }
    });

    return {
      projectId: id,
      report,
      updatedAt: updated.updatedAt
    };
  }
}

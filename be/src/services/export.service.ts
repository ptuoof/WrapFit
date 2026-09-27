import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma";
import { saveExportArtifact } from "./storage.service";
import { getDielineForStructure } from "./project.service";
import {
  BoxDimensions,
  BoxStructureType,
  DielineGeometry,
  exportDielineToSVG
} from "@wrapfit/shared";

export interface ExportRequestOptions {
  projectId?: string;
  structureType?: BoxStructureType;
  dimensions?: BoxDimensions;
  format?: "svg" | "pdf";
}

/**
 * Renders dieline cut and crease lines to a high-precision vector PDF
 * using exact mm-to-pt packaging conversion (1mm = 2.83465pt).
 */
export function renderDielineToPDFBuffer(dieline: DielineGeometry): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const MM_TO_PT = 2.83464567;
    const padding = 20; // 20mm margin around dieline
    const widthPt = (dieline.totalBoundingBox.width + 2 * padding) * MM_TO_PT;
    const heightPt = (dieline.totalBoundingBox.height + 2 * padding) * MM_TO_PT;

    const doc = new PDFDocument({
      size: [widthPt, heightPt],
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Header info
    doc
      .fontSize(9)
      .fillColor("#64748B")
      .text(
        `WrapFit Platform — ${dieline.structureType.toUpperCase()} DIELINE (${dieline.dimensions.length}x${dieline.dimensions.width}x${dieline.dimensions.height}mm, Paper: ${dieline.dimensions.paperThickness}mm)`,
        padding * MM_TO_PT,
        (padding - 10) * MM_TO_PT
      );

    // Draw Panels bounding boxes
    for (const panel of dieline.panels) {
      const px = (panel.bounds.x + padding) * MM_TO_PT;
      const py = (panel.bounds.y + padding) * MM_TO_PT;
      const pw = panel.bounds.width * MM_TO_PT;
      const ph = panel.bounds.height * MM_TO_PT;

      doc
        .lineWidth(0.5)
        .strokeColor("#E2E8F0")
        .rect(px, py, pw, ph)
        .stroke();

      doc
        .fontSize(7)
        .fillColor("#94A3B8")
        .text(`${panel.name} (${panel.bounds.width}x${panel.bounds.height}mm)`, px + 4, py + 4);
    }

    // Draw Crease and Cut lines
    for (const seg of dieline.segments) {
      const x1 = (seg.start.x + padding) * MM_TO_PT;
      const y1 = (seg.start.y + padding) * MM_TO_PT;
      const x2 = (seg.end.x + padding) * MM_TO_PT;
      const y2 = (seg.end.y + padding) * MM_TO_PT;

      if (seg.type === "cut") {
        doc
          .undash()
          .lineWidth(0.75)
          .strokeColor("#E53E3E") // Cut line: Red solid
          .moveTo(x1, y1)
          .lineTo(x2, y2)
          .stroke();
      } else {
        doc
          .dash(4, { space: 4 })
          .lineWidth(0.75)
          .strokeColor("#3182CE") // Crease line: Blue dashed
          .moveTo(x1, y1)
          .lineTo(x2, y2)
          .stroke();
      }
    }

    doc.end();
  });
}

export class ExportService {
  /**
   * Process and save a vector dieline export job (SVG or PDF)
   */
  static async processExport(options: ExportRequestOptions) {
    let { projectId, structureType = "tuck-top", dimensions, format = "svg" } = options;

    if (projectId) {
      const project = await prisma.packagingProject.findUnique({
        where: { id: projectId }
      });
      if (project) {
        structureType = project.templateId as BoxStructureType;
        dimensions = project.dimensions as unknown as BoxDimensions;
      }
    }

    const dims: BoxDimensions = dimensions || {
      length: 120,
      width: 80,
      height: 60,
      paperThickness: 0.35
    };

    const dieline = getDielineForStructure(structureType, dims);
    const timestamp = Date.now();
    const fileName = `wrapfit_${structureType}_${dims.length}x${dims.width}x${dims.height}_${timestamp}.${format}`;

    let fileContent: string | Buffer;
    if (format === "pdf") {
      fileContent = await renderDielineToPDFBuffer(dieline);
    } else {
      fileContent = exportDielineToSVG(dieline);
    }

    const downloadUrl = await saveExportArtifact(fileName, fileContent);

    let exportJob = null;
    if (projectId) {
      exportJob = await prisma.exportJob.create({
        data: {
          projectId,
          fileType: format,
          storageUrl: downloadUrl,
          status: "completed"
        }
      });
    }

    return {
      status: "completed",
      jobId: exportJob?.id || null,
      fileName,
      format,
      downloadUrl,
      dielineSpecs: {
        structureType,
        totalBoundingBox: dieline.totalBoundingBox,
        panelsCount: dieline.panels.length,
        creasesCount: dieline.segments.filter((s) => s.type === "crease").length,
        cutsCount: dieline.segments.filter((s) => s.type === "cut").length
      }
    };
  }
}

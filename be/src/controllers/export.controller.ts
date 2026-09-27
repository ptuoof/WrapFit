import { Request, Response } from "express";
import { ExportService } from "../services/export.service";

export class ExportController {
  static async export(req: Request, res: Response) {
    try {
      const { projectId, structureType, dimensions, format } = req.body;
      const result = await ExportService.processExport({
        projectId,
        structureType,
        dimensions,
        format: format === "pdf" ? "pdf" : "svg"
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi xuất file vector bế",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

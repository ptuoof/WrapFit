import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class TemplateController {
  static async list(_req: Request, res: Response) {
    try {
      const templates = await prisma.boxTemplate.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
      });
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi truy vấn danh sách mẫu cấu trúc hộp",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await prisma.boxTemplate.findUnique({
        where: { id }
      });

      if (!template) {
        return res.status(404).json({ error: "Không tìm thấy mẫu cấu trúc hộp này" });
      }

      res.json(template);
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi truy vấn chi tiết mẫu hộp",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

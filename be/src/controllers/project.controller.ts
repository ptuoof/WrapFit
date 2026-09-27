import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import { CreateProjectSchema, UpdateProjectSchema } from "../schemas/project.schema";

export class ProjectController {
  static async create(req: Request, res: Response) {
    try {
      const parsed = CreateProjectSchema.parse(req.body);
      const project = await ProjectService.createProject(parsed);
      res.status(201).json(project);
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({ error: "Dữ liệu không hợp lệ", details: error.errors });
      }
      res.status(500).json({
        error: "Không thể lưu dự án",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await ProjectService.listProjects({ userId, page, limit });
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi tải danh sách dự án",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await ProjectService.getProjectById(id);

      if (!project) {
        return res.status(404).json({ error: "Không tìm thấy dự án bao bì với ID này" });
      }

      res.json(project);
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi khi lấy thông tin dự án",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = UpdateProjectSchema.parse(req.body);

      const updated = await ProjectService.updateProject(id, parsed);
      if (!updated) {
        return res.status(404).json({ error: "Không tìm thấy dự án để cập nhật" });
      }

      res.json(updated);
    } catch (error: any) {
      if (error?.name === "ZodError") {
        return res.status(400).json({ error: "Dữ liệu cập nhật không hợp lệ", details: error.errors });
      }
      res.status(500).json({
        error: "Lỗi cập nhật dự án",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await ProjectService.deleteProject(id);

      if (!deleted) {
        return res.status(404).json({ error: "Không tìm thấy dự án để xóa" });
      }

      res.json({ message: "Đã xóa dự án thành công", id });
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi khi xóa dự án",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  static async audit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProjectService.auditProject(id);

      if (!result) {
        return res.status(404).json({ error: "Không tìm thấy dự án để kiểm tra FitCheck" });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi thực thi kiểm toán FitCheck",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

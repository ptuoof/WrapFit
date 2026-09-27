import { Request, Response } from "express";
import { generatePatternByTheme } from "../services/ai-pattern.service";

export class AiController {
  static suggestPattern(req: Request, res: Response) {
    const { theme } = req.body;
    if (!theme || typeof theme !== "string") {
      return res.status(400).json({
        error: "Vui lòng cung cấp từ khóa theme (vd: Giáng sinh, Pastel, Vintage, Minimalist)"
      });
    }

    try {
      const result = generatePatternByTheme(theme);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi tạo gợi ý họa tiết AI",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

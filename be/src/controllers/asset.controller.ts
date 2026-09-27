import { Request, Response } from "express";
import { saveUploadedFile, saveBase64Asset, deleteFileByUrl } from "../services/storage.service";

export class AssetController {
  /**
   * Upload an asset file (multipart or base64)
   */
  static async upload(req: Request, res: Response) {
    try {
      // 1. Multipart form file via multer
      if (req.file) {
        const result = await saveUploadedFile(req.file);
        return res.status(201).json({
          status: "success",
          asset: result
        });
      }

      // 2. Base64 payload (for canvas snapshots, SVG data, thumbnails)
      const { base64, fileName, folder = "assets" } = req.body;
      if (base64) {
        const result = await saveBase64Asset(base64, fileName, folder);
        return res.status(201).json({
          status: "success",
          asset: result
        });
      }

      return res.status(400).json({
        error: "Vui lòng tải lên file ảnh (multipart/form-data) hoặc cung cấp chuỗi base64 qua body."
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi tải lên tài nguyên ảnh/vector",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Delete an asset by its URL
   */
  static async delete(req: Request, res: Response) {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Vui lòng cung cấp URL file cần xóa" });
      }

      const deleted = await deleteFileByUrl(url);
      if (!deleted) {
        return res.status(404).json({ error: "Không tìm thấy file hoặc không thể xóa" });
      }

      res.json({ status: "success", message: "Đã xóa file thành công", url });
    } catch (error: any) {
      res.status(500).json({
        error: "Lỗi xóa file",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

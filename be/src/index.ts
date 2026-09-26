import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// 1. Health check & kiểm tra kết nối CSDL
app.get("/api/health", async (req, res) => {
  try {
    // Thử truy vấn cơ sở dữ liệu qua Prisma
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      service: "WrapFit Backend",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      database: "disconnected",
      message: "Chưa cấu hình DATABASE_URL trong file .env hoặc CSDL chưa bật",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2. Lấy danh sách các mẫu cấu trúc hộp (Box Templates) từ CSDL
app.get("/api/templates", async (req, res) => {
  try {
    const templates = await prisma.boxTemplate.findMany({
      where: { isActive: true }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Lỗi truy vấn danh sách mẫu hộp" });
  }
});

// 3. Lấy danh sách dự án của người dùng
app.get("/api/projects", async (req, res) => {
  const userId = req.query.userId as string;
  try {
    const projects = await prisma.packagingProject.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { updatedAt: "desc" },
      include: { template: true }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy danh sách dự án" });
  }
});

// 4. Lưu / Tạo mới dự án bao bì vào PostgreSQL qua Prisma
app.post("/api/projects", async (req, res) => {
  const { userId, templateId, title, dimensions, materialSpec, canvasState } = req.body;
  try {
    const newProject = await prisma.packagingProject.create({
      data: {
        userId: userId || "demo-user-id",
        templateId: templateId || "tuck-top",
        title: title || "Hộp quà tặng mới",
        dimensions: dimensions || { length: 120, width: 80, height: 60, paperThickness: 0.35 },
        materialSpec: materialSpec || { type: "kraft", gsm: 300, caliper: 0.42 },
        canvasState: canvasState || { elements: [] },
      }
    });
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({
      error: "Không thể lưu dự án vào cơ sở dữ liệu",
      detail: error instanceof Error ? error.message : String(error)
    });
  }
});

app.listen(PORT, () => {
  console.log(`[WrapFit Backend] running on http://localhost:${PORT}`);
});

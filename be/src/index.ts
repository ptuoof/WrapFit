import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { prisma } from "./lib/prisma";
import { generatePatternByTheme } from "./services/ai-pattern.service";
import { saveExportArtifact } from "./services/storage.service";
import { generateTuckTopDieline, exportDielineToSVG, BoxDimensions } from "@wrapfit/shared";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 1. Health check & kiểm tra kết nối CSDL
app.get("/api/health", async (req, res) => {
  try {
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
      message: "Chưa kết nối DATABASE_URL trong .env hoặc PostgreSQL chưa bật",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2. Lấy danh sách mẫu cấu trúc hộp (Box Templates)
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

// 3. AI Theme & Pattern Suggestion
app.post("/api/ai/pattern", (req, res) => {
  const { theme } = req.body;
  if (!theme) {
    return res.status(400).json({ error: "Vui lòng cung cấp từ khóa theme (vd: Giáng sinh, Pastel, Vintage)" });
  }
  const result = generatePatternByTheme(theme);
  res.json(result);
});

// 4. Xuất file vector bế (SVG / PDF)
app.post("/api/export", async (req, res) => {
  const { structureType = "tuck-top", dimensions } = req.body;

  const dims: BoxDimensions = dimensions || {
    length: 120,
    width: 80,
    height: 60,
    paperThickness: 0.35
  };

  // Sinh bản vẽ dieline chuẩn toán học
  const dieline = generateTuckTopDieline(dims);
  const svgContent = exportDielineToSVG(dieline);

  const fileName = `dieline_${structureType}_${Date.now()}.svg`;
  const fileUrl = await saveExportArtifact(fileName, svgContent);

  res.json({
    status: "completed",
    fileName,
    downloadUrl: fileUrl,
    dielineSpecs: {
      boundingBox: dieline.totalBoundingBox,
      panelsCount: dieline.panels.length,
      creasesCount: dieline.segments.filter(s => s.type === "crease").length
    }
  });
});

// 5. Lưu / Tạo mới dự án bao bì vào PostgreSQL
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

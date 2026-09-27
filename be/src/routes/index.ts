import { Router } from "express";
import { prisma } from "../lib/prisma";
import { projectRouter } from "./project.routes";
import { templateRouter } from "./template.routes";
import { assetRouter } from "./asset.routes";
import { aiRouter } from "./ai.routes";
import { exportRouter } from "./export.routes";

export const apiRouter = Router();

// Health check endpoint
apiRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      service: "WrapFit Backend Platform",
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

// Modular domain routes
apiRouter.use("/projects", projectRouter);
apiRouter.use("/templates", templateRouter);
apiRouter.use("/assets", assetRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/export", exportRouter);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { apiRouter } from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static Assets Hosting (uploads for user assets and export files)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Mount API routes
app.use("/api", apiRouter);

// 404 Route Handler
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint không tồn tại" });
});

// Central Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[WrapFit Backend] running on http://localhost:${PORT}`);
    console.log(`[WrapFit API] Base endpoint: http://localhost:${PORT}/api`);
  });
}

export default app;

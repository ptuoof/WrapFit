import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "WrapFit Backend",
    timestamp: new Date().toISOString()
  });
});

// Projects API Routes
app.get("/api/projects", (req, res) => {
  res.json({ message: "List of packaging projects" });
});

app.post("/api/projects", (req, res) => {
  const { title, dimensions, structureType } = req.body;
  res.status(201).json({
    id: "proj_" + Date.now(),
    title,
    dimensions,
    structureType,
    status: "created"
  });
});

app.listen(PORT, () => {
  console.log(`[WrapFit Backend] running on http://localhost:${PORT}`);
});

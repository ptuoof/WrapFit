import { Router } from "express";
import { ExportController } from "../controllers/export.controller";

export const exportRouter = Router();

exportRouter.post("/", ExportController.export);

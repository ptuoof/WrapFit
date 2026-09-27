import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";

export const projectRouter = Router();

projectRouter.post("/", ProjectController.create);
projectRouter.get("/", ProjectController.list);
projectRouter.get("/:id", ProjectController.getById);
projectRouter.put("/:id", ProjectController.update);
projectRouter.delete("/:id", ProjectController.delete);
projectRouter.post("/:id/audit", ProjectController.audit);

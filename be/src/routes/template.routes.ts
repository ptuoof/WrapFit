import { Router } from "express";
import { TemplateController } from "../controllers/template.controller";

export const templateRouter = Router();

templateRouter.get("/", TemplateController.list);
templateRouter.get("/:id", TemplateController.getById);

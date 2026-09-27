import { Router } from "express";
import { AssetController } from "../controllers/asset.controller";
import { uploadAssetMiddleware } from "../middlewares/upload.middleware";

export const assetRouter = Router();

// Handle file upload (supports multipart file via "file" field, or base64 json)
assetRouter.post("/upload", uploadAssetMiddleware.single("file"), AssetController.upload);

// Delete an uploaded asset
assetRouter.delete("/", AssetController.delete);

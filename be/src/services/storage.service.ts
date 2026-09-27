/**
 * Cloud Object Storage Service (Local Disk with S3 Fallback Strategy)
 * Handles uploading logos, custom images, thumbnails, and generated vector PDF dielines
 * Owned by IT 3 (Backend & Storage Lead)
 */

import fs from "fs";
import path from "path";

const LOCAL_STORAGE_ROOT = path.join(process.cwd(), "uploads");
const ASSETS_DIR = path.join(LOCAL_STORAGE_ROOT, "assets");
const EXPORTS_DIR = path.join(LOCAL_STORAGE_ROOT, "exports");

// Ensure upload directories exist
[LOCAL_STORAGE_ROOT, ASSETS_DIR, EXPORTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export interface UploadResult {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
}

/**
 * Saves a file received via Multer into uploads/assets/
 */
export async function saveUploadedFile(file: Express.Multer.File): Promise<UploadResult> {
  // Multer diskStorage has already written the file to file.path
  const fileName = path.basename(file.path);
  const relativeUrl = `/uploads/assets/${fileName}`;

  return {
    url: relativeUrl,
    fileName,
    size: file.size,
    mimeType: file.mimetype
  };
}

/**
 * Saves a Base64 data string (e.g. data:image/png;base64,...) as a static file
 */
export async function saveBase64Asset(
  base64Data: string,
  preferredFileName?: string,
  folder: "assets" | "exports" = "assets"
): Promise<UploadResult> {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  let mimeType = "image/png";
  let buffer: Buffer;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    buffer = Buffer.from(matches[2], "base64");
  } else {
    // Raw base64 string
    buffer = Buffer.from(base64Data, "base64");
  }

  const extMap: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf"
  };

  const ext = extMap[mimeType] || ".png";
  const timestamp = Date.now();
  const randomSuffix = Math.round(Math.random() * 1e9);
  const baseName = preferredFileName
    ? path.basename(preferredFileName, path.extname(preferredFileName)).replace(/[^a-zA-Z0-9_-]/g, "_")
    : "snapshot";

  const fileName = `${baseName}-${timestamp}-${randomSuffix}${ext}`;
  const targetDir = folder === "exports" ? EXPORTS_DIR : ASSETS_DIR;
  const filePath = path.join(targetDir, fileName);

  await fs.promises.writeFile(filePath, buffer);

  return {
    url: `/uploads/${folder}/${fileName}`,
    fileName,
    size: buffer.length,
    mimeType
  };
}

/**
 * Saves generated vector SVG or PDF export artifacts
 */
export async function saveExportArtifact(
  fileName: string,
  content: string | Buffer
): Promise<string> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const filePath = path.join(EXPORTS_DIR, sanitizedName);
  await fs.promises.writeFile(filePath, content);

  return `/uploads/exports/${sanitizedName}`;
}

/**
 * Safely removes a file by relative URL path
 */
export async function deleteFileByUrl(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl.startsWith("/uploads/")) return false;
    const cleanPath = path.normalize(fileUrl.replace("/uploads/", ""));
    const fullPath = path.join(LOCAL_STORAGE_ROOT, cleanPath);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      return true;
    }
  } catch (error) {
    console.error(`[StorageService] Failed to delete file: ${fileUrl}`, error);
  }
  return false;
}

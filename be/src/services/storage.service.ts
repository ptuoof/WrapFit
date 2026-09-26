/**
 * Cloud Object Storage Service (S3 / Local Fallback)
 * Handles uploading logos, custom images, and generated vector PDF dielines
 * Owned by IT 3 (Backend & Storage)
 */

import fs from "fs";
import path from "path";

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists for local development
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

export async function saveExportArtifact(fileName: string, content: string | Buffer): Promise<string> {
  const filePath = path.join(LOCAL_STORAGE_DIR, fileName);
  await fs.promises.writeFile(filePath, content);
  
  // In local development, return static URL path
  return `/uploads/${fileName}`;
}

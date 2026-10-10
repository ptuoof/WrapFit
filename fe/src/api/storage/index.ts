/** S3 / R2 pre-signed uploads (`be/src/storage`). */

import { request } from "@/services/api";

export type UploadPurpose = "LOGO" | "IMAGE" | "THUMBNAIL" | "AVATAR";

interface PresignedUpload {
  fileId: string;
  key: string;
  uploadUrl: string;
  method: "PUT";
  /** Signed into the URL: the PUT must send exactly these headers. */
  headers: Record<string, string>;
  fileUrl: string;
  expiresIn: number;
}

/**
 * Uploads a file straight to object storage and returns its public URL (to use in canvasState, thumbnailUrl...).
 * Throws when the API or the upload fails: the API only accepts files uploaded to WrapFit, so there is no
 * offline fallback.
 */
export async function uploadFileToStorage(
  file: File,
  purpose: UploadPurpose = "IMAGE",
  projectId?: string
): Promise<{ fileUrl: string }> {
  const presign = await request<PresignedUpload>("/storage/presigned-upload", {
    method: "POST",
    body: JSON.stringify({ purpose, contentType: file.type, size: file.size, projectId }),
  });

  const res = await fetch(presign.uploadUrl, { method: presign.method, headers: presign.headers, body: file });
  if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`);

  return { fileUrl: presign.fileUrl };
}

/** S3 / R2 pre-signed uploads (`be/src/modules/storage`). */

import { request } from "@/services/api";

export async function uploadFileToStorage(
  file: File,
  purpose: "CANVAS_IMAGE" | "PROJECT_THUMBNAIL" = "CANVAS_IMAGE",
  projectId?: string
): Promise<{ fileUrl: string }> {
  try {
    // 1. Get pre-signed URL from NestJS
    const presign = await request<{
      uploadUrl: string;
      fileUrl: string;
      method?: string;
    }>("/storage/presigned-upload", {
      method: "POST",
      body: JSON.stringify({
        purpose,
        contentType: file.type || "image/png",
        size: file.size,
        projectId,
      }),
    });

    // 2. Direct upload to object storage
    await fetch(presign.uploadUrl, {
      method: presign.method || "PUT",
      headers: {
        "Content-Type": file.type || "image/png",
      },
      body: file,
    });

    return { fileUrl: presign.fileUrl };
  } catch (err: any) {
    // Offline fallback: convert to base64 Data URL for client rendering
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ fileUrl: reader.result as string });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

/** 3D QR virtual unboxing (`be/src/modules/unboxing`). */

import { request } from "@/services/api";
import type { PublicUnboxingData, UnboxingParticleEffect } from "@/types/api";

export async function getPublicUnboxing(slug: string): Promise<PublicUnboxingData> {
  try {
    return await request<PublicUnboxingData>(`/public/unboxing/${slug}`);
  } catch {
    // Fallback unboxing data
    return {
      slug,
      recipientName: "Mai Anh Thân Yêu",
      giftNote:
        "Chúc bạn một tuổi mới luôn ngập tràn bình yên, hạnh phúc và luôn tỏa sáng như đóa hoa rực rỡ nhất. Món quà nhỏ này được gói ghém bằng tất cả sự chân thành và yêu thương!",
      particleEffect: "confetti",
      audioTrackUrl: null,
      viewsCount: 1,
      project: {
        title: "Hộp Quà Kỷ Niệm WrapFit",
        template: { id: "tuck-top", name: "Hộp Nắp Gài Đáy Khóa" },
        dimensions: { length: 120, width: 80, height: 60, paperThickness: 0.38 },
      },
    };
  }
}

export async function saveProjectUnboxing(
  projectId: string,
  data: {
    recipientName: string;
    giftNote: string;
    audioTrackUrl?: string | null;
    particleEffect?: UnboxingParticleEffect;
  }
): Promise<any> {
  return await request(`/projects/${projectId}/unboxing`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

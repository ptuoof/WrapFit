/** AI pattern generator (`be/src/modules/ai`). Falls back to a local SVG tile while the API is offline. */

import { request } from "@/services/api";
import type { AiPatternResponse } from "@/types/api";

export async function generateAiPattern(data: {
  theme: string;
  preferredColors?: string[];
}): Promise<AiPatternResponse> {
  try {
    return await request<AiPatternResponse>("/ai/pattern", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    // Fallback generative SVG pattern generator
    const colors = data.preferredColors && data.preferredColors.length > 0
      ? data.preferredColors
      : ["#D4AF37", "#1A362B", "#FDFBF7"];

    const svgTile = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
        <rect width="60" height="60" fill="${colors[2] || "#FAF6EE"}" />
        <circle cx="30" cy="30" r="14" fill="none" stroke="${colors[0]}" stroke-width="1.2" opacity="0.6" />
        <path d="M 15 30 Q 30 15 45 30 Q 30 45 15 30" fill="none" stroke="${colors[1]}" stroke-width="1" opacity="0.4" />
        <circle cx="30" cy="30" r="2.5" fill="${colors[0]}" />
        <circle cx="0" cy="0" r="6" fill="${colors[1]}" opacity="0.3" />
        <circle cx="60" cy="0" r="6" fill="${colors[1]}" opacity="0.3" />
        <circle cx="0" cy="60" r="6" fill="${colors[1]}" opacity="0.3" />
        <circle cx="60" cy="60" r="6" fill="${colors[1]}" opacity="0.3" />
      </svg>`;

    return {
      theme: data.theme,
      palette: colors,
      svgTile,
      description: `Hoa văn AI chủ đề ${data.theme}`,
    };
  }
}

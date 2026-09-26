/**
 * AI Theme & Pattern Suggestion Service
 * Generates seamless repeating SVG pattern tiles and palette recommendations based on user themes
 * Owned by IT 3 (AI & Third-party integration)
 */

export interface PatternSuggestion {
  themeName: string;
  palette: string[];
  patternSvgTile: string;
  description: string;
}

export function generatePatternByTheme(theme: string): PatternSuggestion {
  const normalized = theme.toLowerCase();

  if (normalized.includes("noel") || normalized.includes("christmas") || normalized.includes("giáng sinh")) {
    return {
      themeName: "Lễ Hội Giáng Sinh (Festive Pine)",
      palette: ["#1A362B", "#C1121F", "#FDFBF7", "#D4AF37"],
      patternSvgTile: `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M20 5 L28 20 L24 20 L30 32 L10 32 L16 20 L12 20 Z" fill="#1A362B" opacity="0.15"/></svg>`,
      description: "Họa tiết cây thông noel tối giản trên nền giấy trắng ngà, điểm xuyết ánh kim."
    };
  }

  if (normalized.includes("pastel") || normalized.includes("baby") || normalized.includes("sinh nhật")) {
    return {
      themeName: "Pastel Dream (Mộng Mơ)",
      palette: ["#FFD1DC", "#BEE1E6", "#F0E6EF", "#E2ECE9"],
      patternSvgTile: `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="4" fill="#FFD1DC" opacity="0.4"/><circle cx="0" cy="0" r="2" fill="#BEE1E6" opacity="0.4"/></svg>`,
      description: "Các đốm màu chấm bi pastel dịu nhẹ, thích hợp quà sinh nhật hoặc phụ kiện em bé."
    };
  }

  // Default: Vintage Kraft Luxury
  return {
    themeName: "Vintage Kraft (Thủ Công Sang Trọng)",
    palette: ["#D4A373", "#2B1E16", "#FAEDCD", "#D4AF37"],
    patternSvgTile: `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="50" y2="50" stroke="#D4A373" stroke-width="0.5" opacity="0.2"/><line x1="50" y1="0" x2="0" y2="50" stroke="#D4A373" stroke-width="0.5" opacity="0.2"/></svg>`,
    description: "Kẻ ca-rô mộc mạc phong cách giấy Kraft truyền thống của tiệm đồ thủ công."
  };
}

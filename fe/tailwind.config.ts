import type { Config } from "tailwindcss";
import { withStitchTheme } from "./src/features/stitch/tailwindStitch";

type ThemeExtend = NonNullable<NonNullable<Config["theme"]>["extend"]>;

/** WrapFit's own tokens. Stitch screens override the shared names per screen (see withStitchTheme). */
const appTheme: ThemeExtend = {
  colors: {
    // Stitch Surface & Container Tokens
    surface: "#faf8f5",
    "on-surface": "#1b1c18",
    "on-surface-variant": "#525a54",
    "surface-container": "#f2ece5",
    "surface-container-low": "#f8f3ec",
    "surface-container-lowest": "#ffffff",
    "surface-container-high": "#ede6de",
    "surface-container-highest": "#e7dfd6",
    background: "#faf8f5",
    "on-background": "#1b1c18",
    outline: "#79747e",
    "outline-variant": "#c4c7c5",

    // Stitch Primary Tokens
    primary: "#122e20",
    "on-primary": "#ffffff",
    "primary-container": "#122e20",
    "on-primary-container": "#ffffff",

    // Stitch Secondary Tokens
    secondary: "#1a362b",
    "on-secondary": "#ffffff",
    "secondary-container": "#d1e7dd",
    "on-secondary-container": "#0f291e",

    // Stitch Tertiary Tokens
    tertiary: "#d4af37",
    "on-tertiary": "#ffffff",
    "tertiary-container": "#faecc1",
    "on-tertiary-container": "#3d3005",

    stitch: {
      bg: "#fff8f5",
      primary: "#004ac6",
      blue: "#2563eb",
      forest: "#486458",
      gold: "#cca72f",
    },
    paper: {
      ivory: "#FDFBF7",
      cotton: "#FAF6EE",
      linen: "#F4EFE6",
      kraft: "#E8D8C8",
      "kraft-raw": "#D4A373",
      cardboard: "#C8A882",
    },
    brand: {
      forest: "#1A362B",
      "forest-dark": "#10241C",
      "forest-light": "#2D5A27",
      sage: "#52796F",
      gold: "#D4AF37",
      "gold-light": "#F5E7B2",
      terracotta: "#BC6C25",
      espresso: "#2B1E16",
    },
    vibrant: {
      cobalt: "#2563EB",
      "cobalt-dark": "#1D4ED8",
      "cobalt-light": "#3B82F6",
      coral: "#FF6B6B",
      "coral-dark": "#EE5253",
      "coral-light": "#FF8787",
      emerald: "#10B981",
      amber: "#F59E0B",
    },
    dieline: {
      cut: "#E53E3E",
      crease: "#3182CE",
      bleed: "#38A169",
      safe: "#ECC94B",
    },
    ink: {
      primary: "#1F2421",
      secondary: "#4A5568",
      muted: "#718096",
      subtle: "#A0AEC0",
    }
  },
  fontFamily: {
    serif: ["var(--font-playfair)", "Playfair Display", "Cormorant Garamond", "serif"],
    sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "DM Sans", "-apple-system", "sans-serif"],
    mono: ["var(--font-jetbrains)", "JetBrains Mono", "Menlo", "monospace"],
    "headline-lg": ["var(--font-playfair)", "Playfair Display", "serif"],
    "headline-md": ["var(--font-playfair)", "Playfair Display", "serif"],
    "headline-sm": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
    "display-hero": ["var(--font-playfair)", "Playfair Display", "serif"],
    "body-lg": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
    "body-md": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
    "body-sm": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
    "label-ui": ["var(--font-jakarta)", "Plus Jakarta Sans", "sans-serif"],
    "cad-dimension": ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
    "cad-spec-micro": ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
  },
  fontSize: {
    "display-hero": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "600" }],
    "headline-lg": ["36px", { lineHeight: "44px", letterSpacing: "-0.015em", fontWeight: "500" }],
    "headline-md": ["24px", { lineHeight: "32px", fontWeight: "500" }],
    "headline-sm": ["18px", { lineHeight: "26px", fontWeight: "600" }],
    "body-lg": ["16px", { lineHeight: "26px", fontWeight: "400" }],
    "body-md": ["14px", { lineHeight: "22px", fontWeight: "400" }],
    "body-sm": ["12px", { lineHeight: "18px", fontWeight: "400" }],
    "label-ui": ["13px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "600" }],
    "cad-dimension": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
    "cad-spec-micro": ["10px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "400" }],
  },
  spacing: {
    "space-xs": "0.25rem",
    "space-sm": "0.5rem",
    "space-md": "1rem",
    "space-lg": "1.5rem",
    "space-xl": "2.5rem",
    "gutter-sm": "1rem",
    gutter: "1.5rem",
    "gutter-lg": "2rem",
    margin: "2rem",
    "margin-mobile": "1rem",
  },
  borderRadius: {
    squircle: "16px",
    "squircle-md": "20px",
    "squircle-lg": "28px",
    "squircle-xl": "36px",
    "stitch-30": "30px",
    "stitch-32": "32px",
  },
  boxShadow: {
    tactile: "0 4px 20px -2px rgba(31, 36, 33, 0.08), 0 2px 6px -1px rgba(31, 36, 33, 0.04)",
    "tactile-lg": "0 12px 36px -4px rgba(31, 36, 33, 0.12), 0 4px 14px -2px rgba(31, 36, 33, 0.05)",
    "tactile-inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
    "gold-glow": "0 0 24px rgba(212, 175, 55, 0.25)",
    "cobalt-glow": "0 8px 24px rgba(37, 99, 235, 0.28)",
    "coral-glow": "0 8px 24px rgba(255, 107, 107, 0.28)",
  },
};

const stitch = withStitchTheme(appTheme);

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  // Stitch screens use `dark:` variants under the class strategy; keep them off unless `.dark` is set.
  darkMode: "class",
  theme: {
    extend: stitch.extend,
  },
  plugins: stitch.plugins,
};

export default config;

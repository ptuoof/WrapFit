import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
      borderRadius: {
        squircle: "16px",
        "squircle-md": "20px",
        "squircle-lg": "28px",
        "squircle-xl": "36px",
      },
      boxShadow: {
        tactile: "0 4px 20px -2px rgba(31, 36, 33, 0.08), 0 2px 6px -1px rgba(31, 36, 33, 0.04)",
        "tactile-lg": "0 12px 36px -4px rgba(31, 36, 33, 0.12), 0 4px 14px -2px rgba(31, 36, 33, 0.05)",
        "tactile-inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)",
        "gold-glow": "0 0 24px rgba(212, 175, 55, 0.25)",
        "cobalt-glow": "0 8px 24px rgba(37, 99, 235, 0.28)",
        "coral-glow": "0 8px 24px rgba(255, 107, 107, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;

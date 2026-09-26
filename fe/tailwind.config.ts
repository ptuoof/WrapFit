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
          kraft: "#E3CBB2",
          cardboard: "#C8A882",
        },
        brand: {
          forest: "#1A362B",
          sage: "#52796F",
          gold: "#D4AF37",
          terracotta: "#BC6C25",
        },
        dieline: {
          cut: "#E53E3E",
          crease: "#3182CE",
          bleed: "#38A169",
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      }
    },
  },
  plugins: [],
};
export default config;

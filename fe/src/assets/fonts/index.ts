import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

/** Editorial display serif for headings and hero copy. */
export const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

/** UI controls and labels. */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/** CAD dimension readouts (L, W, H, t in mm). */
export const jetbrains = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "700"],
});

/** Class names that expose the three font variables; put them on `<html>`. */
export const fontVariables = `${playfair.variable} ${jakarta.variable} ${jetbrains.variable}`;

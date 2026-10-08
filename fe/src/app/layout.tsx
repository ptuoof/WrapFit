import React from "react";
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import "../styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "WrapFit — Packaging Personalization & Intelligence Platform",
  description: "Make Every Present, Present. Thiết kế chiếc hộp bao quanh món quà với 100% khả thi sản xuất.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased min-h-screen bg-paper-ivory text-ink-primary font-sans selection:bg-brand-gold/30 selection:text-brand-forest">
        {children}
        <BottomNavBar />
      </body>
    </html>
  );
}

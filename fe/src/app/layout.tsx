import React from "react";
import "../styles/globals.css";

export const metadata = {
  title: "WrapFit — Packaging Personalization & Intelligence Platform",
  description: "Make Every Present, Present. Designing the box around the gift with 100% physical feasibility.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-200 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}

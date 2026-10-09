import React from "react";
import { BottomNavBar } from "@/components/layout";

/** Chrome shared by every route: the page, then the mobile bottom navigation. */
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNavBar />
    </>
  );
}

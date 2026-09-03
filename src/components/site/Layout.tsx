import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { PaintSplashes } from "./PaintSplashes";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-canvas text-ink">
      <Nav />
      <main>{children}</main>
      <Footer />
      <PaintSplashes />
    </div>
  );
}

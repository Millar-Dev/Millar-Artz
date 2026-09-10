import type { CSSProperties, ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { PaintSplashes } from "./PaintSplashes";

/**
 * The page shell.
 *
 * `dept` paints the whole page in a department's colour. It has to be applied
 * here rather than inside the page: this div carries `bg-canvas`, and a tint
 * set further down cannot get behind it — a fixed layer inside `main` sits in
 * the root stacking context's negative-z band, which paints before any block
 * background, so this cream would cover it. Setting `--dept` here means the
 * div's own `bg-canvas` resolves to the department ground, and every section
 * below inherits the same hue.
 */
export function Layout({
  children,
  dept,
}: {
  children: ReactNode;
  /** Accent for marks and buttons, and the OKLCH hue the page ground is
   *  built from. */
  dept?: { accent: string; hue: number };
}) {
  return (
    <div
      className={`relative min-h-screen bg-canvas text-ink${dept ? " dept-tinted" : ""}`}
      style={
        dept
          ? ({
              "--dept": dept.accent,
              "--dept-h": dept.hue,
            } as CSSProperties)
          : undefined
      }
    >
      <Nav />
      <main>{children}</main>
      <Footer />
      <PaintSplashes />
    </div>
  );
}

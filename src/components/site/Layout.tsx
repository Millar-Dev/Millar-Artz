import type { CSSProperties, ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { PaintSplashes } from "./PaintSplashes";
import { BackToTop } from "./BackToTop";
import { useT } from "@/lib/i18n";

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
  const t = useT();
  return (
    <div
      // `isolate` makes this the stacking context the paint splashes sit in, so
      // their negative z-index puts them above this ground but beneath every
      // section, image and line of text — decoration in the open space only,
      // never washing colour over a painting.
      className={`relative isolate min-h-screen bg-canvas text-ink${dept ? " dept-tinted" : ""}`}
      style={
        dept
          ? ({
              "--dept": dept.accent,
              "--dept-h": dept.hue,
            } as CSSProperties)
          : undefined
      }
    >
      {/* First stop for anyone using a keyboard or a screen reader: the bar
          holds a dozen links before the page itself begins. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-gold focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.2em] focus:text-band"
      >
        {t("Skip to content")}
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <BackToTop />
      <PaintSplashes />
    </div>
  );
}

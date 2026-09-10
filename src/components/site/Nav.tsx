import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { categories, disciplines } from "@/lib/gallery-data";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLockup } from "./BrandLogo";

/**
 * Primary navigation: the five departments, flanked by home, FAQ and contact.
 *
 * The departments are the site's spine, so they sit in the bar itself rather
 * than folded into a menu. Painting carries a dropdown of its own disciplines
 * — hyperrealism, abstract, murals and the rest all live under it — which is
 * where the old gallery menu went.
 *
 * Eight items don't fit a tablet bar, so the full set appears at lg and the
 * sheet takes over below it.
 */
const links = [
  { to: "/", label: "Home" } as const,
  ...disciplines.map((d) => ({ to: d.slug, label: d.label })),
  { to: "/faq", label: "FAQ" } as const,
  { to: "/contact", label: "Contact" } as const,
];

/** Reachable but no longer top-level: the archive, the story, the mailing
 *  list. Kept in the mobile sheet and the footer. */
const minorLinks = [
  { to: "/gallery", label: "Full archive" } as const,
  { to: "/about", label: "About" } as const,
  { to: "/subscription", label: "Subscribe" } as const,
];

const paintingCategories = categories.filter((c) => c.value !== "all");

export function Nav() {
  const [open, setOpen] = useState(false);
  const [paintingMenuOpen, setPaintingMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {/* Opaque scrim that fades downward, so page content disappears behind
          the bar instead of bleeding through the gap around the pill. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[180%] bg-gradient-to-b from-band via-band/85 to-transparent" />
      <div className="relative flex justify-center px-3 pt-3 pb-3 md:px-6 md:pt-5">
        <nav className="flex w-full max-w-6xl items-center justify-between rounded-full border border-white/10 bg-band px-4 py-2.5 shadow-2xl shadow-black/30 md:px-6">
          <Link
            to="/"
            className="shrink-0 text-band-foreground"
            aria-label="Artesque — home"
          >
            {/* The band scopes --brand-accent to the light rose itself, so the
                mark and the ART lettering both inherit the right one here. */}
            <BrandLockup
              className="text-[13px] md:text-[15px]"
              markClassName="h-7 w-auto md:h-8"
              accentClassName="text-brand-accent"
            />
          </Link>

          <div className="hidden items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.12em] lg:flex xl:gap-7 xl:text-[11px]">
            {links.map((l) =>
              l.to === "/paintings" ? (
                <div
                  key={l.to}
                  className="relative"
                  onMouseEnter={() => setPaintingMenuOpen(true)}
                  onMouseLeave={() => setPaintingMenuOpen(false)}
                >
                  <Link
                    to={l.to}
                    className="flex items-center gap-1 text-band-foreground/80 transition-colors hover:text-gold"
                    activeProps={{ className: "!text-gold" }}
                  >
                    {l.label}
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${paintingMenuOpen ? "rotate-180" : ""}`}
                    />
                  </Link>
                  {paintingMenuOpen && (
                    <div className="animate-fade absolute left-1/2 top-full mt-4 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-band p-4 shadow-2xl">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {paintingCategories.map((c) => (
                          <Link
                            key={c.value}
                            to="/gallery"
                            search={{ category: c.value }}
                            className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-band-foreground/80 transition-colors hover:text-gold"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                      <Link
                        to="/gallery"
                        className="mt-4 block border-t border-band-foreground/10 pt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold"
                      >
                        View full archive →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-band-foreground/80 transition-colors hover:text-gold"
                  activeProps={{ className: "!text-gold" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/contact"
              search={{ type: "commission" }}
              className="hidden rounded-full bg-gold px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-band transition-colors hover:bg-gold-soft sm:inline-block"
            >
              Commission
            </Link>
            <ThemeToggle className="text-band-foreground/70 hover:text-gold" />
            <button
              className="text-band-foreground lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div className="animate-fade absolute inset-x-3 top-full max-h-[calc(100svh-6rem)] overflow-y-auto rounded-3xl border border-white/10 bg-band p-6 shadow-2xl lg:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="border-b border-band-foreground/10 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-band-foreground"
                activeProps={{ className: "!text-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-band-foreground/40">
              More
            </p>
            <div className="mt-2 flex flex-col">
              {minorLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-band-foreground/60"
                  activeProps={{ className: "!text-gold" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <Link
              to="/contact"
              search={{ type: "commission" }}
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-band"
            >
              Start a Commission
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

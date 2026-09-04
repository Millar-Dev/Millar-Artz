import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { categories } from "@/lib/gallery-data";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const galleryCategories = categories.filter((c) => c.value !== "all");

export function Nav() {
  const [open, setOpen] = useState(false);
  const [galleryMenuOpen, setGalleryMenuOpen] = useState(false);
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
          className="shrink-0 font-display text-lg font-bold uppercase tracking-tight text-band-foreground md:text-xl"
        >
          Miller Artz
        </Link>

        <div className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.15em] md:flex">
          {links.map((l) =>
            l.to === "/gallery" ? (
              <div
                key={l.to}
                className="relative"
                onMouseEnter={() => setGalleryMenuOpen(true)}
                onMouseLeave={() => setGalleryMenuOpen(false)}
              >
                <Link
                  to={l.to}
                  className="flex items-center gap-1 text-band-foreground/80 transition-colors hover:text-gold"
                  activeProps={{ className: "!text-gold" }}
                >
                  {l.label}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${galleryMenuOpen ? "rotate-180" : ""}`}
                  />
                </Link>
                {galleryMenuOpen && (
                  <div className="animate-fade absolute left-1/2 top-full mt-4 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-band p-4 shadow-2xl">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {galleryCategories.map((c) => (
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
                      View full gallery →
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
            className="text-band-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        </nav>
      </div>

      {open && (
        <div className="animate-fade absolute inset-x-3 top-full rounded-3xl border border-white/10 bg-band p-6 shadow-2xl md:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="border-b border-band-foreground/10 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-band-foreground"
                activeProps={{ className: "!text-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
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

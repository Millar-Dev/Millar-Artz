import { Link } from "@tanstack/react-router";
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
  const [scrolled, setScrolled] = useState(false);
  const [galleryMenuOpen, setGalleryMenuOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "bg-canvas/95 border-ink/5 shadow-sm"
          : "border-transparent bg-canvas/70"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="font-display text-xl font-bold uppercase tracking-tight text-ink md:text-2xl"
          onClick={() => setOpen(false)}
        >
          Miller Artz
        </Link>

        <div className="hidden items-center gap-10 text-[10px] font-semibold uppercase tracking-[0.2em] md:flex">
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
                  className="flex items-center gap-1 text-ink transition-colors hover:text-gold"
                  activeProps={{ className: "text-gold" }}
                >
                  {l.label}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${galleryMenuOpen ? "rotate-180" : ""}`}
                  />
                </Link>
                {galleryMenuOpen && (
                  <div className="animate-fade absolute left-1/2 top-full mt-3 w-72 -translate-x-1/2 rounded-lg border border-white/10 bg-band p-4 shadow-2xl">
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
                className="text-ink transition-colors hover:text-gold"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ),
          )}
          <Link
            to="/contact"
            search={{ type: "commission" }}
            className="rounded-full bg-gold px-4 py-2 text-band transition-colors hover:bg-gold-soft"
          >
            Commission
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade border-t border-ink/5 bg-canvas md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-6 py-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="border-b border-ink/5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
                activeProps={{ className: "text-gold" }}
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
    </nav>
  );
}

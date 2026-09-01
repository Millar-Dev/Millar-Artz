import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Search, X, ZoomIn, Music, PersonStanding, Sparkles, Box } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import {
  artworks,
  categories,
  disciplines,
  type ArtworkCategory,
  type Artwork,
  type Discipline,
} from "@/lib/gallery-data";

const gallerySearchSchema = z.object({
  category: z
    .enum([
      "all",
      "hyperrealism",
      "portraits",
      "wildlife",
      "traditional",
      "abstract",
      "illusional",
      "mural",
      "modern",
      "cartoons",
    ])
    .optional(),
});

export const Route = createFileRoute("/gallery")({
  validateSearch: gallerySearchSchema,
  head: () => ({
    meta: [
      { title: "Gallery — Miller Artz" },
      {
        name: "description",
        content:
          "Browse hyperrealism, wildlife, portraits, traditional, abstract, mural, modern and cartoon works by Miller Artz.",
      },
      { property: "og:title", content: "Gallery — Miller Artz" },
      {
        property: "og:description",
        content: "The Miller Artz collection across nine disciplines, plus custom commissions.",
      },
    ],
  }),
  component: Gallery,
});

const disciplineIcons: Record<Discipline["icon"], typeof Music> = {
  music: Music,
  dance: PersonStanding,
  digital: Sparkles,
  sculpture: Box,
};

function Gallery() {
  const search = Route.useSearch();
  const [category, setCategory] = useState<ArtworkCategory | "all">(search.category ?? "all");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Artwork | null>(null);

  const filtered = useMemo(() => {
    return artworks.filter((a) => {
      const matchesCat = category === "all" || a.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.categoryLabel.toLowerCase().includes(q) ||
        a.medium.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [category, query]);

  const activeCategory = categories.find((c) => c.value === category);

  return (
    <Layout>
      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            The Collection
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ink md:text-7xl">
            The <span className="italic">Gallery</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-ink/70">
            {activeCategory?.value === "all"
              ? "A living archive across nine disciplines — filter by category or search a title, medium or subject."
              : activeCategory?.blurb}
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-20 z-30 border-y border-ink/5 bg-canvas py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar flex gap-x-6 gap-y-2 overflow-x-auto text-[11px] font-bold uppercase tracking-[0.2em]">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`shrink-0 pb-1 transition-colors ${
                  category === c.value ? "border-b border-ink text-ink" : "text-ink/40 hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artworks..."
              className="w-full rounded-sm border border-ink/10 bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          {filtered.length === 0 ? (
            <div className="py-24 text-center text-ink/50">
              <p className="font-display text-2xl italic">
                {query ? "No works match your search." : "New pieces in this category are coming soon."}
              </p>
              <p className="mt-3 text-sm">
                Looking for something in this style? A commission can be arranged.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    setCategory("all");
                    setQuery("");
                  }}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold"
                >
                  Clear filters
                </button>
                <Link
                  to="/contact"
                  search={{ type: activeCategory?.value !== "all" ? activeCategory?.value : undefined }}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink underline underline-offset-4"
                >
                  Request this style
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <figure key={a.id} className="group cursor-zoom-in" onClick={() => setViewing(a)}>
                  <div className="relative mb-4 overflow-hidden bg-stone-100">
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-canvas/90 p-2 text-ink">
                        <ZoomIn size={16} />
                      </div>
                    </div>
                  </div>
                  <figcaption className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-xl italic text-ink">{a.title}</h3>
                      <p className="mt-1 text-xs uppercase tracking-tighter text-ink/50">
                        {a.medium}
                      </p>
                    </div>
                    <StatusPill status={a.status} />
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Beyond the Canvas */}
      <section className="border-t border-ink/5 bg-ink py-24 text-canvas">
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Beyond the Canvas
          </span>
          <h2 className="mt-6 max-w-2xl font-display text-4xl italic md:text-5xl">
            Other disciplines, open for commission.
          </h2>
          <p className="mt-6 max-w-2xl text-canvas/70">
            Miller Artz is building toward a multidisciplinary studio. These practices don't have a
            gallery yet — but the conversation can start now.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {disciplines.map((d) => {
              const Icon = disciplineIcons[d.icon];
              return (
                <Link
                  key={d.id}
                  to="/contact"
                  search={{ type: d.label }}
                  className="glass group flex flex-col justify-between rounded-lg p-6 transition-transform hover:-translate-y-1"
                >
                  <Icon size={22} className="text-gold" strokeWidth={1.75} />
                  <div className="mt-8">
                    <h3 className="font-display text-xl italic">{d.label}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-canvas/60">{d.blurb}</p>
                  </div>
                  <span className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gold opacity-0 transition-opacity group-hover:opacity-100">
                    Discuss this idea →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom Orders */}
      <section id="custom-orders" className="border-t border-ink/5 bg-paper py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Custom Orders
          </span>
          <h2 className="mt-6 font-display text-4xl italic text-ink md:text-5xl">
            Commission a piece.
          </h2>
          <p className="mt-6 text-ink/70">
            Share your reference photos, describe the artwork you're imagining, and choose your preferred
            size and medium. We'll return with a quotation and timeline.
          </p>
          <Link
            to="/contact"
            search={{ type: "commission" }}
            className="mt-10 inline-block rounded-sm bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas hover:bg-gold"
          >
            Start a commission
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      {viewing && <Lightbox artwork={viewing} onClose={() => setViewing(null)} />}
    </Layout>
  );
}

function Lightbox({ artwork, onClose }: { artwork: Artwork; onClose: () => void }) {
  return (
    <div
      className="animate-fade fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 rounded-full bg-canvas/10 p-2 text-canvas hover:bg-canvas/20"
      >
        <X size={20} />
      </button>
      <div
        className="grid max-h-[92vh] w-full max-w-6xl gap-8 overflow-auto md:grid-cols-[1fr_320px]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={artwork.image}
          alt={artwork.title}
          className="max-h-[92vh] w-full rounded-sm object-contain"
        />
        <div className="text-canvas">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            {artwork.categoryLabel}
          </p>
          <h3 className="mt-4 font-display text-4xl italic">{artwork.title}</h3>
          <p className="mt-6 text-sm font-light leading-relaxed text-canvas/80">{artwork.description}</p>
          <dl className="mt-8 space-y-3 text-sm text-canvas/70">
            <div className="flex justify-between border-t border-canvas/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-canvas/50">Medium</dt>
              <dd className="text-right">{artwork.medium}</dd>
            </div>
            {artwork.dimensions && (
              <div className="flex justify-between border-t border-canvas/10 pt-3">
                <dt className="text-[10px] uppercase tracking-widest text-canvas/50">Dimensions</dt>
                <dd>{artwork.dimensions}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-canvas/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-canvas/50">Year</dt>
              <dd>{artwork.year}</dd>
            </div>
            <div className="flex justify-between border-t border-canvas/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-canvas/50">Status</dt>
              <dd className="uppercase tracking-wider">{artwork.status}</dd>
            </div>
          </dl>
          <Link
            to="/contact"
            search={{ type: artwork.categoryLabel }}
            className="mt-8 inline-block rounded-sm bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink hover:bg-canvas"
          >
            Inquire about this piece
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "bg-green-50 text-green-700",
    sold: "bg-stone-100 text-stone-500",
    featured: "bg-ink text-canvas",
    commission: "border border-ink/10 text-ink/60",
  };
  const label: Record<string, string> = {
    available: "Available",
    sold: "Sold",
    featured: "Featured",
    commission: "Commissioned",
  };
  return (
    <span
      className={`shrink-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? ""}`}
    >
      {label[status] ?? status}
    </span>
  );
}

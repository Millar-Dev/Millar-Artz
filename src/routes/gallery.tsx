import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, ZoomIn } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { artworks, categories, type ArtworkCategory, type Artwork } from "@/lib/gallery-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Miller Artz" },
      {
        name: "description",
        content:
          "Browse hyper-realistic portraits, wildlife paintings, pencil drawings and acrylic works by Miller Artz.",
      },
      { property: "og:title", content: "Gallery — Miller Artz" },
      {
        property: "og:description",
        content: "The Miller Artz collection: portraits, wildlife, hyper-realism, and custom commissions.",
      },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [category, setCategory] = useState<ArtworkCategory | "all">("all");
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
            A living archive of drawings and paintings — filter by discipline or search a title, medium or
            subject.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-20 z-30 border-y border-ink/5 bg-canvas/90 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-[0.2em]">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`pb-1 transition-colors ${
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
              <p className="font-display text-2xl italic">No works match your filters.</p>
              <button
                onClick={() => {
                  setCategory("all");
                  setQuery("");
                }}
                className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <figure
                  key={a.id}
                  className="group cursor-zoom-in"
                  onClick={() => setViewing(a)}
                >
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
                        {a.medium} • {a.dimensions}
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
          <a
            href="/contact"
            className="mt-10 inline-block rounded-sm bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas hover:bg-gold"
          >
            Start a commission
          </a>
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
              <dd>{artwork.medium}</dd>
            </div>
            <div className="flex justify-between border-t border-canvas/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-canvas/50">Dimensions</dt>
              <dd>{artwork.dimensions}</dd>
            </div>
            <div className="flex justify-between border-t border-canvas/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-canvas/50">Year</dt>
              <dd>{artwork.year}</dd>
            </div>
            <div className="flex justify-between border-t border-canvas/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-canvas/50">Status</dt>
              <dd className="uppercase tracking-wider">{artwork.status}</dd>
            </div>
          </dl>
          <a
            href="/contact"
            className="mt-8 inline-block rounded-sm bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink hover:bg-canvas"
          >
            Inquire about this piece
          </a>
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

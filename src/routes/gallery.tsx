import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Search, X, ZoomIn } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { DisciplineMark } from "@/components/site/BrandLogo";
import { disciplineIcons } from "@/components/site/discipline-icons";
import { CurrencySelect, RateNote, useCurrency } from "@/components/site/CurrencyProvider";
import { StatusPill } from "@/components/site/StatusPill";
import {
  categories,
  disciplines,
  fromArtworkRow,
  type ArtworkCategory,
  type Artwork,
  type DisciplineId,
} from "@/lib/gallery-data";
import { listArtworks } from "@/lib/data/artworks";
import { artworkListGraph, canonical, jsonLd, seoMeta } from "@/lib/seo";

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
  loader: async () => {
    const rows = await listArtworks();
    return { artworks: rows.map(fromArtworkRow) };
  },
  head: ({ loaderData }) => ({
    meta: seoMeta(
      "Art Gallery — Tanzanian Paintings & Portraits | MillerArtz",
      "Browse the MillerArtz gallery: hyperrealistic portraits, wildlife paintings, murals and abstract works by Miller S.K., a Tanzanian artist in Arusha.",
      "/gallery",
    ),
    links: [canonical("/gallery")],
    // Each piece described as a VisualArtwork so the collection can surface
    // in image and rich results rather than as one opaque page.
    scripts: [jsonLd(artworkListGraph(loaderData?.artworks ?? []))],
  }),
  component: Gallery,
});

function Gallery() {
  const search = Route.useSearch();
  const { artworks } = Route.useLoaderData();
  const { price } = useCurrency();
  const [category, setCategory] = useState<ArtworkCategory | "all">(
    search.category ?? "all",
  );
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
  }, [artworks, category, query]);

  const activeCategory = categories.find((c) => c.value === category);

  return (
    <Layout>
      <section className="grain relative pt-16 pb-10">
        <div className="glow-violet pointer-events-none absolute -right-40 top-0 h-[420px] w-[420px] rounded-full opacity-[0.12] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            The Collection
          </span>
          <h1 className="mt-6 font-display font-bold text-5xl leading-[1.05] text-ink md:text-7xl">
            The <span className="">Gallery</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-ink/70">
            {activeCategory?.value === "all"
              ? "The painting department's living archive — filter by category or search a title, medium or subject."
              : activeCategory?.blurb}
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-[4.75rem] z-30 border-y border-ink/5 bg-canvas py-4 md:top-[5.75rem]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar flex gap-x-6 gap-y-2 overflow-x-auto text-[11px] font-bold uppercase tracking-[0.2em]">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`shrink-0 pb-1 transition-colors ${
                  category === c.value
                    ? "border-b border-ink text-ink"
                    : "text-ink/40 hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <CurrencySelect />
          <div className="relative w-full max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artworks..."
              className="w-full rounded-sm border border-ink/10 bg-paper py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold focus:outline-none"
            />
          </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-gallery py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          {filtered.length === 0 ? (
            <div className="py-24 text-center text-ink/50">
              <p className="font-display font-bold text-2xl">
                {query
                  ? "No works match your search."
                  : "New pieces in this category are coming soon."}
              </p>
              <p className="mt-3 text-sm">
                Looking for something in this style? A commission can be
                arranged.
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
                  search={{
                    type:
                      activeCategory?.value !== "all"
                        ? activeCategory?.value
                        : undefined,
                  }}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink underline underline-offset-4"
                >
                  Request this style
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <figure key={a.id} className="group">
                  {/* A real link, so each painting's page is reachable and
                      crawlable from the grid. */}
                  <Link
                    to="/gallery/$id"
                    params={{ id: a.id }}
                    className="gradient-stroke mb-4 block rounded-sm p-px shadow-lg shadow-black/25"
                  >
                    <div className="relative overflow-hidden rounded-[1px] bg-paper">
                      <img
                        src={a.image}
                        alt={a.title}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Quick view stays available without leaving the grid.
                          Always shown on touch screens, which have no hover. */}
                      <button
                        type="button"
                        aria-label={`Quick view of ${a.title}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setViewing(a);
                        }}
                        className="absolute bottom-4 right-4 rounded-full bg-canvas/90 p-2 text-ink transition-opacity md:opacity-0 md:group-hover:opacity-100"
                      >
                        <ZoomIn size={16} />
                      </button>
                    </div>
                  </Link>
                  <figcaption className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display font-bold text-xl text-ink">
                        <Link to="/gallery/$id" params={{ id: a.id }} className="hover:text-gold">
                          {a.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-tighter text-ink/50">
                        {a.medium}
                        {a.dimensions ? ` · ${a.dimensions}` : ""}
                      </p>
                      {a.status !== "sold" && a.price != null && (
                        <p className="mt-1 font-display font-bold text-base text-gold">
                          {price(a.price, a.currency).display}
                        </p>
                      )}
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
      <section className="grain relative border-t border-white/5 bg-band py-14 md:py-24 text-band-foreground">
        <div className="relative mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Beyond the Canvas
          </span>
          <h2 className="mt-6 max-w-2xl font-display font-bold text-4xl md:text-5xl">
            One threshold, five disciplines.
          </h2>
          <p className="mt-6 max-w-2xl text-band-foreground/70">
            One threshold, five disciplines. Painting has a gallery here; the
            other four are open for commission and the conversation can start
            now.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {disciplines.map((d) => {
              const Icon = disciplineIcons[d.id];
              return (
                <Link
                  key={d.id}
                  to="/contact"
                  search={{ type: d.label }}
                  className="group flex flex-col justify-between rounded-lg border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-white/25"
                >
                  <DisciplineMark
                    icon={Icon}
                    accent={d.accent}
                    ground="#2E1620"
                    className="h-16 w-auto text-band-foreground/90"
                    title=""
                  />
                  <div className="mt-8">
                    <h3 className="font-display text-xl font-bold">{d.label}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-band-foreground/60">
                      {d.blurb}
                    </p>
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
      <section
        id="custom-orders"
        className="border-t border-ink/5 bg-paper py-24"
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Custom Orders
          </span>
          <h2 className="mt-6 font-display font-bold text-4xl text-ink md:text-5xl">
            Commission a piece.
          </h2>
          <p className="mt-6 text-ink/70">
            Share your reference photos, describe the artwork you're imagining,
            and choose your preferred size and medium. We'll return with a
            quotation and timeline.
          </p>
          <Link
            to="/contact"
            search={{ type: "commission" }}
            className="mt-10 inline-block rounded-sm bg-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
          >
            Start a commission
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      {viewing && (
        <Lightbox artwork={viewing} onClose={() => setViewing(null)} />
      )}
    </Layout>
  );
}

function Lightbox({
  artwork,
  onClose,
}: {
  artwork: Artwork;
  onClose: () => void;
}) {
  const { price } = useCurrency();
  return (
    <div
      className="animate-fade fixed inset-0 z-[100] flex items-center justify-center bg-band/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 rounded-full bg-band-foreground/10 p-2 text-band-foreground hover:bg-band-foreground/20"
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
        <div className="text-band-foreground">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            {artwork.categoryLabel}
          </p>
          <h3 className="mt-4 font-display font-bold text-4xl">{artwork.title}</h3>
          <p className="mt-6 text-sm font-light leading-relaxed text-band-foreground/80">
            {artwork.description}
          </p>
          <dl className="mt-8 space-y-3 text-sm text-band-foreground/70">
            <div className="flex justify-between border-t border-band-foreground/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-band-foreground/50">
                Medium
              </dt>
              <dd className="text-right">{artwork.medium}</dd>
            </div>
            {artwork.dimensions && (
              <div className="flex justify-between border-t border-band-foreground/10 pt-3">
                <dt className="text-[10px] uppercase tracking-widest text-band-foreground/50">
                  Dimensions
                </dt>
                <dd>{artwork.dimensions}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-band-foreground/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-band-foreground/50">
                Year
              </dt>
              <dd>{artwork.year}</dd>
            </div>
            <div className="flex justify-between border-t border-band-foreground/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-band-foreground/50">
                Status
              </dt>
              <dd className="uppercase tracking-wider">{artwork.status}</dd>
            </div>
            <div className="flex justify-between border-t border-band-foreground/10 pt-3">
              <dt className="text-[10px] uppercase tracking-widest text-band-foreground/50">
                Price
              </dt>
              <dd className="text-right">
                {artwork.status === "sold" ? (
                  <span className="font-display font-bold text-lg text-gold">Sold</span>
                ) : artwork.price == null ? (
                  <span className="font-display font-bold text-lg text-gold">On request</span>
                ) : (
                  <>
                    <span className="block font-display font-bold text-lg text-gold">
                      {price(artwork.price, artwork.currency).display}
                    </span>
                    {/* The set price stays visible beside any conversion. */}
                    {price(artwork.price, artwork.currency).approximate && (
                      <span className="block text-xs text-band-foreground/60">
                        {price(artwork.price, artwork.currency).original}
                      </span>
                    )}
                  </>
                )}
              </dd>
            </div>
          </dl>
          {artwork.status !== "sold" && artwork.price != null && (
            <RateNote className="mt-3 text-band-foreground/50" />
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              search={{ type: artwork.categoryLabel, piece: artwork.title }}
              className="inline-block rounded-sm bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
            >
              Inquire about this piece
            </Link>
            <Link
              to="/gallery/$id"
              params={{ id: artwork.id }}
              className="inline-block rounded-sm border border-band-foreground/20 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-band-foreground/85 hover:text-band-foreground"
            >
              View full page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

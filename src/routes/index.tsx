import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/site/Layout";
import heroLion from "@/assets/hero-lion.jpg";
import studioProcess from "@/assets/studio-process.jpg";
import { artworks, testimonials } from "@/lib/gallery-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Miller Artz — Hyper-Realistic Drawings & Paintings" },
      {
        name: "description",
        content:
          "Miller Artz creates hyper-realistic portraits, wildlife paintings and custom commissions. Where imagination meets creativity.",
      },
      { property: "og:title", content: "Miller Artz — Hyper-Realistic Drawings & Paintings" },
      {
        property: "og:description",
        content:
          "Original hyper-realistic drawings, wildlife paintings and bespoke commissions from Miller Artz.",
      },
    ],
  }),
  component: Home,
});

const homeFilters = ["All Works", "Hyper Realism", "Wildlife", "Portraits"] as const;

function Home() {
  const [filter, setFilter] = useState<(typeof homeFilters)[number]>("All Works");
  const recent = artworks.slice(1, 4);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-12">
          <div className="animate-reveal space-y-8 md:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              The Art of Imagination
            </span>
            <h1 className="font-display text-6xl leading-[0.9] tracking-tight text-ink md:text-7xl lg:text-8xl">
              Where <span className="italic">Stories</span> Take Shape.
            </h1>
            <p className="text-lg font-light leading-relaxed text-ink/70">
              Welcome to Miller Artz, where every drawing and painting tells a story crafted with passion,
              precision, and artistic excellence. From hyper-realistic portraits to wildlife paintings and
              custom commissions designed to capture life's most meaningful moments.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/gallery"
                className="rounded-sm bg-ink px-8 py-4 text-sm font-medium text-canvas transition-transform hover:-translate-y-0.5"
              >
                View Gallery
              </Link>
              <Link
                to="/contact"
                className="rounded-sm border border-ink/20 px-8 py-4 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
              >
                Custom Orders
              </Link>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="relative">
              <img
                src={heroLion}
                alt="The Monarch — hyper-realistic oil painting of a lion in golden grass"
                width={1200}
                height={1500}
                className="aspect-[4/5] w-full rounded-sm object-cover shadow-2xl outline outline-1 -outline-offset-1 outline-black/5"
              />
              <div className="absolute bottom-8 right-8 hidden max-w-xs bg-canvas p-6 shadow-xl lg:block">
                <p className="font-display text-xs italic text-ink">
                  "Every masterpiece begins with imagination."
                </p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Featured — The Monarch
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Collections */}
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="mb-4 font-display text-4xl italic text-ink">Recent Collections</h2>
              <div className="flex flex-wrap gap-6 text-[11px] font-bold uppercase tracking-[0.2em]">
                {homeFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`pb-1 transition-colors ${
                      filter === f ? "border-b border-ink text-ink" : "text-ink/40 hover:text-ink"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <Link
              to="/gallery"
              className="border-b border-ink/20 pb-1 text-sm text-ink transition-colors hover:border-ink"
            >
              View the full gallery →
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {recent.map((a) => (
              <Link
                key={a.id}
                to="/gallery"
                className="group cursor-pointer"
              >
                <div className="mb-4 overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-xl italic text-ink">{a.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-tighter text-ink/50">
                      {a.medium} • {a.dimensions}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Commission */}
      <section className="bg-ink py-24 text-canvas">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2 md:gap-20">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Bespoke Commissions
            </span>
            <h2 className="mt-6 font-display text-5xl leading-tight">
              Your Vision, <span className="italic">Our Brush</span>.
            </h2>
            <p className="mt-8 text-lg font-light leading-relaxed text-canvas/70">
              Whether it's a cherished family portrait or a specific wildlife scene, we specialize in custom
              commissions that capture life's most meaningful moments.
            </p>
            <ul className="mt-10 space-y-4">
              {[
                "Hyper-realistic portraiture from reference photos",
                "Custom sizes ranging from A4 to murals",
                "Consultations on medium: pencil, oil, or acrylic",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-sm font-light">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-10 inline-block rounded-sm bg-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-canvas"
            >
              Request a Quotation
            </Link>
          </div>
          <div className="relative">
            <img
              src={studioProcess}
              alt="Artist painting a hyper-realistic eye"
              loading="lazy"
              className="aspect-square w-full rounded-sm object-cover outline outline-1 -outline-offset-1 outline-white/10"
            />
            <div className="absolute -bottom-6 -left-6 hidden bg-gold p-8 text-ink md:block">
              <p className="font-display text-3xl font-bold italic">100+</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Custom Pieces Created</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-canvas py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Collectors' Voices
            </span>
            <h2 className="mt-6 font-display text-4xl italic text-ink md:text-5xl">
              Kind words from patrons
            </h2>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.author}
                className="border-t border-ink/10 pt-8"
              >
                <blockquote className="font-display text-xl italic leading-snug text-ink">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
                  {t.author} — <span className="text-gold">{t.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-ink/5 bg-paper py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Newsletter</span>
          <h2 className="mt-6 font-display text-4xl italic text-ink md:text-5xl">
            Join the Collector's Circle
          </h2>
          <p className="mt-6 text-ink/60">
            Early access to new collections, studio notes, and exclusive artwork previews — delivered when
            there's something worth sharing.
          </p>
          <Link
            to="/subscription"
            className="mt-10 inline-block rounded-sm bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas transition-colors hover:bg-gold"
          >
            Subscribe now
          </Link>
        </div>
      </section>
    </Layout>
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

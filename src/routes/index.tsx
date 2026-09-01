import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { artworks, commissionSteps, disciplines } from "@/lib/gallery-data";
import { Music, PersonStanding, Sparkles, Box } from "lucide-react";
import type { ArtworkCategory, Discipline } from "@/lib/gallery-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Miller Artz — Hyperrealism, Wildlife & Custom Art Commissions" },
      {
        name: "description",
        content:
          "Miller Artz is a Tanzania-based studio working across hyperrealism, wildlife, portraits, traditional, abstract, mural and cartoon art. Where imagination meets creativity.",
      },
      { property: "og:title", content: "Miller Artz — Where Imagination Meets Creativity" },
      {
        property: "og:description",
        content:
          "Original hyperrealistic drawings, wildlife paintings, murals and bespoke commissions from Miller Artz.",
      },
    ],
  }),
  component: Home,
});

const heroIds = ["woman-of-the-savanna", "kindred-bee-eaters", "the-storyteller", "uprising"];
const heroSlides = heroIds
  .map((id) => artworks.find((a) => a.id === id))
  .filter((a): a is NonNullable<typeof a> => Boolean(a));

const disciplineIcons: Record<Discipline["icon"], typeof Music> = {
  music: Music,
  dance: PersonStanding,
  digital: Sparkles,
  sculpture: Box,
};

const rows: { title: string; categories: ArtworkCategory[] }[] = [
  { title: "Wildlife", categories: ["wildlife"] },
  { title: "Hyperrealism", categories: ["hyperrealism"] },
  { title: "Portraits", categories: ["portraits"] },
  { title: "Traditional & Cultural", categories: ["traditional"] },
  { title: "Beyond the Expected", categories: ["abstract", "illusional", "mural", "modern", "cartoons"] },
];

function Home() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 5500);
    return () => clearInterval(id);
  }, []);

  const active = heroSlides[slide];

  return (
    <Layout>
      {/* Hero — crossfading featured works behind a translucent info panel */}
      <section className="relative flex h-[92vh] min-h-[640px] items-end overflow-hidden bg-ink">
        {heroSlides.map((a, i) => (
          <img
            key={a.id}
            src={a.image}
            alt={a.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out ${
              i === slide ? "opacity-100" : "opacity-0"
            } ${i === slide ? "animate-slow-zoom" : ""}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20">
          <div className="glass max-w-xl rounded-lg p-8 md:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              The Art of Imagination
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] text-canvas md:text-6xl">
              Where <span className="italic">Stories</span> Take Shape.
            </h1>
            <p className="mt-5 text-base font-light leading-relaxed text-canvas/75">
              Hyperrealistic portraits, wildlife paintings, murals and custom commissions from a
              Tanzania-based studio — nine disciplines, one hand.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/gallery"
                className="rounded-sm bg-canvas px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
              >
                View Gallery
              </Link>
              <Link
                to="/contact"
                search={{ type: "commission" }}
                className="rounded-sm border border-canvas/30 px-8 py-4 text-sm font-medium text-canvas transition-colors hover:bg-canvas/10"
              >
                Custom Orders
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            {heroSlides.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setSlide(i)}
                aria-label={`Show ${a.title}`}
                className={`h-1 rounded-full transition-all ${
                  i === slide ? "w-10 bg-gold" : "w-4 bg-canvas/30 hover:bg-canvas/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category rows — Netflix-style horizontal scroll */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl space-y-16 px-6">
          {rows.map((row) => {
            const items = artworks.filter((a) => row.categories.includes(a.category));
            if (items.length === 0) return null;
            return (
              <div key={row.title}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="font-display text-2xl italic text-ink md:text-3xl">{row.title}</h2>
                  <Link
                    to="/gallery"
                    search={{ category: row.categories.length === 1 ? row.categories[0] : "all" }}
                    className="shrink-0 border-b border-ink/20 pb-1 text-xs uppercase tracking-[0.15em] text-ink/60 transition-colors hover:border-ink hover:text-ink"
                  >
                    See all →
                  </Link>
                </div>
                <div className="no-scrollbar -mx-6 flex gap-5 overflow-x-auto px-6 pb-2">
                  {items.map((a) => (
                    <Link
                      key={a.id}
                      to="/gallery"
                      search={{ category: a.category }}
                      className="group relative w-[220px] shrink-0 overflow-hidden rounded-sm sm:w-[260px]"
                    >
                      <img
                        src={a.image}
                        alt={a.title}
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="glass absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
                        <h3 className="truncate font-display text-lg italic text-canvas">{a.title}</h3>
                        <p className="mt-1 text-[10px] uppercase tracking-widest text-canvas/60">
                          {a.medium}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
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
              Whether it's a cherished family portrait, a wildlife piece, a mural for a wall that needs
              one, or something outside the usual — we specialise in commissions built around what you
              actually want.
            </p>
            <ul className="mt-10 space-y-4">
              {[
                "Hyperrealistic portraiture from reference photos",
                "Custom sizes ranging from A4 to full exterior murals",
                "Nine disciplines to choose from, plus room for new ideas",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 text-sm font-light">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              search={{ type: "commission" }}
              className="mt-10 inline-block rounded-sm bg-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-canvas"
            >
              Request a Quotation
            </Link>
          </div>

          <div className="space-y-6">
            {commissionSteps.map((s) => (
              <div key={s.step} className="glass flex gap-5 rounded-lg p-6">
                <span className="font-display text-3xl italic text-gold">{s.step}</span>
                <div>
                  <h3 className="font-display text-xl italic text-canvas">{s.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-canvas/70">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond the Canvas teaser */}
      <section className="bg-canvas py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                Beyond the Canvas
              </span>
              <h2 className="mt-4 font-display text-4xl italic text-ink md:text-5xl">
                New disciplines, open now.
              </h2>
            </div>
            <Link
              to="/gallery"
              className="border-b border-ink/20 pb-1 text-sm text-ink transition-colors hover:border-ink"
            >
              See the full studio scope →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {disciplines.map((d) => {
              const Icon = disciplineIcons[d.icon];
              return (
                <Link
                  key={d.id}
                  to="/contact"
                  search={{ type: d.label }}
                  className="group flex flex-col justify-between rounded-lg border border-ink/10 bg-paper p-6 transition-all hover:-translate-y-1 hover:border-gold/40"
                >
                  <Icon size={22} className="text-gold" strokeWidth={1.75} />
                  <div className="mt-8">
                    <h3 className="font-display text-xl italic text-ink">{d.label}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-ink/60">{d.blurb}</p>
                  </div>
                </Link>
              );
            })}
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

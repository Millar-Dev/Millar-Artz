import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { Layout } from "@/components/site/Layout";
import {
  artworks,
  categories,
  commissionSteps,
  disciplines,
} from "@/lib/gallery-data";
import { Music, PersonStanding, Sparkles, Box } from "lucide-react";
import type { ArtworkCategory, Discipline } from "@/lib/gallery-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Miller Artz — Hyperrealism, Wildlife & Custom Art Commissions",
      },
      {
        name: "description",
        content:
          "Miller Artz is a Tanzania-based studio working across hyperrealism, wildlife, portraits, traditional, abstract, mural and cartoon art. Where imagination meets creativity.",
      },
      {
        property: "og:title",
        content: "Miller Artz — Where Imagination Meets Creativity",
      },
      {
        property: "og:description",
        content:
          "Original hyperrealistic drawings, wildlife paintings, murals and bespoke commissions from Miller Artz.",
      },
    ],
  }),
  component: Home,
});

const byId = (id: string) => artworks.find((a) => a.id === id)!;

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
  {
    title: "Beyond the Expected",
    categories: ["abstract", "illusional", "mural", "modern", "cartoons"],
  },
];

const heroWords = ["Where", "stories", "take", "shape."];
const quickCategories = categories.filter((c) =>
  ["wildlife", "hyperrealism", "traditional", "abstract"].includes(c.value),
);
const marqueeIds = [
  "bee-eaters-in-flight",
  "giraffe-nocturne",
  "one-love-tribute",
  "technicolor-zebra",
  "break-through",
  "twilight-dancer",
  "the-herd",
  "cartoon-study-penguin",
];
const mobileSlideIds = [
  "woman-of-the-savanna",
  "kindred-bee-eaters",
  "the-storyteller",
  "uprising",
  "prism-dancer",
];

function Home() {
  return (
    <Layout>
      {/* Hero — a scattered gallery wall, not a slideshow. Every piece invites a hover. */}
      <section className="grain relative overflow-hidden pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="glow-gold pointer-events-none absolute -left-40 -top-20 h-[520px] w-[520px] rounded-full opacity-[0.22] blur-3xl" />
        <div className="glow-teal pointer-events-none absolute -right-32 top-32 h-[420px] w-[420px] rounded-full opacity-[0.18] blur-3xl" />
        <div className="glow-coral pointer-events-none absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full opacity-[0.14] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                The Art of Imagination
              </span>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ink md:text-7xl">
                {heroWords.map((word, i) => (
                  <span
                    key={word}
                    className="animate-reveal inline-block"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {word === "stories" ? (
                      <span className="italic">{word}</span>
                    ) : (
                      word
                    )}
                    {i < heroWords.length - 1 ? " " : ""}
                  </span>
                ))}
              </h1>
              <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-ink/70">
                A Tanzania-based studio working by hand across nine disciplines
                — hyperrealistic portraits, wildlife in oil and acrylic, murals,
                and whatever you bring us next.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {quickCategories.map((c) => (
                  <Link
                    key={c.value}
                    to="/gallery"
                    search={{ category: c.value }}
                    className="glass rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-band-foreground/85 transition-colors hover:text-gold"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/gallery"
                  className="rounded-sm bg-gold px-8 py-4 text-sm font-medium text-band transition-transform hover:-translate-y-0.5"
                >
                  View Gallery
                </Link>
                <Link
                  to="/contact"
                  search={{ type: "commission" }}
                  className="glass rounded-sm px-8 py-4 text-sm font-medium text-band-foreground transition-colors hover:text-gold"
                >
                  Custom Orders
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              {/* Desktop / large tablet — fanned collage, a scrolling ribbon
                  of thumbnails layered above it. Hover any piece to bring it
                  forward. */}
              <div className="relative hidden lg:block">
                <div className="relative mx-auto aspect-square">
                  <HeroCard
                    artwork={byId("woman-of-the-savanna")}
                    className="left-[8%] top-0 w-[52%] rotate-[-4deg]"
                    z={10}
                  />
                  <HeroCard
                    artwork={byId("kindred-bee-eaters")}
                    className="right-0 top-[6%] w-[42%] rotate-[7deg]"
                    z={20}
                  />
                  <HeroCard
                    artwork={byId("uprising")}
                    className="bottom-[18%] left-0 w-[40%] rotate-[9deg]"
                    z={20}
                  />
                  <HeroCard
                    artwork={byId("the-storyteller")}
                    className="bottom-[4%] right-[6%] w-[44%] rotate-[-6deg]"
                    z={30}
                  />
                  <HeroCard
                    artwork={byId("prism-dancer")}
                    className="left-[28%] top-[38%] w-[34%] rotate-[3deg]"
                    z={40}
                  />
                </div>
                <div className="glass absolute -top-5 left-1/2 z-50 w-[108%] -translate-x-1/2 overflow-hidden rounded-full py-3 shadow-2xl">
                  <div className="animate-marquee flex w-max gap-4 px-4">
                    {[...marqueeIds, ...marqueeIds].map((id, i) => (
                      <img
                        key={`${id}-${i}`}
                        src={byId(id).image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-full object-cover opacity-95 ring-2 ring-white/25"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile / tablet — slides stacked in front of one another,
                  fading automatically to reveal the next. */}
              <MobileHeroSlides className="lg:hidden" />
            </div>
          </div>

          {/* Intro — a little about the artist, more on the About page */}
          <div className="mt-16 max-w-2xl border-t border-ink/10 pt-10 lg:mt-24">
            <p className="text-base font-light leading-relaxed text-ink/70">
              I'm Miller S.K. — the hand behind Miller Artz. What started as
              graphite portraits and wildlife studies has grown into a studio
              working across nine disciplines, based here in Tanzania and
              built one commission at a time.
            </p>
            <Link
              to="/about"
              className="mt-4 inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-sm font-medium text-gold transition-colors hover:border-gold"
            >
              More about me →
            </Link>
          </div>
        </div>
        <div
          className="frayed-bottom"
          style={{ "--frayed-color": "var(--color-paper)" } as CSSProperties}
        />
      </section>

      {/* Category rows — Netflix-style horizontal scroll */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl space-y-16 px-6">
          {rows.map((row) => {
            const items = artworks.filter((a) =>
              row.categories.includes(a.category),
            );
            if (items.length === 0) return null;
            return (
              <div key={row.title}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="font-display text-2xl italic text-ink md:text-3xl">
                    {row.title}
                  </h2>
                  <Link
                    to="/gallery"
                    search={{
                      category:
                        row.categories.length === 1 ? row.categories[0] : "all",
                    }}
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
                      className="gradient-stroke group relative w-[220px] shrink-0 overflow-hidden rounded-lg p-1 sm:w-[260px]"
                    >
                      <div className="relative overflow-hidden rounded-[7px]">
                        <img
                          src={a.image}
                          alt={a.title}
                          loading="lazy"
                          className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="glass absolute inset-x-0 bottom-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
                          <h3 className="truncate font-display text-lg italic text-band-foreground">
                            {a.title}
                          </h3>
                          <p className="mt-1 text-[10px] uppercase tracking-widest text-band-foreground/60">
                            {a.medium}
                          </p>
                        </div>
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
      <section className="bg-band py-24 text-band-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2 md:gap-20">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Bespoke Commissions
            </span>
            <h2 className="mt-6 font-display text-5xl leading-tight">
              Your Vision, <span className="italic">Our Brush</span>.
            </h2>
            <p className="mt-8 text-lg font-light leading-relaxed text-band-foreground/70">
              Whether it's a cherished family portrait, a wildlife piece, a
              mural for a wall that needs one, or something outside the usual —
              we specialise in commissions built around what you actually want.
            </p>
            <ul className="mt-10 space-y-4">
              {[
                "Hyperrealistic portraiture from reference photos",
                "Custom sizes ranging from A4 to full exterior murals",
                "Nine disciplines to choose from, plus room for new ideas",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-4 text-sm font-light"
                >
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              search={{ type: "commission" }}
              className="mt-10 inline-block rounded-sm bg-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-band transition-colors hover:bg-gold-soft"
            >
              Request a Quotation
            </Link>
          </div>

          <div className="space-y-6">
            {commissionSteps.map((s) => (
              <div
                key={s.step}
                className="flex gap-5 rounded-lg border border-white/10 bg-white/[0.03] p-6"
              >
                <span className="font-display text-3xl italic text-gold">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-display text-xl italic text-band-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-band-foreground/70">
                    {s.body}
                  </p>
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
                    <h3 className="font-display text-xl italic text-ink">
                      {d.label}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-ink/60">
                      {d.blurb}
                    </p>
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
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Newsletter
          </span>
          <h2 className="mt-6 font-display text-4xl italic text-ink md:text-5xl">
            Join the Collector's Circle
          </h2>
          <p className="mt-6 text-ink/60">
            Early access to new collections, studio notes, and exclusive artwork
            previews — delivered when there's something worth sharing.
          </p>
          <Link
            to="/subscription"
            className="mt-10 inline-block rounded-sm bg-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-band transition-colors hover:bg-gold-soft"
          >
            Subscribe now
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function MobileHeroSlides({ className = "" }: { className?: string }) {
  const slides = mobileSlideIds.map(byId);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % slides.length), 3200);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className={`relative mx-auto aspect-[4/5] max-w-sm ${className}`}>
      {slides.map((a, i) => (
        <div
          key={a.id}
          className={`gradient-stroke absolute inset-0 rounded-2xl p-1 shadow-2xl transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={a.image}
            alt={a.title}
            loading={i === 0 ? "eager" : "lazy"}
            className="h-full w-full rounded-[14px] object-cover"
          />
          <div className="absolute inset-x-1 bottom-1 rounded-b-[14px] bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
            <p className="font-display text-lg italic text-white">{a.title}</p>
          </div>
        </div>
      ))}
      <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((a, i) => (
          <span
            key={a.id}
            className={`h-1 rounded-full transition-all ${
              i === active ? "w-6 bg-gold" : "w-1.5 bg-ink/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function HeroCard({
  artwork,
  className,
  z,
}: {
  artwork: (typeof artworks)[number];
  className: string;
  z: number;
}) {
  return (
    <Link
      to="/gallery"
      search={{ category: artwork.category }}
      className={`group absolute overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/10 transition-all duration-500 ease-out hover:z-50 hover:rotate-0 hover:scale-110 ${className}`}
      style={{ zIndex: z }}
    >
      <img
        src={artwork.image}
        alt={artwork.title}
        loading="eager"
        className="aspect-[3/4] w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="truncate font-display text-sm italic text-white">
          {artwork.title}
        </p>
      </div>
    </Link>
  );
}

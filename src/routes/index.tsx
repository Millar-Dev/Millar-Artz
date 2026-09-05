import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { Layout } from "@/components/site/Layout";
import { categories, commissionSteps, disciplines, fromArtworkRow } from "@/lib/gallery-data";
import { listArtworks } from "@/lib/data/artworks";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getSiteImage } from "@/lib/data/site-images";
import artistPortraitFallback from "@/assets/me-portrait.jpg";
import { Music, PersonStanding, Sparkles, Box } from "lucide-react";
import type { Artwork, ArtworkCategory, Discipline } from "@/lib/gallery-data";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [rows, settings, portrait] = await Promise.all([
      listArtworks(),
      getSiteSettings(),
      // Same record the About page uses, so replacing the portrait in the
      // Studio updates the artist message here too.
      getSiteImage({ data: "about_portrait" }),
    ]);
    return { artworks: rows.map(fromArtworkRow), settings, portrait };
  },
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

/** Used when the Studio hasn't chosen a hero selection yet. */
const DEFAULT_HERO_IDS = [
  "uprising",
  "kindred-bee-eaters",
  "woman-of-the-savanna",
  "the-storyteller",
  "prism-dancer",
];

/** The bouquet: five stems fanning out of one point low-centre. Outer petals
 *  sit higher and lean further out; the centre stem stands tallest and in
 *  front, the way a gathered bunch reads. Index order runs left → right.
 *
 *  The outer pair are inset from the stage edges rather than pinned to 0:
 *  rotating a card about its bottom edge swings its top corner outward, so
 *  a petal flush to the edge gets its corner shaved off by the hero's
 *  overflow-hidden on narrower desktops. The inset is the swing clearance. */
/** Dust motes falling through the spotlight. Irregular sizes, offsets and
 *  durations so the drift never reads as a repeating pattern. */
const MOTES = [
  { left: "6%", size: "3px", delay: "0s", duration: "11s", drift: "14px" },
  { left: "14%", size: "2px", delay: "3.4s", duration: "9s", drift: "-10px" },
  { left: "23%", size: "4px", delay: "1.2s", duration: "13s", drift: "18px" },
  { left: "31%", size: "2px", delay: "6.1s", duration: "10s", drift: "-6px" },
  { left: "39%", size: "3px", delay: "2.3s", duration: "12s", drift: "10px" },
  { left: "47%", size: "2px", delay: "7.8s", duration: "9.5s", drift: "-14px" },
  { left: "55%", size: "4px", delay: "0.7s", duration: "14s", drift: "8px" },
  { left: "63%", size: "2px", delay: "4.6s", duration: "10.5s", drift: "-12px" },
  { left: "71%", size: "3px", delay: "8.9s", duration: "11.5s", drift: "16px" },
  { left: "79%", size: "2px", delay: "2.9s", duration: "9.8s", drift: "-8px" },
  { left: "87%", size: "3px", delay: "5.5s", duration: "12.5s", drift: "12px" },
  { left: "94%", size: "2px", delay: "10.2s", duration: "10.8s", drift: "-16px" },
];

const BOUQUET = [
  { className: "bottom-[7%] left-[12%] w-[30%] origin-bottom rotate-[-20deg]", z: 10 },
  { className: "bottom-[2%] left-[19%] w-[34%] origin-bottom rotate-[-10deg]", z: 20 },
  { className: "bottom-0 left-1/2 w-[36%] -translate-x-1/2 origin-bottom rotate-0", z: 40 },
  { className: "bottom-[2%] right-[19%] w-[34%] origin-bottom rotate-[10deg]", z: 20 },
  { className: "bottom-[7%] right-[12%] w-[30%] origin-bottom rotate-[20deg]", z: 10 },
];

function Home() {
  const { artworks, settings, portrait } = Route.useLoaderData();
  const byId = (id: string) => artworks.find((a) => a.id === id);
  const artistPortrait = portrait?.image_path || artistPortraitFallback;

  // Studio-chosen hero pieces, falling back to the defaults (and skipping any
  // id that no longer exists, so deleting an artwork can't blank the hero).
  const chosenIds = (settings.hero_collage_ids || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const heroPieces = (chosenIds.length ? chosenIds : DEFAULT_HERO_IDS)
    .map(byId)
    .filter((a): a is Artwork => Boolean(a))
    .slice(0, BOUQUET.length);

  return (
    <Layout>
      {/* Hero — a scattered gallery wall, not a slideshow. Every piece invites a hover. */}
      <section className="grain relative overflow-hidden pb-28 pt-14 md:pb-36 md:pt-20">
        <div className="glow-gold pointer-events-none absolute -left-40 -top-20 h-[520px] w-[520px] rounded-full opacity-[0.22] blur-3xl" />
        <div className="glow-teal pointer-events-none absolute -right-32 top-32 h-[420px] w-[420px] rounded-full opacity-[0.18] blur-3xl" />
        <div className="glow-coral pointer-events-none absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full opacity-[0.14] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-12">
            {/* min-w-0 is load-bearing: the marquee inside is w-max (~1170px
                of thumbnails), and a grid item defaults to min-width:auto —
                so without this the column grows to fit it and shoves the
                headline and copy off the side of a phone screen. */}
            <div className="min-w-0 lg:col-span-6">
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

              {/* Scrolling ribbon of the collection, sitting under the intro
                  where it has room to breathe. */}
              <div className="glass mt-8 max-w-md overflow-hidden rounded-full py-3 shadow-xl">
                <div className="animate-marquee flex w-max gap-4 px-4">
                  {[...marqueeIds, ...marqueeIds]
                    .map((id) => byId(id))
                    .filter((a): a is Artwork => Boolean(a))
                    .map((a, i) => (
                      <img
                        key={`${a.id}-${i}`}
                        src={a.image}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-full object-cover opacity-95 ring-2 ring-white/25"
                      />
                    ))}
                </div>
              </div>

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

            <div className="min-w-0 lg:col-span-6">
              {/* Desktop / large tablet — the pieces fan out of a single
                  point like flowers gathered in a bunch: tight and low in
                  the centre, opening wider and higher toward the edges.
                  Hover any piece to bring it upright and forward. */}
              <div className="relative hidden lg:block">
                <div className="relative mx-auto aspect-[5/4] w-full max-w-[36rem]">
                  {/* Studio spotlight. Three stacked radial gradients, no hard
                      edges anywhere: a wide ambient wash that bleeds into the
                      hero background, a brighter core centred on the bouquet,
                      and a warm pool at the base where the light lands. All
                      sit at z-0, under every card, so the light falls behind
                      the work rather than washing over it. */}
                  {/* Screen blending is what makes these read as emitted
                      light rather than a translucent film — warm gold at low
                      alpha over a warm brown ground is nearly invisible
                      otherwise, which is exactly how the first attempt
                      failed. */}
                  <div
                    aria-hidden="true"
                    className="animate-spotlight pointer-events-none absolute -inset-x-[24%] -top-[34%] bottom-[-16%] z-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 58% 54% at 50% 34%, color-mix(in oklab, var(--gold) 62%, transparent) 0%, color-mix(in oklab, var(--gold) 30%, transparent) 40%, transparent 74%)",
                      filter: "blur(40px)",
                      mixBlendMode: "screen",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="animate-spotlight pointer-events-none absolute inset-x-[2%] top-[-10%] bottom-[4%] z-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 44% 46% at 50% 40%, color-mix(in oklab, var(--gold-soft) 85%, transparent) 0%, color-mix(in oklab, var(--gold) 45%, transparent) 42%, transparent 76%)",
                      filter: "blur(46px)",
                      mixBlendMode: "screen",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="animate-spotlight pointer-events-none absolute inset-x-[8%] bottom-[-6%] z-0 h-[34%]"
                    style={{
                      background:
                        "radial-gradient(ellipse 54% 62% at 50% 72%, color-mix(in oklab, var(--gold) 70%, transparent) 0%, transparent 70%)",
                      filter: "blur(38px)",
                      mixBlendMode: "screen",
                    }}
                  />

                  {/* Dust drifting down through the beam. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-[14%] -top-[12%] bottom-[8%] z-0 overflow-hidden"
                  >
                    {MOTES.map((m, i) => (
                      <span
                        key={i}
                        className="animate-mote absolute top-0 rounded-full bg-gold-soft"
                        style={
                          {
                            left: m.left,
                            height: m.size,
                            width: m.size,
                            opacity: 0,
                            filter: "blur(0.5px)",
                            animationDelay: m.delay,
                            animationDuration: m.duration,
                            "--mote-drift": m.drift,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                  {heroPieces.map((artwork, i) =>
                    artwork ? (
                      <HeroCard
                        key={artwork.id}
                        artwork={artwork}
                        className={BOUQUET[i].className}
                        z={BOUQUET[i].z}
                      />
                    ) : null,
                  )}
                </div>
              </div>

              {/* Mobile / tablet — slides stacked in front of one another,
                  fading automatically to reveal the next. */}
              <MobileHeroSlides artworks={artworks} className="lg:hidden" />
            </div>
          </div>

          {/* The artist speaking directly to the visitor — portrait beside the
              note on desktop, stacked on mobile. Deliberately restrained: a
              hairline, a soft ground and one warm accent edge, so it reads as
              a gallery placard rather than a chat app. */}
          <div className="mt-16 max-w-2xl border-t border-ink/10 pt-10 lg:mt-24">
            <figure className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="relative shrink-0">
                <span
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-full bg-gold/25 blur-md"
                />
                <img
                  src={artistPortrait}
                  alt="Miller S.K., founder of Miller Artz"
                  loading="lazy"
                  className="relative h-16 w-16 rounded-full object-cover ring-1 ring-gold/40 sm:h-[4.5rem] sm:w-[4.5rem]"
                />
              </div>

              <figcaption className="min-w-0 rounded-2xl rounded-tl-sm border border-ink/10 bg-paper/45 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                  Miller S.K.
                </p>
                <p className="mt-3 text-base font-light leading-relaxed text-ink/75">
                  I'm Miller S.K. — the hand behind Miller Artz. What started as
                  graphite portraits and wildlife studies has grown into a
                  studio working across nine disciplines, based here in Tanzania
                  and built one commission at a time.
                </p>
                <Link
                  to="/about"
                  className="mt-4 inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-sm font-medium text-gold transition-colors hover:border-gold"
                >
                  More about me →
                </Link>
              </figcaption>
            </figure>
          </div>
        </div>
        {/* Torn edge pinned to the very bottom of the section — the hero's
            pb- clears it, so it never rides up over the intro copy. */}
        {/* Inline positioning deliberately: the .frayed-bottom utility sets
            position:relative itself, which beat the absolute class and left
            the torn edge sitting on top of the intro copy. */}
        <div
          className="frayed-bottom"
          style={
            {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              "--frayed-color": "var(--color-gallery)",
            } as CSSProperties
          }
        />
      </section>

      {/* Category rows — Netflix-style horizontal scroll */}
      <section className="bg-gallery py-20">
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
                      className="gradient-stroke group relative w-[220px] shrink-0 overflow-hidden rounded-sm p-px shadow-lg shadow-black/25 sm:w-[260px]"
                    >
                      <div className="relative overflow-hidden rounded-[1px]">
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

function MobileHeroSlides({
  artworks,
  className = "",
}: {
  artworks: Artwork[];
  className?: string;
}) {
  const slides = mobileSlideIds
    .map((id) => artworks.find((a) => a.id === id))
    .filter((a): a is Artwork => Boolean(a));
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const id = setInterval(() => setActive((v) => (v + 1) % slides.length), 3200);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

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
  artwork: Artwork | undefined;
  className: string;
  z: number;
}) {
  if (!artwork) return null;
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

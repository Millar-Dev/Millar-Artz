import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { BrandMark, DisciplineMark } from "@/components/site/BrandLogo";
import { disciplineIcons } from "@/components/site/discipline-icons";
import { disciplines, fromArtworkRow } from "@/lib/gallery-data";
import { listArtworks } from "@/lib/data/artworks";
import { artistGraph, canonical, jsonLd } from "@/lib/seo";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/lib/gallery-data";

/**
 * The directory.
 *
 * Artesque is five disciplines, not a painting studio with hobbies, so the
 * first thing a visitor meets is the threshold itself and five doorways off
 * it — not a wall of paintings. The painting department's own page carries
 * what used to live here.
 */
export const Route = createFileRoute("/")({
  loader: async () => {
    const rows = await listArtworks();
    return { artworks: rows.map(fromArtworkRow) };
  },
  head: () => ({
    meta: [
      { title: "Artesque — The threshold to what's possible" },
      {
        name: "description",
        content:
          "Artesque is a Tanzania-based studio across five disciplines — painting, music, dance, sculpture and acrobatics. One threshold, and whatever you bring us next.",
      },
      {
        property: "og:title",
        content: "Artesque — The threshold to what's possible",
      },
      {
        property: "og:description",
        content:
          "Five disciplines under one roof: painting, music, dance, sculpture and acrobatics. Commissions open.",
      },
    ],
    links: [canonical("/")],
    scripts: [jsonLd(artistGraph())],
  }),
  component: Home,
});

/** Rises one word at a time as the page settles. */
const heroWords = ["Where", "stories", "take", "shape."];

/** What the studio is for, said three ways. Kept short — the departments
 *  below carry the detail. */
const promises = [
  {
    title: "One conversation, five disciplines",
    body: "A brief that needs a mural, a score and a troupe doesn't need three studios. It needs one threshold.",
  },
  {
    title: "Made by hand, in Tanzania",
    body: "Every discipline is practised, not outsourced — work made here, by people you can talk to directly.",
  },
  {
    title: "Commissioned, not catalogued",
    body: "Nothing here is mass-produced. Each piece begins as a conversation about what you actually need.",
  },
];

function Home() {
  const { artworks } = Route.useLoaderData();
  // Real pieces, so the directory opens onto actual work rather than stock.
  const featured = artworks.slice(0, 6);

  return (
    <Layout>
      {/* ── The threshold ───────────────────────────────────────────────
          A field of arches drifting sideways behind the name, with the whole
          lockup floating up as the page settles. */}
      <section className="relative isolate overflow-hidden bg-band text-band-foreground">
        <div
          aria-hidden="true"
          className="pattern-field pointer-events-none absolute inset-0 opacity-70"
        />
        {/* Holds the type legible over the field without flattening it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 62% at 50% 45%, rgba(46,22,32,0.94) 0%, rgba(46,22,32,0.72) 55%, rgba(46,22,32,0.5) 100%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[calc(100svh-6rem)] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          {/* The mark lands first, then the name letter by letter, then the
              rest — hence the staggered delays throughout. */}
          <BrandMark
            className="animate-float-in h-20 w-auto text-band-foreground md:h-24"
            ground="#2E1620"
            title=""
          />

          <h1 className="mt-8 font-display text-5xl font-bold uppercase leading-none tracking-[-0.01em] md:text-7xl">
            {"ARTESQUE".split("").map((ch, i) => (
              <span
                key={i}
                className="animate-float-in inline-block"
                style={{ animationDelay: `${0.18 + i * 0.045}s` }}
              >
                <span className={i < 3 ? "text-brand-accent" : undefined}>
                  {ch}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="animate-float-in mt-5 text-[11px] font-bold uppercase tracking-[0.42em] text-band-foreground/70 md:text-xs"
            style={{ animationDelay: "0.62s" }}
          >
            The threshold to what's possible
          </p>

          <h2 className="mt-10 font-display text-3xl italic leading-tight md:text-5xl">
            {heroWords.map((word, i) => (
              <span
                key={word}
                className="animate-float-in inline-block"
                style={{ animationDelay: `${0.78 + i * 0.11}s` }}
              >
                {word}
                {i < heroWords.length - 1 ? " " : ""}
              </span>
            ))}
          </h2>

          <p
            className="animate-float-in mt-6 max-w-xl text-base font-light leading-relaxed text-band-foreground/75 md:text-lg"
            style={{ animationDelay: "1.24s" }}
          >
            A Tanzania-based studio across five disciplines — painting, music,
            dance, sculpture and acrobatics. Step through whichever doorway you
            came for.
          </p>

          <div
            className="animate-float-in mt-10 flex flex-wrap justify-center gap-3"
            style={{ animationDelay: "1.4s" }}
          >
            {disciplines.map((d) => (
              <Link
                key={d.id}
                to={d.slug}
                className="rounded-full border border-white/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-band-foreground/85 transition-colors hover:border-white/40 hover:text-band-foreground"
              >
                {d.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The directory ───────────────────────────────────────────────
          The five departments, each carrying its own mark and colour. This is
          the point of the home page. */}
      <section className="py-14 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
                The departments
              </span>
              <h2 className="mt-4 font-display text-4xl italic text-ink md:text-5xl">
                One threshold, five disciplines
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-ink/60">
              Each keeps the arch and takes its own colour and its own object in
              the doorway. Step through any of them.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {disciplines.map((d) => {
              const Icon = disciplineIcons[d.id];
              return (
                <Link
                  key={d.id}
                  to={d.slug}
                  style={{ ["--dept" as string]: d.accent }}
                  className="group relative flex flex-col overflow-hidden border border-ink/10 bg-paper/70 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--dept)]"
                >
                  {/* The department's colour washing in from its own corner. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
                    style={{ backgroundColor: "var(--dept)" }}
                  />
                  <DisciplineMark
                    icon={Icon}
                    accent={d.accent}
                    className="relative h-16 w-auto text-ink/85"
                    title=""
                  />
                  <h3 className="relative mt-6 font-display text-2xl text-ink">
                    {d.label}
                  </h3>
                  <p
                    className="relative mt-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: "var(--dept)" }}
                  >
                    {d.tagline}
                  </p>
                  <p className="relative mt-4 grow text-sm font-light leading-relaxed text-ink/65">
                    {d.blurb}
                  </p>
                  <span className="relative mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/70 transition-colors group-hover:text-[var(--dept)]">
                    {d.status === "live"
                      ? "Browse the work"
                      : "Open for commission"}
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              );
            })}

            {/* Sixth cell, so the grid closes on a note rather than a gap. */}
            <div className="flex flex-col justify-between border border-dashed border-ink/15 p-7">
              <div>
                <h3 className="font-display text-2xl italic text-ink">
                  Something else entirely?
                </h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-ink/65">
                  The five departments are where the studio works today, not a
                  fence around it. If your brief crosses them — or falls outside
                  all of them — say so, and we'll tell you honestly whether
                  we're the right hands for it.
                </p>
              </div>
              <Link
                to="/contact"
                search={{ type: "general" }}
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gold"
              >
                Ask us
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why one studio ──────────────────────────────────────────── */}
      <section className="border-y border-ink/5 bg-paper py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-3">
          {promises.map((p) => (
            <div key={p.title}>
              <h3 className="font-display text-xl text-ink">{p.title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink/65">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── A look at the work ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-14 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-4xl italic text-ink">
                A look at the work
              </h2>
              <Link
                to="/paintings"
                className="inline-flex items-center gap-2 border-b border-gold/40 pb-1 text-sm font-medium text-gold transition-colors hover:border-gold"
              >
                Into the painting department
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {featured.map((a: Artwork) => (
                <Link
                  key={a.id}
                  to="/gallery"
                  search={{ category: a.category }}
                  className="group relative aspect-[3/4] overflow-hidden rounded-sm ring-1 ring-ink/10"
                >
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="block truncate font-display text-sm italic text-white">
                      {a.title}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Step through ────────────────────────────────────────────── */}
      <section className="grain relative bg-band py-14 text-band-foreground md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <BrandMark
            className="mx-auto h-14 w-auto text-band-foreground"
            ground="#2E1620"
            title=""
          />
          <h2 className="mt-8 font-display text-3xl italic md:text-4xl">
            Bring us what you have in mind
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-light leading-relaxed text-band-foreground/70">
            A commission starts as a conversation — what it's for, where it will
            live, and what it needs to do. A quotation follows within a few
            days.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              search={{ type: "commission" }}
              className="rounded-sm bg-gold px-8 py-4 text-sm font-medium text-band transition-transform hover:-translate-y-0.5"
            >
              Start a commission
            </Link>
            <Link
              to="/about"
              className="glass rounded-sm px-8 py-4 text-sm font-medium text-band-foreground transition-colors hover:text-gold"
            >
              About the studio
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

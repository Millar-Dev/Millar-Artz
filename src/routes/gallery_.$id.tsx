import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { StatusPill } from "@/components/site/StatusPill";
import { CurrencySelect, RateNote, useCurrency } from "@/components/site/CurrencyProvider";
import { fromArtworkRow, type Artwork } from "@/lib/gallery-data";
import { listArtworks } from "@/lib/data/artworks";
import { artworkGraph, artworkPath, absoluteUrl, canonical, jsonLd, seoMeta } from "@/lib/seo";
import { shareImage, sized, srcSetFor } from "@/lib/images";

/**
 * A page for one painting.
 *
 * The gallery used to show every piece in a pop-up with no address of its
 * own, so a painting couldn't be shared, bookmarked or found in search on its
 * own. Each one now has a real URL, with its title and description in the
 * page head, the painting itself as the link preview, structured data naming
 * the artist, and a way straight to an enquiry about that piece.
 *
 * `gallery_.$id` — the trailing underscore keeps this page out of the gallery
 * route's layout while still living at /gallery/<id>.
 */
export const Route = createFileRoute("/gallery_/$id")({
  loader: async ({ params }) => {
    const all = (await listArtworks()).map(fromArtworkRow);
    const index = all.findIndex((a) => a.id === params.id);
    if (index === -1) throw notFound();
    const artwork = all[index];
    // Same category first, then anything else, so there are always a few to
    // browse on to.
    const related = [
      ...all.filter((a) => a.id !== artwork.id && a.category === artwork.category),
      ...all.filter((a) => a.id !== artwork.id && a.category !== artwork.category),
    ].slice(0, 4);
    return {
      artwork,
      related,
      previous: all[index - 1] ?? null,
      next: all[index + 1] ?? null,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { artwork: a } = loaderData;
    const title = `${a.title} — ${a.categoryLabel} by Miller S.K. | MillerArtz`.slice(0, 70);
    const summary = a.description?.trim()
      ? a.description.trim()
      : `${a.medium} by Tanzanian artist Miller S.K.`;
    const description = `${summary} ${a.medium}${a.dimensions ? `, ${a.dimensions}` : ""}, ${a.year}. MillerArtz, Arusha, Tanzania.`
      .replace(/\s+/g, " ")
      .slice(0, 158);
    return {
      meta: seoMeta(title, description, artworkPath(a.id), {
        url: shareImage(a.image),
        alt: `${a.title} — ${a.medium} by Miller S.K.`,
      }),
      links: [canonical(artworkPath(a.id))],
      scripts: [jsonLd(artworkGraph(a))],
    };
  },
  component: ArtworkPage,
});

function ArtworkPage() {
  const { artwork: a, related, previous, next } = Route.useLoaderData();
  const { price } = useCurrency();
  const view = a.price != null ? price(a.price, a.currency) : null;

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 pb-14 pt-10 md:pb-20 md:pt-14">
        <nav aria-label="Breadcrumb" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50">
          <Link to="/gallery" className="hover:text-ink">
            Gallery
          </Link>
          <span className="mx-2 text-ink/30">/</span>
          <Link to="/gallery" search={{ category: a.category }} className="hover:text-ink">
            {a.categoryLabel}
          </Link>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* The painting. The original file is the src — it's the one search
              engines should index — and phones pick a smaller copy from srcset. */}
          <div className="lg:col-span-7">
            <div className="gradient-stroke rounded-sm p-px shadow-2xl shadow-black/25">
              <img
                src={a.image}
                srcSet={srcSetFor(a.image, [480, 720, 960, 1280], 82)}
                sizes="(min-width: 1024px) 58vw, 100vw"
                alt={`${a.title} — ${a.medium} by Miller S.K.`}
                className="block w-full rounded-[1px] bg-paper object-contain"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
                {a.categoryLabel}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
                {a.title}
              </h1>
              <p className="mt-2 text-sm text-ink/60">by Miller S.K., Arusha, Tanzania</p>

              {a.description && (
                <p className="mt-6 text-base font-light leading-relaxed text-ink/75">
                  {a.description}
                </p>
              )}

              <dl className="mt-8 space-y-3 text-sm text-ink/75">
                <Row label="Medium" value={a.medium} />
                {a.dimensions && <Row label="Dimensions" value={a.dimensions} />}
                <Row label="Year" value={String(a.year)} />
                <div className="flex items-center justify-between border-t border-ink/10 pt-3">
                  <dt className="text-[10px] uppercase tracking-widest text-ink/50">Status</dt>
                  <dd>
                    <StatusPill status={a.status} />
                  </dd>
                </div>
                <div className="flex items-start justify-between border-t border-ink/10 pt-3">
                  <dt className="text-[10px] uppercase tracking-widest text-ink/50">Price</dt>
                  <dd className="text-right">
                    {a.status === "sold" ? (
                      <span className="font-display text-xl font-bold text-gold">Sold</span>
                    ) : !view ? (
                      <span className="font-display text-xl font-bold text-gold">On request</span>
                    ) : (
                      <>
                        <span className="block font-display text-xl font-bold text-gold">
                          {view.display}
                        </span>
                        {view.approximate && (
                          <span className="block text-xs text-ink/55">{view.original}</span>
                        )}
                      </>
                    )}
                  </dd>
                </div>
              </dl>

              {a.status !== "sold" && view && (
                <div className="mt-4 space-y-2">
                  <CurrencySelect />
                  <RateNote />
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  search={{ type: a.categoryLabel, piece: a.title }}
                  className="rounded-sm bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
                >
                  {a.status === "sold" ? "Commission something similar" : "Enquire about this piece"}
                </Link>
                <ShareButtons artwork={a} />
              </div>
            </div>
          </div>
        </div>

        {/* Walk the collection in order without going back to the grid. */}
        {(previous || next) && (
          <div className="mt-14 flex items-center justify-between gap-4 border-t border-ink/10 pt-6">
            {previous ? (
              <Link
                to="/gallery/$id"
                params={{ id: previous.id }}
                className="group inline-flex min-w-0 items-center gap-2 text-sm text-ink/70 hover:text-ink"
              >
                <ArrowLeft size={16} className="shrink-0 transition-transform group-hover:-translate-x-1" />
                <span className="truncate">{previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to="/gallery/$id"
                params={{ id: next.id }}
                className="group inline-flex min-w-0 items-center gap-2 text-right text-sm text-ink/70 hover:text-ink"
              >
                <span className="truncate">{next.title}</span>
                <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink/5 bg-paper py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">More to see</h2>
            <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {related.map((r: Artwork) => (
                <Link key={r.id} to="/gallery/$id" params={{ id: r.id }} className="group block">
                  <div className="overflow-hidden rounded-sm ring-1 ring-ink/10">
                    <img
                      src={sized(r.image, 480)}
                      srcSet={srcSetFor(r.image, [320, 480, 640])}
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      alt={r.title}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 truncate font-display text-base font-bold text-ink">{r.title}</p>
                  <p className="truncate text-xs text-ink/50">{r.categoryLabel}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-t border-ink/10 pt-3">
      <dt className="text-[10px] uppercase tracking-widest text-ink/50">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

/**
 * Share on WhatsApp — the channel most local clients use — plus the phone's
 * own share sheet where there is one, and copy-link everywhere else.
 */
function ShareButtons({ artwork: a }: { artwork: Artwork }) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(artworkPath(a.id));
  const text = `${a.title} by Miller S.K. — ${url}`;
  // Decided after load: the server can't know, and guessing during render
  // would make the button change as the page hydrates.
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === "function"), []);

  async function share() {
    try {
      await navigator.share({ title: `${a.title} — MillerArtz`, text: `${a.title} by Miller S.K.`, url });
    } catch {
      /* dismissed */
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  const btn =
    "inline-flex items-center gap-2 rounded-sm border border-ink/15 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink/75 hover:text-ink";
  return (
    <>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener"
        className={btn}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle size={14} /> Share
      </a>
      {canShare ? (
        <button type="button" onClick={share} className={btn} aria-label="More ways to share">
          <Share2 size={14} />
        </button>
      ) : (
        <button type="button" onClick={copy} className={btn} aria-label="Copy link">
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? "Copied" : ""}
        </button>
      )}
    </>
  );
}

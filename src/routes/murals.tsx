import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Ruler } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { StatusPill } from "@/components/site/StatusPill";
import { disciplines, fromArtworkRow, type Artwork } from "@/lib/gallery-data";
import { listArtworks } from "@/lib/data/artworks";
import { formatSize } from "@/lib/artwork-size";
import { sized, srcSetFor } from "@/lib/images";
import { absoluteUrl, artworkPath, canonical, jsonLd, seoMeta, SITE_URL } from "@/lib/seo";
import { langOf, translator, useT } from "@/lib/i18n";

/**
 * Murals, on their own terms.
 *
 * A mural is not a canvas: it is the size of a room, it belongs to somebody's
 * wall, and what it replaced is half the story. Shown in the gallery grid
 * among 30×45cm portraits, the scale disappeared and the only question a
 * client actually has — what would this do to my wall? — went unanswered.
 *
 * So each one gets the full width of the page, the wall before it where a
 * photograph exists, and the size in metres. Nothing here is for sale: a
 * mural is commissioned, and every call to action says so.
 */
export const Route = createFileRoute("/murals")({
  loader: async () => {
    const murals = (await listArtworks()).map(fromArtworkRow).filter((a) => a.category === "mural");
    return { murals };
  },
  head: ({ matches, loaderData }) => {
    const lang = langOf(matches);
    const t = translator(lang);
    return {
      meta: seoMeta(
        t("Murals — Wall Painting by Miller S.K. | MillerArtz"),
        t("Hand-painted murals by Tanzanian artist Miller S.K. in Arusha — interior and exterior walls, painted on site at any scale. See the wall before and after."),
        "/murals",
        undefined,
        lang,
      ),
      links: [canonical("/murals", lang)],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/murals#murals`,
          name: t("Murals — Wall Painting by Miller S.K. | MillerArtz"),
          url: `${SITE_URL}/murals`,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: { "@type": "Service", name: "Mural painting", provider: { "@id": `${SITE_URL}/#studio` } },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: loaderData?.murals.length ?? 0,
            itemListElement: (loaderData?.murals ?? []).map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "VisualArtwork",
                "@id": `${absoluteUrl(artworkPath(m.id))}#artwork`,
                url: absoluteUrl(artworkPath(m.id)),
                name: m.title,
                image: m.image,
                artMedium: m.medium,
                dateCreated: String(m.year),
                creator: { "@id": `${SITE_URL}/#artist` },
              },
            })),
          },
        }),
      ],
    };
  },
  component: Murals,
});

/** Walls are measured in metres; 523 × 212 cm means nothing on a building. */
function wallSize(a: Artwork, t: (s: string, v?: Record<string, string | number>) => string) {
  if (!a.widthCm || !a.heightCm) return "";
  if (a.widthCm < 200 && a.heightCm < 200) return formatSize(a.widthCm, a.heightCm, { cm: t("cm"), in: t("in") });
  const m = (n: number) => String(Math.round(n) / 100);
  return t("{width} × {height} m of wall", { width: m(a.widthCm), height: m(a.heightCm) });
}

function Murals() {
  const t = useT();
  const { murals } = Route.useLoaderData();
  const painting = disciplines.find((d) => d.id === "painting")!;

  return (
    <Layout dept={{ accent: painting.accent, hue: painting.hue }}>
      <section className="grain relative pt-16 pb-10">
        <div className="relative mx-auto max-w-7xl px-6">
          <Link
            to="/paintings"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50 hover:text-ink"
          >
            {t("Paintings")}
          </Link>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-ink md:text-6xl">
            {t("Walls, painted by hand.")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-ink/70">
            {t("Murals are painted where they live — a shop front, a stairwell, a child's room, a compound wall. The work is quoted per wall, painted on site, and sealed to survive the weather it will stand in.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              search={{ type: "Mural" }}
              className="inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
            >
              {t("Commission a mural")}
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/faq"
              hash="payment"
              className="rounded-sm border border-ink/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
            >
              {t("How commissions work")}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gallery py-10 md:py-16">
        <div className="mx-auto max-w-5xl space-y-16 px-6 md:space-y-24">
          {murals.length === 0 ? (
            <p className="py-16 text-center font-display text-2xl text-ink/60">
              {t("Photographs of the walls are on their way.")}
            </p>
          ) : (
            murals.map((m: Artwork) => {
              const ratio = m.widthCm && m.heightCm ? m.widthCm / m.heightCm : undefined;
              return (
                <article key={m.id}>
                  {m.beforeImage ? (
                    <BeforeAfter
                      before={m.beforeImage}
                      after={m.image}
                      alt={t("{title} — mural by Miller S.K.", { title: m.title })}
                      aspectRatio={ratio}
                    />
                  ) : (
                    <div
                      className="overflow-hidden rounded-sm bg-paper ring-1 ring-ink/10"
                      style={{ aspectRatio: ratio ?? 3 / 2 }}
                    >
                      <img
                        src={sized(m.image, 1280)}
                        srcSet={srcSetFor(m.image, [480, 720, 960, 1280], 80)}
                        sizes="(min-width: 1024px) 70vw, 100vw"
                        alt={t("{title} — mural by Miller S.K.", { title: m.title })}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-display text-3xl font-bold text-ink">
                        <Link to="/gallery/$id" params={{ id: m.id }} className="hover:text-gold">
                          {m.title}
                        </Link>
                      </h2>
                      <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink/60">
                        <span className="inline-flex items-center gap-2">
                          <MapPin size={14} className="text-gold" />
                          {t(m.medium)}
                        </span>
                        {wallSize(m, t) && (
                          <span className="inline-flex items-center gap-2">
                            <Ruler size={14} className="text-gold" />
                            {wallSize(m, t)}
                          </span>
                        )}
                        <span>{m.year}</span>
                      </p>
                    </div>
                    <StatusPill status={m.status} />
                  </div>

                  {m.description && (
                    <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-ink/75">
                      {m.description}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/contact"
                      search={{ type: "Mural", piece: m.title }}
                      className="rounded-sm bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
                    >
                      {t("Commission a wall like this")}
                    </Link>
                    <Link
                      to="/gallery/$id"
                      params={{ id: m.id }}
                      className="rounded-sm border border-ink/15 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
                    >
                      {t("Details")}
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* What a client actually wants to know before they ask. */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-display text-3xl italic text-ink">{t("How a mural happens")}</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              ["01", "We look at the wall", "Together, in person where that's possible: the surface, the size, the light it gets, and whose permission is needed."],
              ["02", "A design, then a quotation", "Sketches for the wall as it is, agreed before anything is bought. The price covers paint, preparation, days on site and sealing."],
              ["03", "Painted on site", "Prepared, primed and painted where it stands, then sealed for the weather it will live in."],
            ].map(([step, title, body]) => (
              <li key={step}>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">{step}</p>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{t(title)}</h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-ink/65">{t(body)}</p>
              </li>
            ))}
          </ol>
          <Link
            to="/contact"
            search={{ type: "Mural" }}
            className="mt-10 inline-block rounded-sm bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
          >
            {t("Tell us about your wall")}
          </Link>
        </div>
      </section>
    </Layout>
  );
}

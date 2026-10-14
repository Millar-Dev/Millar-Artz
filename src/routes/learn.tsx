import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight, GraduationCap, PlayCircle } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { disciplines } from "@/lib/gallery-data";
import { fromLearnRow, listLearnPosts } from "@/lib/data/learn";
import { canonical, jsonLd, learnPath, seoMeta, SITE_URL } from "@/lib/seo";
import { srcSetFor, sized } from "@/lib/images";
import { youtubeId } from "@/lib/youtube";
import { translator, useT, langOf } from "@/lib/i18n";

/**
 * What the studio knows, given away.
 *
 * The site could show the work and say nothing about how it is made. Writing
 * the answers down — how to photograph a reference, what charcoal does that
 * graphite can't — reaches people long before they are ready to commission,
 * and it saves repeating the same replies on WhatsApp.
 */
const searchSchema = z.object({
  discipline: z
    .enum(["painting", "music", "dance", "sculpture", "acrobatics"])
    .optional(),
});

export const Route = createFileRoute("/learn")({
  validateSearch: searchSchema,
  loader: async () => ({ posts: (await listLearnPosts()).map(fromLearnRow) }),
  head: ({ matches, loaderData }) => {
    const lang = langOf(matches);
    const t = translator(lang);
    return {
      meta: seoMeta(
        t("Learn — Lessons from the MillerArtz studio"),
        t("Practical lessons from MillerArtz in Arusha: how to photograph a reference photo, what different materials do, how a commission runs, and training in dance and acrobatics."),
        "/learn",
        undefined,
        lang,
      ),
      links: [canonical("/learn", lang)],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/learn#lessons`,
          name: t("Learn — Lessons from the MillerArtz studio"),
          url: `${SITE_URL}/learn`,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          hasPart: (loaderData?.posts ?? []).map((p) => ({
            "@type": "Article",
            "@id": `${SITE_URL}${learnPath(p.id)}#article`,
            headline: p.title,
            url: `${SITE_URL}${learnPath(p.id)}`,
          })),
        }),
      ],
    };
  },
  component: Learn,
});

function Learn() {
  const t = useT();
  const { posts } = Route.useLoaderData();
  const { discipline } = Route.useSearch();
  const shown = discipline ? posts.filter((p) => p.discipline === discipline) : posts;
  // Only offer a filter for disciplines that actually have something to read.
  const present = disciplines.filter((d) => posts.some((p) => p.discipline === d.id));

  return (
    <Layout>
      <section className="grain relative pt-16 pb-10">
        <div className="glow-teal pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full opacity-[0.12] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            {t("Learn")}
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-ink md:text-6xl">
            {t("How the work is made.")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-ink/70">
            {t("Lessons from the studio — what makes a good reference photo, what each material does, how a commission actually runs, and where to train with us.")}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              to="/learn"
              className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                discipline ? "border-ink/15 text-ink/60 hover:text-ink" : "border-ink bg-ink text-canvas"
              }`}
            >
              {t("All lessons")}
            </Link>
            {present.map((d) => (
              <Link
                key={d.id}
                to="/learn"
                search={{ discipline: d.id }}
                className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                  discipline === d.id
                    ? "border-ink bg-ink text-canvas"
                    : "border-ink/15 text-ink/60 hover:text-ink"
                }`}
              >
                {t(d.label)}
              </Link>
            ))}
            <Link
              to="/learn/training"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gold hover:bg-gold/10"
            >
              <GraduationCap size={13} /> {t("Training & coaching")}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gallery py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          {shown.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-2xl font-bold text-ink/70">
                {t("The first lessons are being written.")}
              </p>
              <p className="mx-auto mt-3 max-w-lg text-sm text-ink/55">
                {t("In the meantime, ask anything directly — questions get answered whether or not you're commissioning.")}
              </p>
              <Link
                to="/contact"
                search={{ type: "general" }}
                className="mt-8 inline-block rounded-sm bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
              >
                {t("Ask the studio")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => {
                const label = disciplines.find((d) => d.id === p.discipline)?.label;
                return (
                  <article key={p.id} className="group flex flex-col">
                    <Link to="/learn/$slug" params={{ slug: p.id }} className="block">
                      <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-paper ring-1 ring-ink/10">
                        {p.cover ? (
                          <img
                            src={sized(p.cover, 640)}
                            srcSet={srcSetFor(p.cover)}
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-ink/20">
                            <GraduationCap size={40} />
                          </span>
                        )}
                        {youtubeId(p.youtubeUrl) && (
                          <span className="absolute bottom-3 right-3 text-white/90 drop-shadow">
                            <PlayCircle size={26} />
                          </span>
                        )}
                      </div>
                    </Link>
                    {label && (
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                        {t(label)}
                      </p>
                    )}
                    <h2 className="mt-2 font-display text-xl font-bold leading-snug text-ink">
                      <Link to="/learn/$slug" params={{ slug: p.id }} className="hover:text-gold">
                        {p.title}
                      </Link>
                    </h2>
                    {p.excerpt && (
                      <p className="mt-2 grow text-sm font-light leading-relaxed text-ink/65">
                        {p.excerpt}
                      </p>
                    )}
                    <Link
                      to="/learn/$slug"
                      params={{ slug: p.id }}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/70 group-hover:text-gold"
                    >
                      {t("Read")}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

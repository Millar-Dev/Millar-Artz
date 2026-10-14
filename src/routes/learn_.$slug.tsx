import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { Prose } from "@/components/site/Prose";
import { disciplines } from "@/lib/gallery-data";
import { fromLearnRow, listLearnPosts } from "@/lib/data/learn";
import { articleGraph, canonical, jsonLd, learnPath, seoMeta } from "@/lib/seo";
import { shareImage, sized, srcSetFor } from "@/lib/images";
import { youtubeEmbedUrl, youtubeId } from "@/lib/youtube";
import { translator, useT, langOf } from "@/lib/i18n";

/**
 * One lesson. `learn_.$slug` — the trailing underscore keeps it out of the
 * index route's layout while still living at /learn/<slug>.
 */
export const Route = createFileRoute("/learn_/$slug")({
  loader: async ({ params }) => {
    const all = (await listLearnPosts()).map(fromLearnRow);
    const index = all.findIndex((p) => p.id === params.slug);
    if (index === -1) throw notFound();
    return {
      post: all[index],
      previous: all[index - 1] ?? null,
      next: all[index + 1] ?? null,
    };
  },
  head: ({ matches, loaderData }) => {
    if (!loaderData) return {};
    const lang = langOf(matches);
    const t = translator(lang);
    const p = loaderData.post;
    const description =
      p.excerpt || t("A lesson from the MillerArtz studio in Arusha, Tanzania.");
    return {
      meta: seoMeta(
        `${p.title} | MillerArtz`.slice(0, 70),
        description.slice(0, 158),
        learnPath(p.id),
        p.cover ? { url: shareImage(p.cover), alt: p.title } : undefined,
        lang,
      ),
      links: [canonical(learnPath(p.id), lang)],
      scripts: [jsonLd(articleGraph(p))],
    };
  },
  component: LearnPost,
});

function LearnPost() {
  const t = useT();
  const { post: p, previous, next } = Route.useLoaderData();
  const video = youtubeId(p.youtubeUrl);
  const discipline = disciplines.find((d) => d.id === p.discipline);

  return (
    <Layout dept={discipline ? { accent: discipline.accent, hue: discipline.hue } : undefined}>
      <article className="mx-auto max-w-3xl px-6 pb-16 pt-10 md:pb-24 md:pt-14">
        <nav
          aria-label="Breadcrumb"
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50"
        >
          <Link to="/learn" className="hover:text-ink">
            {t("Learn")}
          </Link>
          {discipline && (
            <>
              <span className="mx-2 text-ink/30">/</span>
              <Link
                to="/learn"
                search={{ discipline: discipline.id }}
                className="hover:text-ink"
              >
                {t(discipline.label)}
              </Link>
            </>
          )}
        </nav>

        <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
          {p.title}
        </h1>
        <p className="mt-3 text-sm text-ink/55">
          {t("by Miller S.K., Arusha, Tanzania")}
          {p.publishedAt && ` · ${new Date(p.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
        </p>
        {p.excerpt && (
          <p className="mt-6 text-lg font-light leading-relaxed text-ink/75">{p.excerpt}</p>
        )}

        {p.cover && (
          <img
            src={sized(p.cover, 960)}
            srcSet={srcSetFor(p.cover, [480, 720, 960, 1280])}
            sizes="(min-width: 768px) 70vw, 100vw"
            alt=""
            className="mt-8 w-full rounded-sm bg-paper object-cover ring-1 ring-ink/10"
          />
        )}

        {video && (
          <div className="mt-8 aspect-video w-full overflow-hidden rounded-sm bg-ink/5 ring-1 ring-ink/10">
            <iframe
              src={youtubeEmbedUrl(video)}
              title={p.title}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        )}

        <Prose body={p.body} className="mt-10" />

        <div className="mt-14 border-t border-ink/10 pt-8">
          <h2 className="font-display text-2xl font-bold text-ink">
            {t("Thinking about a commission?")}
          </h2>
          <p className="mt-2 text-sm font-light text-ink/65">
            {t("Bring what you have — a photo, a wall, an idea — and you'll get an honest answer on whether it can be done and what it costs.")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contact"
              search={{ type: "commission" }}
              className="rounded-sm bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
            >
              {t("Start a commission")}
            </Link>
            <Link
              to="/gallery"
              className="rounded-sm border border-ink/15 px-5 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-ink/70 hover:text-ink"
            >
              {t("See the work")}
            </Link>
          </div>
        </div>

        {(previous || next) && (
          <div className="mt-12 flex items-center justify-between gap-4 border-t border-ink/10 pt-6">
            {previous ? (
              <Link
                to="/learn/$slug"
                params={{ slug: previous.id }}
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
                to="/learn/$slug"
                params={{ slug: next.id }}
                className="group inline-flex min-w-0 items-center gap-2 text-right text-sm text-ink/70 hover:text-ink"
              >
                <span className="truncate">{next.title}</span>
                <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}
      </article>
    </Layout>
  );
}

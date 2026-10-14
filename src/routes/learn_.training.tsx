import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { disciplines } from "@/lib/gallery-data";
import { filledTraining } from "@/lib/training-record";
import { canonical, jsonLd, seoMeta, SITE_URL } from "@/lib/seo";
import { translator, useT, langOf } from "@/lib/i18n";

/**
 * Training & coaching — the dance and acrobatics departments teach as well as
 * perform. Details (schedule, level, price) live in src/lib/training-record.ts
 * and the page shows only the ones actually filled in, so nobody turns up to a
 * class that doesn't exist yet.
 */
export const Route = createFileRoute("/learn_/training")({
  head: ({ matches }) => {
    const lang = langOf(matches);
    const t = translator(lang);
    return {
      meta: seoMeta(
        t("Training & Coaching — Dance and Acrobatics | MillerArtz"),
        t("Dance and acrobatics training with MillerArtz in Arusha, Tanzania — classes and one-to-one coaching for beginners and performers."),
        "/learn/training",
        undefined,
        lang,
      ),
      links: [canonical("/learn/training", lang)],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${SITE_URL}/learn/training#training`,
          name: "Dance and acrobatics training — MillerArtz",
          serviceType: "Performing arts training",
          url: `${SITE_URL}/learn/training`,
          provider: { "@id": `${SITE_URL}/#studio` },
          areaServed: { "@type": "Place", name: "Arusha, Tanzania" },
        }),
      ],
    };
  },
  component: Training,
});

function Training() {
  const t = useT();
  const taught = disciplines.filter((d) => d.id === "dance" || d.id === "acrobatics");

  return (
    <Layout>
      <section className="grain relative pt-16 pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            to="/learn"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/50 hover:text-ink"
          >
            {t("Learn")}
          </Link>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-ink md:text-6xl">
            {t("Training & coaching")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-ink/70">
            {t("Dance and acrobatics are taught as well as performed — floor work, balance, partner work and routines, for people who want to learn properly and safely.")}
          </p>
        </div>
      </section>

      <section className="bg-gallery py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-6">
          {filledTraining.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filledTraining.map((o) => {
                const d = disciplines.find((x) => x.id === (o.discipline === "dance" ? "dance" : "acrobatics"));
                return (
                  <div key={o.discipline + o.name} className="border border-ink/10 bg-paper/60 p-6">
                    {d && (
                      <p
                        className="text-[10px] font-bold uppercase tracking-[0.25em]"
                        style={{ color: d.accent }}
                      >
                        {t(d.label)}
                      </p>
                    )}
                    <h2 className="mt-3 font-display text-2xl font-bold text-ink">{o.name}</h2>
                    <dl className="mt-5 space-y-2 text-sm">
                      {[
                        [t("Who it's for"), o.level],
                        [t("When"), o.schedule],
                        [t("Where"), o.location],
                        [t("Cost"), o.price],
                      ]
                        .filter(([, v]) => v)
                        .map(([label, value]) => (
                          <div key={label} className="flex flex-wrap justify-between gap-x-4 border-t border-ink/10 pt-2">
                            <dt className="text-[10px] uppercase tracking-widest text-ink/50">{label}</dt>
                            <dd className="text-right text-ink/80">{value}</dd>
                          </div>
                        ))}
                    </dl>
                    {o.notes && <p className="mt-4 text-sm font-light text-ink/65">{o.notes}</p>}
                    <Link
                      to="/contact"
                      search={{ type: d?.label ?? "commission" }}
                      className="mt-6 inline-block rounded-sm bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
                    >
                      {t("Ask about joining")}
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Nothing is published until the artist fills in real schedules
               and prices — an empty timetable is worse than none. */
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-2xl font-bold text-ink/75">
                {t("Classes are arranged directly for now.")}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                {t("Tell the studio what you'd like to learn, your level and when you're free, and you'll get the days, the place and the cost by reply.")}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {taught.map((d) => (
                  <Link
                    key={d.id}
                    to="/contact"
                    search={{ type: d.label }}
                    className="rounded-sm px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:opacity-90"
                    style={{ backgroundColor: d.accent }}
                  >
                    {t("Ask about {name} training", { name: t(d.label).toLowerCase() })}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

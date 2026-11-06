import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";
import { deptCollection, listMediaItems } from "@/lib/data/content";
import { translator, langOf } from "@/lib/i18n";

const discipline = disciplines.find((d) => d.id === "dance")!;

export const Route = createFileRoute("/dance")({
  // Whatever the artist has added for this department in the Studio.
  loader: async () => ({
    media: (await listMediaItems()).filter((m) => m.collection === deptCollection(discipline.id)),
  }),
  head: ({ matches }) => {
    const lang = langOf(matches);
    const t = translator(lang);
    return {
      meta: seoMeta(t("Dance — MillerArtz, Arusha, Tanzania"), t("Choreography and live performance from MillerArtz in Arusha, Tanzania — traditional and contemporary East African dance for stage, film and events."), "/dance", undefined, lang),
      links: [canonical("/dance", lang)],
      scripts: [jsonLd(departmentGraph(discipline))],
    };
  },
  component: DepartmentRoute,
});

function DepartmentRoute() {
  const { media } = Route.useLoaderData();
  return <DepartmentPage discipline={discipline} media={media} />;
}

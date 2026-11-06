import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";
import { deptCollection, listMediaItems } from "@/lib/data/content";
import { translator, langOf } from "@/lib/i18n";

const discipline = disciplines.find((d) => d.id === "acrobatics")!;

export const Route = createFileRoute("/acrobatics")({
  // Whatever the artist has added for this department in the Studio.
  loader: async () => ({
    media: (await listMediaItems()).filter((m) => m.collection === deptCollection(discipline.id)),
  }),
  head: ({ matches }) => {
    const lang = langOf(matches);
    const t = translator(lang);
    return {
      meta: seoMeta(t("Acrobatics — MillerArtz, Arusha, Tanzania"), t("Acrobatic performance from MillerArtz in Arusha, Tanzania — floor, balance and aerial acts for stage and events, plus coaching."), "/acrobatics", undefined, lang),
      links: [canonical("/acrobatics", lang)],
      scripts: [jsonLd(departmentGraph(discipline))],
    };
  },
  component: DepartmentRoute,
});

function DepartmentRoute() {
  const { media } = Route.useLoaderData();
  return <DepartmentPage discipline={discipline} media={media} />;
}

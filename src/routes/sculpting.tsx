import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";
import { deptCollection, listMediaItems } from "@/lib/data/content";
import { translator, langOf } from "@/lib/i18n";

const discipline = disciplines.find((d) => d.id === "sculpture")!;

export const Route = createFileRoute("/sculpting")({
  // Whatever the artist has added for this department in the Studio.
  loader: async () => ({
    media: (await listMediaItems()).filter((m) => m.collection === deptCollection(discipline.id)),
  }),
  head: ({ matches }) => {
    const lang = langOf(matches);
    const t = translator(lang);
    return {
      meta: seoMeta(t("Sculpting — MillerArtz, Arusha, Tanzania"), t("Carved, cast and constructed sculpture from MillerArtz in Arusha, Tanzania — commissions in wood, stone, metal and mixed material."), "/sculpting", undefined, lang),
      links: [canonical("/sculpting", lang)],
      scripts: [jsonLd(departmentGraph(discipline))],
    };
  },
  component: DepartmentRoute,
});

function DepartmentRoute() {
  const { media } = Route.useLoaderData();
  return <DepartmentPage discipline={discipline} media={media} />;
}

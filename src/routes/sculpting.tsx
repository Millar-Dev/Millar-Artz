import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";
import { translator } from "@/lib/i18n";

const discipline = disciplines.find((d) => d.id === "sculpture")!;

export const Route = createFileRoute("/sculpting")({
  head: ({ match }) => {
    const { lang } = match.context;
    const t = translator(lang);
    return {
      meta: seoMeta(t("Sculpting — MillerArtz, Arusha, Tanzania"), t("Carved, cast and constructed sculpture from MillerArtz in Arusha, Tanzania — commissions in wood, stone, metal and mixed material."), "/sculpting", undefined, lang),
      links: [canonical("/sculpting", lang)],
      scripts: [jsonLd(departmentGraph(discipline))],
    };
  },
  component: () => <DepartmentPage discipline={discipline} />,
});

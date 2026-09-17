import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";
import { translator } from "@/lib/i18n";

const discipline = disciplines.find((d) => d.id === "music")!;

export const Route = createFileRoute("/music")({
  head: ({ match }) => {
    const { lang } = match.context;
    const t = translator(lang);
    return {
      meta: seoMeta(t("Music — MillerArtz, Arusha, Tanzania"), t("Original composition, scoring, recording and sound design from MillerArtz in Arusha, Tanzania — written for the film, campaign or room it is made for."), "/music", undefined, lang),
      links: [canonical("/music", lang)],
      scripts: [jsonLd(departmentGraph(discipline))],
    };
  },
  component: () => <DepartmentPage discipline={discipline} />,
});

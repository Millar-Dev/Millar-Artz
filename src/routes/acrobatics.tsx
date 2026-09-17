import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";
import { translator } from "@/lib/i18n";

const discipline = disciplines.find((d) => d.id === "acrobatics")!;

export const Route = createFileRoute("/acrobatics")({
  head: ({ match }) => {
    const { lang } = match.context;
    const t = translator(lang);
    return {
      meta: seoMeta(t("Acrobatics — MillerArtz, Arusha, Tanzania"), t("Acrobatic performance from MillerArtz in Arusha, Tanzania — floor, balance and aerial acts for stage and events, plus coaching."), "/acrobatics", undefined, lang),
      links: [canonical("/acrobatics", lang)],
      scripts: [jsonLd(departmentGraph(discipline))],
    };
  },
  component: () => <DepartmentPage discipline={discipline} />,
});

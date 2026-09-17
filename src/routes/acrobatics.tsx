import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "acrobatics")!;

export const Route = createFileRoute("/acrobatics")({
  head: () => ({
    meta: seoMeta(
      "Acrobatics — MillerArtz, Tanzania",
      "Acrobatic performance from MillerArtz in Tanzania — floor, balance and aerial acts for stage and events, plus coaching.",
      "/acrobatics",
    ),
    links: [canonical("/acrobatics")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

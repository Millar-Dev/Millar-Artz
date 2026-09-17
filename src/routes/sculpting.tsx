import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "sculpture")!;

export const Route = createFileRoute("/sculpting")({
  head: () => ({
    meta: seoMeta(
      "Sculpting — MillerArtz, Tanzania",
      "Carved, cast and constructed sculpture from MillerArtz in Tanzania — commissions in wood, stone, metal and mixed material.",
      "/sculpting",
    ),
    links: [canonical("/sculpting")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

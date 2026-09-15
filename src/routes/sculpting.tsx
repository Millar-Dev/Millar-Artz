import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "sculpture")!;

export const Route = createFileRoute("/sculpting")({
  head: () => ({
    meta: [
      { title: "Sculpting — MillerArtz" },
      { name: "description", content: "Carved, cast and constructed sculpture from MillerArtz — commissions in wood, stone, metal and mixed material, at desk scale or site scale." },
      { property: "og:title", content: "Sculpting — MillerArtz" },
      { property: "og:description", content: "Carved, cast and constructed sculpture from MillerArtz — commissions in wood, stone, metal and mixed material, at desk scale or site scale." },
    ],
    links: [canonical("/sculpting")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

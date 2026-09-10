import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "sculpture")!;

export const Route = createFileRoute("/sculpting")({
  head: () => ({
    meta: [
      { title: "Sculpting — Artesque" },
      { name: "description", content: "Carved, cast and constructed sculpture from Artesque — commissions in wood, stone, metal and mixed material, at desk scale or site scale." },
      { property: "og:title", content: "Sculpting — Artesque" },
      { property: "og:description", content: "Carved, cast and constructed sculpture from Artesque — commissions in wood, stone, metal and mixed material, at desk scale or site scale." },
    ],
    links: [canonical("/sculpting")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

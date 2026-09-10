import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "acrobatics")!;

export const Route = createFileRoute("/acrobatics")({
  head: () => ({
    meta: [
      { title: "Acrobatics — Artesque" },
      { name: "description", content: "Trained physical performance from the Artesque acrobatics department — floor, balance and aerial work for stage and events, and coaching." },
      { property: "og:title", content: "Acrobatics — Artesque" },
      { property: "og:description", content: "Trained physical performance from the Artesque acrobatics department — floor, balance and aerial work for stage and events, and coaching." },
    ],
    links: [canonical("/acrobatics")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

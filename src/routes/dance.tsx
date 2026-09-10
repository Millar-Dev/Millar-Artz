import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "dance")!;

export const Route = createFileRoute("/dance")({
  head: () => ({
    meta: [
      { title: "Dance — Artesque" },
      { name: "description", content: "Choreography and staged movement from the Artesque dance department — for stage, film, events and campaigns, plus workshops and training." },
      { property: "og:title", content: "Dance — Artesque" },
      { property: "og:description", content: "Choreography and staged movement from the Artesque dance department — for stage, film, events and campaigns, plus workshops and training." },
    ],
    links: [canonical("/dance")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

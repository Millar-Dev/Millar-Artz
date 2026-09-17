import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "dance")!;

export const Route = createFileRoute("/dance")({
  head: () => ({
    meta: seoMeta(
      "Dance — MillerArtz, Arusha, Tanzania",
      "Choreography and live performance from MillerArtz in Arusha, Tanzania — traditional and contemporary East African dance for stage, film and events.",
      "/dance",
    ),
    links: [canonical("/dance")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

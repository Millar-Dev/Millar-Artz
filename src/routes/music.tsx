import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd, seoMeta } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "music")!;

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: seoMeta(
      "Music — MillerArtz, Arusha, Tanzania",
      "Original composition, scoring, recording and sound design from MillerArtz in Arusha, Tanzania — written for the film, campaign or room it is made for.",
      "/music",
    ),
    links: [canonical("/music")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

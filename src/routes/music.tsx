import { createFileRoute } from "@tanstack/react-router";
import { DepartmentPage } from "@/components/site/DepartmentPage";
import { disciplines } from "@/lib/gallery-data";
import { canonical, departmentGraph, jsonLd } from "@/lib/seo";

const discipline = disciplines.find((d) => d.id === "music")!;

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: [
      { title: "Music — Artesque" },
      { name: "description", content: "Original composition, scoring, recording and sound design from the Artesque music department — written for the room, the film or the campaign it is made for." },
      { property: "og:title", content: "Music — Artesque" },
      { property: "og:description", content: "Original composition, scoring, recording and sound design from the Artesque music department — written for the room, the film or the campaign it is made for." },
    ],
    links: [canonical("/music")],
    scripts: [jsonLd(departmentGraph(discipline))],
  }),
  component: () => <DepartmentPage discipline={discipline} />,
});

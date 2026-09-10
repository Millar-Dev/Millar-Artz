import { Paintbrush, Mic, Footprints, Hammer } from "lucide-react";
import { Rings, type DisciplineIcon } from "./BrandLogo";
import type { DisciplineId } from "@/lib/gallery-data";

/**
 * The object standing in each department's doorway. Defined once so the home
 * directory, the department pages and the gallery can never drift apart.
 *
 * Four are everyday objects from Lucide; acrobatics gets plain
 * interlocking-circle geometry, since no icon set draws a pair of hanging
 * rings that reads at this size.
 */
export const disciplineIcons: Record<DisciplineId, DisciplineIcon> = {
  painting: Paintbrush,
  music: Mic,
  dance: Footprints,
  sculpture: Hammer,
  acrobatics: Rings,
};

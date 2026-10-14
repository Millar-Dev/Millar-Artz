/**
 * Training and coaching in dance and acrobatics.
 *
 * Every field starts empty and the page shows only what is filled in, so no
 * placeholder schedule or invented price can reach a visitor. Fill these in
 * with what the studio actually offers today — not what it hopes to offer.
 */

export interface TrainingOffer {
  /** Which department this belongs to: "dance" or "acrobatics". */
  discipline: "dance" | "acrobatics";
  /** e.g. "Group class" or "One-to-one coaching" */
  name: string;
  /** Who it's for, e.g. "Beginners, 12 and over" */
  level: string;
  /** e.g. "Tuesdays & Thursdays, 17:00–18:30" */
  schedule: string;
  /** Where it happens, e.g. "MillerArtz studio, Arusha" */
  location: string;
  /** What it costs, in the artist's own words, e.g. "TSh 30,000 a month" */
  price: string;
  /** Anything else worth knowing: what to bring, how to book. */
  notes?: string;
}

// TODO(miller): dance and acrobatics training. Add one entry per class or
// coaching option. Delete any you don't offer.
export const training: TrainingOffer[] = [
  // TODO(miller) dance
  { discipline: "dance", name: "", level: "", schedule: "", location: "", price: "", notes: "" },
  // TODO(miller) acrobatics
  { discipline: "acrobatics", name: "", level: "", schedule: "", location: "", price: "", notes: "" },
];

/** Only the entries that have actually been filled in. */
export const filledTraining = training.filter((o) => o.name.trim());

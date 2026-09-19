/**
 * The studio's record for the About page: exhibitions, press, collectors and
 * what clients have said.
 *
 * Every list starts empty, and the About page only shows a list once it has
 * real entries — so nothing half-finished or invented ever reaches visitors.
 * Only publish what actually happened, in the words people actually used,
 * with their permission for testimonials.
 *
 * To fill a slot, replace its empty strings; empty slots are skipped.
 */

export interface Exhibition {
  /** e.g. "Group show: New Voices" */
  title: string;
  /** Gallery or venue, e.g. "Alliance Française, Arusha" */
  venue: string;
  /** "2025" or "March 2026" */
  date: string;
  /** Optional link to a page about it. */
  url?: string;
}

export interface PressItem {
  /** Headline or title of the feature. */
  title: string;
  /** Newspaper, magazine, blog, radio or TV programme. */
  outlet: string;
  date: string;
  url?: string;
}

export interface Collector {
  /** A person, family, company or organisation — only with their permission. */
  name: string;
  /** City and country, e.g. "Nairobi, Kenya". */
  place?: string;
}

export interface Testimonial {
  /** Their exact words. */
  quote: string;
  /** How they'd like to be credited, e.g. "Amina K." */
  name: string;
  place?: string;
  /** Slug of the piece it was about, e.g. "golden-mane", if any. */
  artworkId?: string;
}

// TODO(miller): exhibitions — one entry per show, newest first.
export const exhibitions: Exhibition[] = [
  // TODO(miller): { title: "", venue: "", date: "" },
];

// TODO(miller): press — interviews, articles, radio or TV features.
export const press: PressItem[] = [
  // TODO(miller): { title: "", outlet: "", date: "", url: "" },
];

// TODO(miller): collectors who have agreed to be named.
export const collectors: Collector[] = [
  // TODO(miller): { name: "", place: "" },
];

// TODO(miller): at least three testimonials from real clients, in their own
// words and with their permission. Never write these on a client's behalf.
export const testimonials: Testimonial[] = [
  // TODO(miller) testimonial 1
  { quote: "", name: "", place: "", artworkId: "" },
  // TODO(miller) testimonial 2
  { quote: "", name: "", place: "", artworkId: "" },
  // TODO(miller) testimonial 3
  { quote: "", name: "", place: "", artworkId: "" },
];

/** Only entries that have actually been filled in. */
export const filled = {
  exhibitions: exhibitions.filter((e) => e.title.trim() && e.venue.trim()),
  press: press.filter((p) => p.title.trim() && p.outlet.trim()),
  collectors: collectors.filter((c) => c.name.trim()),
  testimonials: testimonials.filter((q) => q.quote.trim() && q.name.trim()),
};

export type ArtworkStatus = "available" | "sold" | "commission" | "featured";

export type ArtworkCategory =
  | "hyperrealism"
  | "portraits"
  | "wildlife"
  | "traditional"
  | "abstract"
  | "illusional"
  | "mural"
  | "modern"
  | "cartoons";

export interface Artwork {
  id: string;
  title: string;
  category: ArtworkCategory;
  categoryLabel: string;
  medium: string;
  dimensions?: string;
  status: ArtworkStatus;
  image: string;
  description: string;
  year: number;
  sortOrder: number;
  /** Null when the piece is priced on request. */
  price: number | null;
  currency: string;
}

/** Shape returned by the artworks table — kept separate from Artwork so the
 * DB's snake_case columns don't leak into the rest of the app. */
export interface ArtworkDbRow {
  id: string;
  title: string;
  category: string;
  category_label: string;
  medium: string;
  dimensions: string | null;
  status: string;
  description: string;
  year: number;
  image_path: string;
  sort_order: number;
  price: number | null;
  currency: string | null;
}

export function fromArtworkRow(row: ArtworkDbRow): Artwork {
  return {
    id: row.id,
    title: row.title,
    category: row.category as ArtworkCategory,
    categoryLabel: row.category_label,
    medium: row.medium,
    dimensions: row.dimensions ?? undefined,
    status: row.status as ArtworkStatus,
    image: row.image_path,
    description: row.description,
    year: row.year,
    sortOrder: row.sort_order,
    price: row.price ?? null,
    currency: row.currency ?? "USD",
  };
}

/** "$450" / "TZS 1,200,000" — or null when the piece is priced on request. */
export function formatPrice(artwork: Pick<Artwork, "price" | "currency">): string | null {
  if (artwork.price == null) return null;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: artwork.currency || "USD",
      maximumFractionDigits: 0,
    }).format(artwork.price);
  } catch {
    // Unknown currency code — fall back to a plain formatted number.
    return `${artwork.currency || ""} ${artwork.price.toLocaleString()}`.trim();
  }
}

export const categories: {
  value: ArtworkCategory | "all";
  label: string;
  blurb: string;
}[] = [
  { value: "all", label: "All Works", blurb: "The full collection, every discipline." },
  {
    value: "hyperrealism",
    label: "Hyperrealism",
    blurb: "Graphite and charcoal studies rendered to the edge of photographic detail.",
  },
  {
    value: "portraits",
    label: "Portraits",
    blurb: "Faces, memory and likeness — commissioned and personal.",
  },
  {
    value: "wildlife",
    label: "Wildlife",
    blurb: "East African wildlife in acrylic and oil, observed closely.",
  },
  {
    value: "traditional",
    label: "Traditional",
    blurb: "Cultural scenes and community commissions rooted in heritage.",
  },
  {
    value: "abstract",
    label: "Abstract",
    blurb: "Colour, gesture and emotion released from the literal.",
  },
  {
    value: "illusional",
    label: "Illusional",
    blurb: "Perception bent — familiar forms made strange.",
  },
  {
    value: "mural",
    label: "Mural",
    blurb: "Large-scale work taken off the canvas and onto real walls.",
  },
  {
    value: "modern",
    label: "Modern",
    blurb: "Contemporary shape, silhouette and stylisation.",
  },
  {
    value: "cartoons",
    label: "Cartoons",
    blurb: "Character illustration in bold outline and flat colour.",
  },
];

/** Disciplines the studio is building toward beyond the canvas — no artwork yet, open for commission conversations. */
/** One of the five departments. Each keeps the arch and takes its own accent
 *  colour and its own object in the doorway — never just a colour swap. */
export interface Discipline {
  id: DisciplineId;
  label: string;
  blurb: string;
  /** The department accent, straight from the brand's colour system. */
  accent: string;
}

export type DisciplineId =
  | "painting"
  | "music"
  | "dance"
  | "sculpture"
  | "acrobatics";

export const disciplines: Discipline[] = [
  {
    id: "painting",
    label: "Painting",
    blurb:
      "Brush and pigment — portraiture, wildlife and hyperrealist work, made by hand and made to last.",
    accent: "#c9913a",
  },
  {
    id: "music",
    label: "Music",
    blurb:
      "Composition, recording and sound work, written for the room it will be heard in.",
    accent: "#6b2140",
  },
  {
    id: "dance",
    label: "Dance",
    blurb:
      "Choreography and live performance — movement staged for events, film and commissions.",
    accent: "#2f6259",
  },
  {
    id: "sculpture",
    label: "Sculpture",
    blurb:
      "Three-dimensional form, carved, cast or built — work you can walk around.",
    accent: "#a85c32",
  },
  {
    id: "acrobatics",
    label: "Acrobatics",
    blurb:
      "Trained physical performance: strength, balance and aerial work, taught and staged.",
    accent: "#3a4a66",
  },
];

export const commissionSteps = [
  {
    step: "01",
    title: "Consult",
    body: "Share your reference photos or idea, preferred category and size. A quotation and timeline follow within days.",
  },
  {
    step: "02",
    title: "Create",
    body: "The piece is built by hand in the studio, with progress shared along the way for portraits and larger commissions.",
  },
  {
    step: "03",
    title: "Deliver",
    body: "Your finished piece is prepared for collection or delivery — framed, mounted, or ready for installation on site for murals.",
  },
];

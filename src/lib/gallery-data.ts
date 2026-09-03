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
  };
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
export interface Discipline {
  id: string;
  label: string;
  blurb: string;
  icon: "music" | "dance" | "digital" | "sculpture";
}

export const disciplines: Discipline[] = [
  {
    id: "music",
    label: "Music",
    blurb: "Composition and sound work — a new discipline Miller Artz is opening up for collaboration.",
    icon: "music",
  },
  {
    id: "dance-performance",
    label: "Dance & Performance",
    blurb: "Choreographed and live performance pieces, staged for events and commissions.",
    icon: "dance",
  },
  {
    id: "digital-art",
    label: "Digital Art",
    blurb: "Illustration and concept work built natively for screens, prints and digital collectors.",
    icon: "digital",
  },
  {
    id: "sculpture",
    label: "Sculpture & 3D",
    blurb: "Three-dimensional form — carved, cast or built by hand.",
    icon: "sculpture",
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

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
 *  colour and its own object in the doorway — never just a colour swap.
 *
 *  This is the spine of the site: the home page is a directory onto these
 *  five, and each has a page of its own. */
export interface Discipline {
  id: DisciplineId;
  label: string;
  /** Route path. Literal union rather than `string` so the router can still
   *  type-check every <Link to={d.slug}>. Kept as the artist named them,
   *  plurals and all. */
  slug: "/paintings" | "/music" | "/dance" | "/sculpting" | "/acrobatics";
  /** One line under the department name. */
  tagline: string;
  /** Card copy on the home directory. */
  blurb: string;
  /** Opening paragraph on the department's own page. */
  intro: string;
  /** What the department actually takes on. */
  offerings: string[];
  /** "live" has work to show; "open" is taking commissions but has no
   *  archive on the site yet. */
  status: "live" | "open";
  /** The department accent, straight from the brand's colour system. Used for
   *  the mark's keystone, buttons and rules. */
  accent: string;
  /** The accent's OKLCH hue angle.
   *
   *  The page ground is built from this rather than by tinting cream with the
   *  accent: mixing a dark, half-saturated colour into warm ivory cancels its
   *  chroma — dance came out grey-green and acrobatics came out plain grey.
   *  Holding the hue and moving only lightness keeps every department
   *  recognisable, and lets the theme toggle take the light out of a colour
   *  instead of replacing it. */
  hue: number;
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
    label: "Paintings",
    slug: "/paintings",
    tagline: "Brush, graphite and pigment",
    blurb:
      "Hyperrealism, wildlife, portraiture, murals and more — the department with an archive you can browse today.",
    intro:
      "Painting is where Artesque began, and it is still the department with the deepest archive. Hyperrealistic graphite and charcoal built over hundreds of hours of observation, wildlife in acrylic and oil rooted in East Africa, commissioned portraits, traditional and cultural scenes, murals at architectural scale, and work that refuses to sit in any of those boxes.",
    offerings: [
      "Hyperrealism & graphite",
      "Portrait commissions",
      "Wildlife in oil & acrylic",
      "Traditional & cultural work",
      "Murals & large format",
      "Abstract, modern & illusional",
    ],
    status: "live",
    accent: "#c9913a",
    hue: 74.9,
  },
  {
    id: "music",
    label: "Music",
    slug: "/music",
    tagline: "Composition, recording and sound",
    blurb:
      "Original composition, recording and sound design — written for the room it will be heard in.",
    intro:
      "Music at Artesque is written for a purpose and a place: a score for a film, a track for a campaign, a piece for a room and the people who will be standing in it. Composition, arrangement, recording and mixing, with session players brought in where the work asks for them.",
    offerings: [
      "Original composition",
      "Scoring for film & video",
      "Recording & production",
      "Arrangement for live performance",
      "Sound design",
      "Session collaboration",
    ],
    status: "open",
    accent: "#6b2140",
    hue: 358.0,
  },
  {
    id: "dance",
    label: "Dance",
    slug: "/dance",
    tagline: "Choreography and live performance",
    blurb:
      "Choreography and staged movement for events, film and campaigns — plus training for those who want to learn it.",
    intro:
      "Movement staged for an audience. Choreography built around traditional and contemporary East African forms, rehearsed with the performers who will dance it, and shaped for the space it will be performed in — a stage, a street, a camera.",
    offerings: [
      "Choreography for stage",
      "Movement for film & campaigns",
      "Event and ceremony performance",
      "Traditional & contemporary forms",
      "Workshops & training",
      "Company collaboration",
    ],
    status: "open",
    accent: "#2f6259",
    hue: 180.7,
  },
  {
    id: "sculpture",
    label: "Sculpting",
    slug: "/sculpting",
    tagline: "Form you can walk around",
    blurb:
      "Carved, cast and constructed work — commissions in wood, stone, metal and mixed material.",
    intro:
      "Three-dimensional work made by hand: carved from wood and stone, cast in metal and resin, or constructed from material chosen for the piece. Sculpture is commissioned the way architecture is — a conversation about site, scale and material before anything is cut.",
    offerings: [
      "Carving in wood & stone",
      "Casting in metal & resin",
      "Constructed & mixed material",
      "Portrait & figure work",
      "Public and site-specific pieces",
      "Restoration & finishing",
    ],
    status: "open",
    accent: "#a85c32",
    hue: 47.9,
  },
  {
    id: "acrobatics",
    label: "Acrobatics",
    slug: "/acrobatics",
    tagline: "Strength, balance and aerial work",
    blurb:
      "Trained physical performance for stage and event — and coaching for the people who want to do it.",
    intro:
      "Trained physical performance: floor acrobatics, balance and partner work, aerial apparatus and rings. Booked as an act for an event or a stage, built as a routine around a brief, and taught to people who want to learn it properly and safely.",
    offerings: [
      "Stage & event performance",
      "Aerial and apparatus work",
      "Partner & group balance",
      "Routine built to a brief",
      "Coaching & conditioning",
      "Troupe collaboration",
    ],
    status: "open",
    accent: "#3a4a66",
    hue: 261.3,
  },
];

/** Lookup for the department routes. */
export const disciplineBySlug = (slug: string) =>
  disciplines.find((d) => d.slug === slug);

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

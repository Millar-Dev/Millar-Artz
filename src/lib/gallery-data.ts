import artPortrait from "@/assets/art-portrait.jpg";
import artJungle from "@/assets/art-jungle.jpg";
import artBallerina from "@/assets/art-ballerina.jpg";
import artElephant from "@/assets/art-elephant.jpg";
import artWoman from "@/assets/art-woman.jpg";
import artLeopard from "@/assets/art-leopard.jpg";
import heroLion from "@/assets/hero-lion.jpg";

export type ArtworkStatus = "available" | "sold" | "commission" | "featured";

export type ArtworkCategory =
  | "hyper-realism"
  | "wildlife"
  | "portraits"
  | "pencil"
  | "acrylic"
  | "custom"
  | "featured";

export interface Artwork {
  id: string;
  title: string;
  category: ArtworkCategory;
  categoryLabel: string;
  medium: string;
  dimensions: string;
  status: ArtworkStatus;
  image: string;
  description: string;
  year: number;
}

export const categories: { value: ArtworkCategory | "all"; label: string }[] = [
  { value: "all", label: "All Works" },
  { value: "hyper-realism", label: "Hyper Realism" },
  { value: "wildlife", label: "Wildlife Art" },
  { value: "portraits", label: "Portrait Drawings" },
  { value: "pencil", label: "Pencil Drawings" },
  { value: "acrylic", label: "Acrylic Paintings" },
  { value: "featured", label: "Featured" },
  { value: "custom", label: "Custom Orders" },
];

export const artworks: Artwork[] = [
  {
    id: "the-monarch",
    title: "The Monarch",
    category: "wildlife",
    categoryLabel: "Wildlife Art",
    medium: "Oil on Canvas",
    dimensions: '36" x 48"',
    status: "featured",
    image: heroLion,
    description:
      "A hyper-realistic study of an African lion in golden hour light — a meditation on stillness, power, and presence.",
    year: 2024,
  },
  {
    id: "weavers-gaze",
    title: "The Weaver's Gaze",
    category: "portraits",
    categoryLabel: "Portrait Drawings",
    medium: "Pencil on Archival Paper",
    dimensions: '24" x 36"',
    status: "available",
    image: artPortrait,
    description:
      "Every wrinkle carries a story. Rendered entirely in graphite over seventy hours of quiet observation.",
    year: 2024,
  },
  {
    id: "amazonian-echo",
    title: "Amazonian Echo",
    category: "acrylic",
    categoryLabel: "Acrylic Paintings",
    medium: "Acrylic on Canvas",
    dimensions: '40" x 50"',
    status: "sold",
    image: artJungle,
    description: "A vivid celebration of the rainforest — layered acrylics evoking the tropical canopy at dawn.",
    year: 2024,
  },
  {
    id: "stasis-in-motion",
    title: "Stasis in Motion",
    category: "pencil",
    categoryLabel: "Pencil Drawings",
    medium: "Charcoal & Graphite",
    dimensions: '18" x 24"',
    status: "available",
    image: artBallerina,
    description: "A single held breath — the dancer paused between two movements, drawn from life.",
    year: 2023,
  },
  {
    id: "the-elder",
    title: "The Elder",
    category: "hyper-realism",
    categoryLabel: "Hyper Realism",
    medium: "Pencil on Paper",
    dimensions: '20" x 28"',
    status: "available",
    image: artElephant,
    description: "A closely observed portrait of an old bull elephant — texture, weight, and quiet dignity.",
    year: 2024,
  },
  {
    id: "morning-light",
    title: "Morning Light",
    category: "portraits",
    categoryLabel: "Portrait Drawings",
    medium: "Graphite on Cream Paper",
    dimensions: '16" x 20"',
    status: "commission",
    image: artWoman,
    description: "Commissioned portrait rendered from a single reference photograph.",
    year: 2024,
  },
  {
    id: "sentinel",
    title: "Sentinel",
    category: "acrylic",
    categoryLabel: "Acrylic Paintings",
    medium: "Acrylic on Canvas",
    dimensions: '30" x 40"',
    status: "available",
    image: artLeopard,
    description: "A leopard at rest in the amber savanna — a study in composure and camouflage.",
    year: 2024,
  },
];

export const testimonials = [
  {
    quote:
      "The portrait Miller Artz created of my late father captured him more vividly than any photograph. It hangs in our family home.",
    author: "Amina K.",
    location: "Dar es Salaam",
  },
  {
    quote:
      "Extraordinary craft. The level of detail in the wildlife piece I commissioned defied belief — it's the centerpiece of my collection.",
    author: "Jonathan W.",
    location: "London, UK",
  },
  {
    quote:
      "Miller Artz took the time to understand exactly what the painting needed to mean. The result was pure emotion on canvas.",
    author: "Grace M.",
    location: "Nairobi",
  },
];

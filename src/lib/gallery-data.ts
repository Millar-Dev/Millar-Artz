import hyperrealismTheElderStoryteller from "@/assets/gallery/hyperrealism-the-elder-storyteller.jpg";
import hyperrealismReflection from "@/assets/gallery/hyperrealism-reflection.jpg";
import hyperrealismRhinoStudy from "@/assets/gallery/hyperrealism-rhino-study.jpg";
import portraitWomanWithBraids from "@/assets/gallery/portrait-woman-with-braids.jpg";
import portraitOneLoveTribute from "@/assets/gallery/portrait-one-love-tribute.jpg";
import portraitYoungWomanFramed from "@/assets/gallery/portrait-young-woman-framed.jpg";
import wildlifeElephantStudy from "@/assets/gallery/wildlife-elephant-study.jpg";
import wildlifeElephantTrio from "@/assets/gallery/wildlife-elephant-trio.jpg";
import wildlifeBaldEagle from "@/assets/gallery/wildlife-bald-eagle.jpg";
import wildlifeGiraffeNocturne from "@/assets/gallery/wildlife-giraffe-nocturne.jpg";
import wildlifeBeeEatersPerched from "@/assets/gallery/wildlife-bee-eaters-perched.jpg";
import wildlifeBeeEaterInFlight from "@/assets/gallery/wildlife-bee-eater-in-flight.jpg";
import traditionalEmbuanMotherChild from "@/assets/gallery/traditional-embuan-mother-child.jpg";
import traditionalMaasaiWomen from "@/assets/gallery/traditional-maasai-women.jpg";
import traditionalWomanOfTheSavanna from "@/assets/gallery/traditional-woman-of-the-savanna.jpg";
import abstractUprising from "@/assets/gallery/abstract-uprising.jpg";
import illusionalTechnicolorZebra from "@/assets/gallery/illusional-technicolor-zebra.jpg";
import muralComicHeroWall from "@/assets/gallery/mural-comic-hero-wall.jpg";
import modernDancerPrism from "@/assets/gallery/modern-dancer-prism.jpg";
import modernDancerSilhouette from "@/assets/gallery/modern-dancer-silhouette.jpg";
import cartoonsPenguinSalute from "@/assets/gallery/cartoons-penguin-salute.jpg";

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

export const artworks: Artwork[] = [
  {
    id: "woman-of-the-savanna",
    title: "Woman of the Savanna",
    category: "traditional",
    categoryLabel: "Traditional",
    medium: "Acrylic on Canvas",
    status: "featured",
    image: traditionalWomanOfTheSavanna,
    description:
      "A profile portrait built from an acacia sunset — the sitter's silhouette and the tree line become one shape against a glowing horizon.",
    year: 2025,
  },
  {
    id: "the-storyteller",
    title: "The Storyteller",
    category: "hyperrealism",
    categoryLabel: "Hyperrealism",
    medium: "Charcoal & Graphite on Canvas",
    status: "available",
    image: hyperrealismTheElderStoryteller,
    description:
      "Every crease and fold of fabric rendered by hand — a study in patience, built stroke by stroke until the paper stopped looking like paper.",
    year: 2025,
  },
  {
    id: "reflection",
    title: "Reflection",
    category: "hyperrealism",
    categoryLabel: "Hyperrealism",
    medium: "Charcoal on Canvas",
    status: "available",
    image: hyperrealismReflection,
    description:
      "A closely cropped study of a hand at rest against a face — weight, texture and quiet held in graphite.",
    year: 2025,
  },
  {
    id: "rhino-study",
    title: "Rhino Study",
    category: "hyperrealism",
    categoryLabel: "Hyperrealism",
    medium: "Graphite on Paper",
    status: "available",
    image: hyperrealismRhinoStudy,
    description:
      "A sketchbook study of a white rhino, worked up from reference in soft graphite — the groundwork behind a larger painted piece.",
    year: 2026,
  },
  {
    id: "bloom",
    title: "Bloom",
    category: "portraits",
    categoryLabel: "Portraits",
    medium: "Charcoal on Paper",
    status: "available",
    image: portraitWomanWithBraids,
    description:
      "A portrait set against painted florals — braided hair and quiet expression balanced by soft, layered petals.",
    year: 2025,
  },
  {
    id: "one-love-tribute",
    title: "One Love — A Tribute",
    category: "portraits",
    categoryLabel: "Portraits",
    medium: "Charcoal on Canvas",
    status: "sold",
    image: portraitOneLoveTribute,
    description:
      "A tribute portrait in bold charcoal linework, dreadlocks rendered strand by strand — a study in likeness and legacy.",
    year: 2025,
  },
  {
    id: "caught-laughing",
    title: "Caught Laughing",
    category: "portraits",
    categoryLabel: "Portraits",
    medium: "Charcoal on Paper",
    status: "commission",
    image: portraitYoungWomanFramed,
    description:
      "A commissioned portrait built to capture one unguarded expression — mid-laugh, mid-thought.",
    year: 2026,
  },
  {
    id: "elephant-study-in-amber",
    title: "Elephant Study in Amber",
    category: "wildlife",
    categoryLabel: "Wildlife",
    medium: "Acrylic on Canvas",
    status: "available",
    image: wildlifeElephantStudy,
    description:
      "A close-cropped elephant portrait pushed into warm amber and charcoal blue — texture and scale over literal colour.",
    year: 2025,
  },
  {
    id: "the-herd",
    title: "The Herd",
    category: "wildlife",
    categoryLabel: "Wildlife",
    medium: "Acrylic on Canvas",
    status: "available",
    image: wildlifeElephantTrio,
    description:
      "Three elephants pressed close together, trunks entwined — a study of family and gentleness in a large animal.",
    year: 2025,
  },
  {
    id: "sentinel-eagle",
    title: "Sentinel",
    category: "wildlife",
    categoryLabel: "Wildlife",
    medium: "Acrylic on Canvas Board",
    status: "available",
    image: wildlifeBaldEagle,
    description: "A bald eagle at rest, feather by feather, set against soft foliage green.",
    year: 2024,
  },
  {
    id: "giraffe-nocturne",
    title: "Giraffe Nocturne",
    category: "wildlife",
    categoryLabel: "Wildlife",
    medium: "Acrylic on Canvas Board",
    status: "available",
    image: wildlifeGiraffeNocturne,
    description:
      "A giraffe emerges from near-black shadow, its coat picked out in warm ochre highlights — night on the savanna.",
    year: 2026,
  },
  {
    id: "kindred-bee-eaters",
    title: "Kindred",
    category: "wildlife",
    categoryLabel: "Wildlife",
    medium: "Oil on Canvas",
    status: "featured",
    image: wildlifeBeeEatersPerched,
    description:
      "A pair of European bee-eaters share a branch, their colour and closeness caught against a dissolving green bokeh.",
    year: 2026,
  },
  {
    id: "bee-eaters-in-flight",
    title: "Bee-eaters in the Light",
    category: "wildlife",
    categoryLabel: "Wildlife",
    medium: "Oil on Canvas",
    status: "available",
    image: wildlifeBeeEaterInFlight,
    description:
      "A second study of the same pair, wings caught mid-settle — light breaking through the canopy behind them.",
    year: 2026,
  },
  {
    id: "mother-and-child-embuan",
    title: "Mother and Child",
    category: "traditional",
    categoryLabel: "Traditional",
    medium: "Acrylic on Wood",
    status: "sold",
    image: traditionalEmbuanMotherChild,
    description:
      "A community commission for the Embuan Children & Youth Foundation — a mother and sleeping child painted in warm sunset tones on reclaimed wood.",
    year: 2024,
  },
  {
    id: "the-pestle",
    title: "The Pestle",
    category: "traditional",
    categoryLabel: "Traditional",
    medium: "Acrylic on Canvas Board",
    status: "available",
    image: traditionalMaasaiWomen,
    description:
      "Two women share the rhythm of grinding grain by hand — a quiet, everyday scene rendered in warm monochrome.",
    year: 2025,
  },
  {
    id: "uprising",
    title: "Uprising",
    category: "abstract",
    categoryLabel: "Abstract",
    medium: "Acrylic on Canvas",
    status: "available",
    image: abstractUprising,
    description:
      "A raised fist breaks from a field of dripped, splattered colour — protest and hope painted in the same gesture.",
    year: 2025,
  },
  {
    id: "technicolor-zebra",
    title: "Technicolor Zebra",
    category: "illusional",
    categoryLabel: "Illusional",
    medium: "Mixed Media on Canvas",
    status: "available",
    image: illusionalTechnicolorZebra,
    description:
      "A familiar animal rebuilt in impossible rainbow stripes — the eye keeps looking for the zebra it expects and finds something else.",
    year: 2026,
  },
  {
    id: "break-through",
    title: "Break Through",
    category: "mural",
    categoryLabel: "Mural",
    medium: "Acrylic Mural on Stucco",
    status: "available",
    image: muralComicHeroWall,
    description:
      "A larger-than-life cartoon character bursts through an exterior wall in bold outline and flat colour — commissioned scale work, taken off the canvas entirely.",
    year: 2025,
  },
  {
    id: "prism-dancer",
    title: "Prism Dancer",
    category: "modern",
    categoryLabel: "Modern",
    medium: "Acrylic on Wood Panel",
    status: "available",
    image: modernDancerPrism,
    description:
      "A dancer mid-turn, rendered in stained-glass colour blocks that shift from gold to rose to teal across the panel.",
    year: 2025,
  },
  {
    id: "twilight-dancer",
    title: "Twilight Dancer",
    category: "modern",
    categoryLabel: "Modern",
    medium: "Acrylic on Wood Panel",
    status: "available",
    image: modernDancerSilhouette,
    description:
      "A silhouetted figure spins beneath a wide sun hat, dress caught mid-swirl in warm dusk tones.",
    year: 2025,
  },
  {
    id: "cartoon-study-penguin",
    title: "Cartoon Study — Penguin Salute",
    category: "cartoons",
    categoryLabel: "Cartoons",
    medium: "Acrylic on Wood",
    status: "available",
    image: cartoonsPenguinSalute,
    description:
      "A playful animated-style penguin character in bold linework and flat colour — a study in character illustration for younger collectors and playful spaces.",
    year: 2025,
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

// One-time seed: uploads the current curated artwork photos + the About
// portrait into Supabase Storage and inserts matching rows into the
// artworks / site_images tables. Safe to re-run — every row and upload is
// upserted, so running it again after adding new local files just updates
// existing rows and adds new ones.
//
// Usage (from the project root, after running supabase/schema.sql once):
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxxx node supabase/seed.mjs

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryDir = path.join(__dirname, "..", "src", "assets", "gallery");
const brandDir = path.join(__dirname, "..", "src", "assets");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them (see the comment at the top of this file) and re-run.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = "site-images";

/** @type {{id:string,title:string,category:string,categoryLabel:string,medium:string,status:string,description:string,year:number,file:string}[]} */
const artworks = [
  { id: "woman-of-the-savanna", title: "Woman of the Savanna", category: "traditional", categoryLabel: "Traditional", medium: "Acrylic on Canvas", status: "featured", year: 2025, file: "traditional-woman-of-the-savanna.jpg", description: "A profile portrait built from an acacia sunset — the sitter's silhouette and the tree line become one shape against a glowing horizon." },
  { id: "the-storyteller", title: "The Storyteller", category: "hyperrealism", categoryLabel: "Hyperrealism", medium: "Charcoal & Graphite on Canvas", status: "available", year: 2025, file: "hyperrealism-the-elder-storyteller.jpg", description: "Every crease and fold of fabric rendered by hand — a study in patience, built stroke by stroke until the paper stopped looking like paper." },
  { id: "reflection", title: "Reflection", category: "hyperrealism", categoryLabel: "Hyperrealism", medium: "Charcoal on Canvas", status: "available", year: 2025, file: "hyperrealism-reflection.jpg", description: "A closely cropped study of a hand at rest against a face — weight, texture and quiet held in graphite." },
  { id: "rhino-study", title: "Rhino Study", category: "hyperrealism", categoryLabel: "Hyperrealism", medium: "Graphite on Paper", status: "available", year: 2026, file: "hyperrealism-rhino-study.jpg", description: "A sketchbook study of a white rhino, worked up from reference in soft graphite — the groundwork behind a larger painted piece." },
  { id: "bloom", title: "Bloom", category: "portraits", categoryLabel: "Portraits", medium: "Charcoal on Paper", status: "available", year: 2025, file: "portrait-woman-with-braids.jpg", description: "A portrait set against painted florals — braided hair and quiet expression balanced by soft, layered petals." },
  { id: "one-love-tribute", title: "One Love — A Tribute", category: "portraits", categoryLabel: "Portraits", medium: "Charcoal on Canvas", status: "sold", year: 2025, file: "portrait-one-love-tribute.jpg", description: "A tribute portrait in bold charcoal linework, dreadlocks rendered strand by strand — a study in likeness and legacy." },
  { id: "caught-laughing", title: "Caught Laughing", category: "portraits", categoryLabel: "Portraits", medium: "Charcoal on Paper", status: "commission", year: 2026, file: "portrait-young-woman-framed.jpg", description: "A commissioned portrait built to capture one unguarded expression — mid-laugh, mid-thought." },
  { id: "elephant-study-in-amber", title: "Elephant Study in Amber", category: "wildlife", categoryLabel: "Wildlife", medium: "Acrylic on Canvas", status: "available", year: 2025, file: "wildlife-elephant-study.jpg", description: "A close-cropped elephant portrait pushed into warm amber and charcoal blue — texture and scale over literal colour." },
  { id: "the-herd", title: "The Herd", category: "wildlife", categoryLabel: "Wildlife", medium: "Acrylic on Canvas", status: "available", year: 2025, file: "wildlife-elephant-trio.jpg", description: "Three elephants pressed close together, trunks entwined — a study of family and gentleness in a large animal." },
  { id: "sentinel-eagle", title: "Sentinel", category: "wildlife", categoryLabel: "Wildlife", medium: "Acrylic on Canvas Board", status: "available", year: 2024, file: "wildlife-bald-eagle.jpg", description: "A bald eagle at rest, feather by feather, set against soft foliage green." },
  { id: "giraffe-nocturne", title: "Giraffe Nocturne", category: "wildlife", categoryLabel: "Wildlife", medium: "Acrylic on Canvas Board", status: "available", year: 2026, file: "wildlife-giraffe-nocturne.jpg", description: "A giraffe emerges from near-black shadow, its coat picked out in warm ochre highlights — night on the savanna." },
  { id: "kindred-bee-eaters", title: "Kindred", category: "wildlife", categoryLabel: "Wildlife", medium: "Oil on Canvas", status: "featured", year: 2026, file: "wildlife-bee-eaters-perched.jpg", description: "A pair of European bee-eaters share a branch, their colour and closeness caught against a dissolving green bokeh." },
  { id: "bee-eaters-in-flight", title: "Bee-eaters in the Light", category: "wildlife", categoryLabel: "Wildlife", medium: "Oil on Canvas", status: "available", year: 2026, file: "wildlife-bee-eater-in-flight.jpg", description: "A second study of the same pair, wings caught mid-settle — light breaking through the canopy behind them." },
  { id: "mother-and-child-embuan", title: "Mother and Child", category: "traditional", categoryLabel: "Traditional", medium: "Acrylic on Wood", status: "sold", year: 2024, file: "traditional-embuan-mother-child.jpg", description: "A community commission for the Embuan Children & Youth Foundation — a mother and sleeping child painted in warm sunset tones on reclaimed wood." },
  { id: "the-pestle", title: "The Pestle", category: "traditional", categoryLabel: "Traditional", medium: "Acrylic on Canvas Board", status: "available", year: 2025, file: "traditional-maasai-women.jpg", description: "Two women share the rhythm of grinding grain by hand — a quiet, everyday scene rendered in warm monochrome." },
  { id: "uprising", title: "Uprising", category: "abstract", categoryLabel: "Abstract", medium: "Acrylic on Canvas", status: "available", year: 2025, file: "abstract-uprising.jpg", description: "A raised fist breaks from a field of dripped, splattered colour — protest and hope painted in the same gesture." },
  { id: "technicolor-zebra", title: "Technicolor Zebra", category: "illusional", categoryLabel: "Illusional", medium: "Mixed Media on Canvas", status: "available", year: 2026, file: "illusional-technicolor-zebra.jpg", description: "A familiar animal rebuilt in impossible rainbow stripes — the eye keeps looking for the zebra it expects and finds something else." },
  { id: "break-through", title: "Break Through", category: "mural", categoryLabel: "Mural", medium: "Acrylic Mural on Stucco", status: "available", year: 2025, file: "mural-comic-hero-wall.jpg", description: "A larger-than-life cartoon character bursts through an exterior wall in bold outline and flat colour — commissioned scale work, taken off the canvas entirely." },
  { id: "prism-dancer", title: "Prism Dancer", category: "modern", categoryLabel: "Modern", medium: "Acrylic on Wood Panel", status: "available", year: 2025, file: "modern-dancer-prism.jpg", description: "A dancer mid-turn, rendered in stained-glass colour blocks that shift from gold to rose to teal across the panel." },
  { id: "twilight-dancer", title: "Twilight Dancer", category: "modern", categoryLabel: "Modern", medium: "Acrylic on Wood Panel", status: "available", year: 2025, file: "modern-dancer-silhouette.jpg", description: "A silhouetted figure spins beneath a wide sun hat, dress caught mid-swirl in warm dusk tones." },
  { id: "cartoon-study-penguin", title: "Cartoon Study — Penguin Salute", category: "cartoons", categoryLabel: "Cartoons", medium: "Acrylic on Wood", status: "available", year: 2025, file: "cartoons-penguin-salute.jpg", description: "A playful animated-style penguin character in bold linework and flat colour — a study in character illustration for younger collectors and playful spaces." },
];

async function uploadFile(localPath, storagePath) {
  const bytes = await readFile(localPath);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function main() {
  console.log(`Seeding ${artworks.length} artworks…`);
  for (const [index, a] of artworks.entries()) {
    const localPath = path.join(galleryDir, a.file);
    const storagePath = `artworks/${a.id}.jpg`;
    const imagePath = await uploadFile(localPath, storagePath);
    const { error } = await supabase.from("artworks").upsert({
      id: a.id,
      title: a.title,
      category: a.category,
      category_label: a.categoryLabel,
      medium: a.medium,
      status: a.status,
      description: a.description,
      year: a.year,
      image_path: imagePath,
      sort_order: index,
    });
    if (error) throw new Error(`Insert failed for ${a.id}: ${error.message}`);
    console.log(`  ✓ ${a.title}`);
  }

  console.log("Seeding About portrait…");
  const portraitLocal = path.join(brandDir, "me-portrait.jpg");
  const portraitUrl = await uploadFile(portraitLocal, "site/about-portrait.jpg");
  const { error: portraitError } = await supabase.from("site_images").upsert({
    id: "about_portrait",
    image_path: portraitUrl,
    caption: "Miller S.K. — Founder, Miller Artz",
  });
  if (portraitError) throw new Error(`About portrait insert failed: ${portraitError.message}`);
  console.log("  ✓ About portrait");

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

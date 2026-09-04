// Re-uploads the local artwork files to Supabase Storage, replacing the
// stored image for each artwork ID **without touching any database rows** —
// so titles, descriptions and ordering edited in the Studio survive.
//
// Use this after re-cropping / re-processing the local images.
//
// Usage (from the project root):
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/reupload-images.mjs

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const galleryDir = path.join(__dirname, "..", "src", "assets", "gallery");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = "site-images";

/** artwork id -> local file name */
const files = {
  "woman-of-the-savanna": "traditional-woman-of-the-savanna.jpg",
  "the-storyteller": "hyperrealism-the-elder-storyteller.jpg",
  reflection: "hyperrealism-reflection.jpg",
  "rhino-study": "hyperrealism-rhino-study.jpg",
  bloom: "portrait-woman-with-braids.jpg",
  "one-love-tribute": "portrait-one-love-tribute.jpg",
  "caught-laughing": "portrait-young-woman-framed.jpg",
  "elephant-study-in-amber": "wildlife-elephant-study.jpg",
  "the-herd": "wildlife-elephant-trio.jpg",
  "sentinel-eagle": "wildlife-bald-eagle.jpg",
  "giraffe-nocturne": "wildlife-giraffe-nocturne.jpg",
  "kindred-bee-eaters": "wildlife-bee-eaters-perched.jpg",
  "bee-eaters-in-flight": "wildlife-bee-eater-in-flight.jpg",
  "mother-and-child-embuan": "traditional-embuan-mother-child.jpg",
  "the-pestle": "traditional-maasai-women.jpg",
  uprising: "abstract-uprising.jpg",
  "technicolor-zebra": "illusional-technicolor-zebra.jpg",
  "break-through": "mural-comic-hero-wall.jpg",
  "prism-dancer": "modern-dancer-prism.jpg",
  "twilight-dancer": "modern-dancer-silhouette.jpg",
  "cartoon-study-penguin": "cartoons-penguin-salute.jpg",
};

async function main() {
  const entries = Object.entries(files);
  console.log(`Re-uploading ${entries.length} artwork images…`);
  for (const [id, file] of entries) {
    const bytes = await readFile(path.join(galleryDir, file));
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`artworks/${id}.jpg`, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (error) throw new Error(`Upload failed for ${id}: ${error.message}`);
    console.log(`  ✓ ${id}`);
  }
  console.log("Done. Database rows untouched.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

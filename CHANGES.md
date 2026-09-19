# CHANGES — artwork records

Every change made to the `artworks` data, old value → new value, so it can be
checked against the paintings in the studio. Newest first.

## 2026-09-19 — Phase 1: data integrity

Applied by `supabase/migrations/20260919_artwork_integrity.sql`; reversed by
`…_down.sql`. Titles and descriptions below were suggested from the images and
approved by Millar. Sizes are **cm, width × height** — every recorded size
matches its photo's proportions that way, and 21 × 29.7 is A4.

**Prices** (every piece for sale, in US dollars): the smallest piece for sale
starts at **US$150**; price scales with width + height and with medium —
charcoal ×1.0, charcoal & acrylic ×1.15, acrylic ×1.3, oil ×1.6 — rounded to $5.
Rate: US$1.7647 per cm of (width + height). Sold pieces keep the price they sold for.

### Woman of the Savanna (`woman-of-the-savanna`)

- **size:** “35 x 65” → 35 × 65 cm

### The Storyteller (`the-storyteller`)

- **description:**
  - was: “Every crease and fold of fabric rendered by hand — a study in patience, built stroke by stroke until the paper stopped looking like paper.”
  - now: “A seated man, chin resting on his hand, rendered in charcoal and graphite — every crease of the shirt, the lanyard and the watch built up stroke by stroke.”
- **size:** missing → still missing, *needs Millar*

### Silenced (`silenced`)

- **slug:** `reflection` → `silenced` (old address 301-redirects)
- **title:** “Reflection” → “Silenced”
- **description:**
  - was: “A closely cropped study of a hand at rest against a face — weight, texture and quiet held in graphite.”
  - now: “Tears run down a young face as a pair of hands presses over the mouth — grief held in silence, rendered in hyperrealistic charcoal.”
- **size:** “35 x 50” → 35 × 50 cm
- **price:** TZS 100,000 → US$150  _(35+50) × 1.7647 × 1.0 = 150.0 → 150_

### Rhino Study (`rhino-study`)

- **status:** “featured” → “not_for_sale”
- **featured:** yes (was the status value “featured”)
- **description:**
  - was: “A sketchbook study of a white rhino, worked up from reference in soft graphite — the groundwork behind a larger painted piece.”
  - now: “A rhino's head in warm sepia tones — the folds of hide, the ears and the long front horn built up in fine layered shading.”
- **size:** missing → still missing, *needs Millar*

### Bloom (`bloom`)

- **description:**
  - was: “A portrait set against painted florals — braided hair and quiet expression balanced by soft, layered petals.”
  - now: “A portrait of a woman in cool blue monochrome — twisted hair gathered up, hoop earrings, a fine pendant and a softly patterned floral blouse.”
- **size:** “60 x 90” → 60 × 90 cm

### One Love — A Tribute (`one-love-tribute`)

- **description:**
  - was: “A tribute portrait in bold charcoal linework, dreadlocks rendered strand by strand — a study in likeness and legacy.”
  - now: “A tribute portrait in bold black linework on white — flowing dreadlocks, a wide smile and the words “One Love” lettered along the edge.”
- **size:** “60 x 80” → 60 × 80 cm
- **price:** TZS 200,000 → US$320  _(60+80) × 1.7647 × 1.3 = 321.2 → 320_

### Caught Laughing (`caught-laughing`)

- **status:** “commission” → “not_for_sale”
- **size:** “21 x 29.7” → 21 × 29.7 cm

### Elephant Study in Amber (`elephant-study-in-amber`)

- **size:** “35 x 35” → 35 × 35 cm

### The Herd (`the-herd`)

- **status:** “featured” → “available”
- **featured:** yes (was the status value “featured”)
- **description:**
  - was: “Three elephants pressed close together, trunks entwined — a study of family and gentleness in a large animal.”
  - now: “Three elephants crowd together, heads and tusks overlapping — a study of family and closeness in warm, earthy tones.”
- **size:** “90 x 60” → 90 × 60 cm
- **price:** TZS 250,000 → US$345  _(90+60) × 1.7647 × 1.3 = 344.1 → 345_

### Panther (`panther`)

- **slug:** `sentinel-eagle` → `panther` (old address 301-redirects)
- **description:**
  - was: “A black panther showing a calm expression and ambition towards his gaze”
  - now: “A black panther in profile, pale eyes fixed beyond the frame — worked from deep black to soft grey against a light ground.”
- **size:** “45 x 60” → 45 × 60 cm
- **price:** TZS 150,000 → US$185  _(45+60) × 1.7647 × 1.0 = 185.3 → 185_

### Giraffe Nocturne (`giraffe-nocturne`)

- **size:** “50 x 80” → 50 × 80 cm

### Kindred — Bee-eaters (`kindred-bee-eaters`)

- **title:** “Kindred - Bee Eaters” → “Kindred — Bee-eaters”
- **size:** “75 x 80” → 75 × 80 cm

### Mother and Child (`mother-and-child`)

- **slug:** `bee-eaters-in-flight` → `mother-and-child` (old address 301-redirects)
- **title:** “Mother & Child” → “Mother and Child”
- **description:**
  - was: “A second study of the same pair, wings caught mid-settle — light breaking through the canopy behind them.”
  - now: “A community commission for the Embuan Children & Youth Foundation — a smiling mother in a beaded collar with her sleeping baby, painted in warm sunset tones on a slice of reclaimed log.”
- **size:** “50 x 65” → 50 × 65 cm

### Nourish (`nourish`)

- **slug:** `mother-and-child-embuan` → `nourish` (old address 301-redirects)
- **title:** “Mother and Child” → “Nourish”
- **description:**
  - was: “A community commission for the Embuan Children & Youth Foundation — a mother and sleeping child painted in warm sunset tones on reclaimed wood.”
  - now: “A nursing child painted up close — wide, pale eyes glancing sideways, white markings across the face, and a small hand with a beaded bracelet resting against the mother.”
- **size:** “50 x 50” → 50 × 50 cm
- **price:** TZS 150,000 → US$230  _(50+50) × 1.7647 × 1.3 = 229.4 → 230_

### Calabash Carriers (`calabash-carriers`)

- **slug:** `the-pestle` → `calabash-carriers` (old address 301-redirects)
- **title:** “The Pestle” → “Calabash Carriers”
- **description:**
  - was: “Two women share the rhythm of grinding grain by hand — a quiet, everyday scene rendered in warm monochrome.”
  - now: “Two children in hide capes walk side by side in profile, one holding a tall staff, the other shouldering a stick hung with calabashes — a traditional scene in soft earth tones on a pale ground.”
- **size:** “55 x 80” → 55 × 80 cm

### Lion Roar (`lion-roar`)

- **slug:** `uprising` → `lion-roar` (old address 301-redirects)
- **category:** “Abstract” → “Wildlife”
- **medium:** “Charcoal ” → “Charcoal”
- **description:**
  - was: “A Lion roar captured at the moment projecting the power of the Lion and its position in the jungle”
  - now: “A lion mid-roar, drawn in white on a black ground — fangs bared, mane in fine strands, one amber eye the only colour in the piece.”
- **size:** “30 x 45” → 30 × 45 cm

### Technicolor Zebra (`technicolor-zebra`)

- **size:** “7 x 15” → *not converted, needs Millar:* 7 × 15 looks implausibly small — confirm size and unit

### Break Through (`break-through`)

- **status:** “commission” → “not_for_sale”
- **size:** “80 x 120” → 80 × 120 cm

### Golden Mane (`golden-mane`)

- **slug:** `prism-dancer` → `golden-mane` (old address 301-redirects)
- **title:** “Lion” → “Golden Mane”
- **category:** “Abstract” → “Wildlife”
- **description:**
  - was: “A dancer mid-turn, rendered in stained-glass colour blocks that shift from gold to rose to teal across the panel.”
  - now: “A lion in profile, head lifted toward the light — the mane built up in long strokes of gold, amber and cream against a dark ground.”
- **size:** “75 x 85” → 75 × 85 cm
- **price:** TZS 400,000 → US$365  _(75+85) × 1.7647 × 1.3 = 367.1 → 365_

### Twilight Dancer (`twilight-dancer`)

- **size:** missing → still missing, *needs Millar*

### Cartoon Study — Penguin Salute (`cartoon-study-penguin`)

- **size:** missing → still missing, *needs Millar*

### Dog & Bug Amusement (`dog-and-bug-amusement`)

- **slug:** `dog-bug-ammusment-rkb9` → `dog-and-bug-amusement` (old address 301-redirects)
- **title:** “Dog & Bug Ammusment” → “Dog & Bug Amusement”
- **description:**
  - was: “The piece portrays a dog funnily playing with a lady bug while the lady bug jumps on the dog's nose for ammusment”
  - now: “A black dog bares a toothy grin as a ladybird lands on its nose — a playful close-up, with fur, whiskers and nose texture worked in fine detail.”
- **size:** “60 x 90” → 60 × 90 cm
- **price:** TZS 350,000 → US$305  _(60+90) × 1.7647 × 1.15 = 304.4 → 305_

### African Pride (`african-pride`)

- **slug:** `african-pride-ws0f` → `african-pride` (old address 301-redirects)
- **medium:** “Acrylic on canvas ” → “Acrylic on Canvas”
- **description:**
  - was: “Pride of an African woman expressed through hyperrealism blending on silhouette”
  - now: “A woman in profile, eyes closed and chin raised, framed by a golden sun — a hoop earring catching the light against a warm orange ground.”
- **size:** “46 x 60” → 46 × 60 cm
- **price:** TZS 190,000 → US$245  _(46+60) × 1.7647 × 1.3 = 243.2 → 245_

### Rush Hour (`rush-hour`)

- **slug:** `rush-hour-mee4` → `rush-hour` (old address 301-redirects)
- **title:** “Rush Hour ” → “Rush Hour”
- **status:** “commission” → “not_for_sale”
- **description:**
  - was: “On progress”
  - now: “Work in progress: an overland 4×4 with roof rack, snorkel and spotlights — the body finished in hyperreal detail while the wheels and dust are still in pencil.”
- **size:** “60 x 90” → *not converted, needs Millar:* recorded 60 × 90 but the photo is landscape — 90 × 60?

### Settings
- `hero_collage_ids`, `hero_mobile_ids`: renamed slugs replaced with their new ones.

### Still open (not changed — needs Millar)
- Sizes: Technicolor Zebra, Rush Hour (see above); missing for The Storyteller, Rhino Study, Twilight Dancer, Cartoon Study — Penguin Salute.
- Medium to confirm: Rush Hour (“Acrylic” on what?), Rhino Study (photo looks sepia), Bloom (blue-toned), Lion Roar (white on black — charcoal or pastel?), Technicolor Zebra (photo looks like wood).
- The legacy `dimensions` text column is left untouched for rollback; the site now reads `width_cm` / `height_cm`.

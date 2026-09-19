-- Reverses 20260919_artwork_integrity.sql: every record back to exactly
-- what the 2026-09-19 audit exported, then the new columns and table removed.

begin;

alter table artworks drop constraint if exists artworks_status_check;
alter table artworks drop constraint if exists artworks_price_when_available;

update artworks set id = $q$reflection$q$ where id = $q$silenced$q$;
update artworks set id = $q$sentinel-eagle$q$ where id = $q$panther$q$;
update artworks set id = $q$bee-eaters-in-flight$q$ where id = $q$mother-and-child$q$;
update artworks set id = $q$mother-and-child-embuan$q$ where id = $q$nourish$q$;
update artworks set id = $q$the-pestle$q$ where id = $q$calabash-carriers$q$;
update artworks set id = $q$uprising$q$ where id = $q$lion-roar$q$;
update artworks set id = $q$prism-dancer$q$ where id = $q$golden-mane$q$;
update artworks set id = $q$dog-bug-ammusment-rkb9$q$ where id = $q$dog-and-bug-amusement$q$;
update artworks set id = $q$african-pride-ws0f$q$ where id = $q$african-pride$q$;
update artworks set id = $q$rush-hour-mee4$q$ where id = $q$rush-hour$q$;

update artworks set
  title = $q$Woman of the Savanna$q$,
  description = $q$A profile portrait built from an acacia sunset — the sitter's silhouette and the tree line become one shape against a glowing horizon.$q$,
  category = $q$traditional$q$,
  category_label = $q$Traditional$q$,
  medium = $q$Acrylic on Canvas$q$,
  dimensions = $q$35 x 65$q$,
  status = $q$sold$q$,
  price = 95000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$woman-of-the-savanna$q$;

update artworks set
  title = $q$The Storyteller$q$,
  description = $q$Every crease and fold of fabric rendered by hand — a study in patience, built stroke by stroke until the paper stopped looking like paper.$q$,
  category = $q$hyperrealism$q$,
  category_label = $q$Hyperrealism$q$,
  medium = $q$Charcoal & Graphite on Canvas$q$,
  dimensions = null,
  status = $q$sold$q$,
  price = null,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$the-storyteller$q$;

update artworks set
  title = $q$Reflection$q$,
  description = $q$A closely cropped study of a hand at rest against a face — weight, texture and quiet held in graphite.$q$,
  category = $q$hyperrealism$q$,
  category_label = $q$Hyperrealism$q$,
  medium = $q$Charcoal on Canvas$q$,
  dimensions = $q$35 x 50$q$,
  status = $q$available$q$,
  price = 100000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$reflection$q$;

update artworks set
  title = $q$Rhino Study$q$,
  description = $q$A sketchbook study of a white rhino, worked up from reference in soft graphite — the groundwork behind a larger painted piece.$q$,
  category = $q$hyperrealism$q$,
  category_label = $q$Hyperrealism$q$,
  medium = $q$Graphite on Paper$q$,
  dimensions = null,
  status = $q$featured$q$,
  price = null,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$rhino-study$q$;

update artworks set
  title = $q$Bloom$q$,
  description = $q$A portrait set against painted florals — braided hair and quiet expression balanced by soft, layered petals.$q$,
  category = $q$portraits$q$,
  category_label = $q$Portraits$q$,
  medium = $q$Charcoal on Canvas$q$,
  dimensions = $q$60 x 90$q$,
  status = $q$sold$q$,
  price = 150000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$bloom$q$;

update artworks set
  title = $q$One Love — A Tribute$q$,
  description = $q$A tribute portrait in bold charcoal linework, dreadlocks rendered strand by strand — a study in likeness and legacy.$q$,
  category = $q$portraits$q$,
  category_label = $q$Portraits$q$,
  medium = $q$Acrylic on Canvas$q$,
  dimensions = $q$60 x 80$q$,
  status = $q$available$q$,
  price = 200000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$one-love-tribute$q$;

update artworks set
  title = $q$Caught Laughing$q$,
  description = $q$A commissioned portrait built to capture one unguarded expression — mid-laugh, mid-thought.$q$,
  category = $q$portraits$q$,
  category_label = $q$Portraits$q$,
  medium = $q$Charcoal on Paper$q$,
  dimensions = $q$21 x 29.7$q$,
  status = $q$commission$q$,
  price = 50000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$caught-laughing$q$;

update artworks set
  title = $q$Elephant Study in Amber$q$,
  description = $q$A close-cropped elephant portrait pushed into warm amber and charcoal blue — texture and scale over literal colour.$q$,
  category = $q$wildlife$q$,
  category_label = $q$Wildlife$q$,
  medium = $q$Acrylic on Canvas$q$,
  dimensions = $q$35 x 35$q$,
  status = $q$sold$q$,
  price = 75000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$elephant-study-in-amber$q$;

update artworks set
  title = $q$The Herd$q$,
  description = $q$Three elephants pressed close together, trunks entwined — a study of family and gentleness in a large animal.$q$,
  category = $q$wildlife$q$,
  category_label = $q$Wildlife$q$,
  medium = $q$Acrylic on Canvas$q$,
  dimensions = $q$90 x 60$q$,
  status = $q$featured$q$,
  price = 250000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$the-herd$q$;

update artworks set
  title = $q$Panther$q$,
  description = $q$A black panther showing a calm expression and ambition towards his gaze$q$,
  category = $q$wildlife$q$,
  category_label = $q$Wildlife$q$,
  medium = $q$Charcoal on Canvas Board$q$,
  dimensions = $q$45 x 60$q$,
  status = $q$available$q$,
  price = 150000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$sentinel-eagle$q$;

update artworks set
  title = $q$Giraffe Nocturne$q$,
  description = $q$A giraffe emerges from near-black shadow, its coat picked out in warm ochre highlights — night on the savanna.$q$,
  category = $q$wildlife$q$,
  category_label = $q$Wildlife$q$,
  medium = $q$Acrylic on Canvas Board$q$,
  dimensions = $q$50 x 80$q$,
  status = $q$sold$q$,
  price = 150000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$giraffe-nocturne$q$;

update artworks set
  title = $q$Kindred - Bee Eaters$q$,
  description = $q$A pair of European bee-eaters share a branch, their colour and closeness caught against a dissolving green bokeh.$q$,
  category = $q$wildlife$q$,
  category_label = $q$Wildlife$q$,
  medium = $q$Oil on Canvas$q$,
  dimensions = $q$75 x 80$q$,
  status = $q$sold$q$,
  price = 250000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$kindred-bee-eaters$q$;

update artworks set
  title = $q$Mother & Child$q$,
  description = $q$A second study of the same pair, wings caught mid-settle — light breaking through the canopy behind them.$q$,
  category = $q$traditional$q$,
  category_label = $q$Traditional$q$,
  medium = $q$Acrylic on Log Wood$q$,
  dimensions = $q$50 x 65$q$,
  status = $q$sold$q$,
  price = 70000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$bee-eaters-in-flight$q$;

update artworks set
  title = $q$Mother and Child$q$,
  description = $q$A community commission for the Embuan Children & Youth Foundation — a mother and sleeping child painted in warm sunset tones on reclaimed wood.$q$,
  category = $q$traditional$q$,
  category_label = $q$Traditional$q$,
  medium = $q$Acrylic on Wood$q$,
  dimensions = $q$50 x 50$q$,
  status = $q$available$q$,
  price = 150000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$mother-and-child-embuan$q$;

update artworks set
  title = $q$The Pestle$q$,
  description = $q$Two women share the rhythm of grinding grain by hand — a quiet, everyday scene rendered in warm monochrome.$q$,
  category = $q$traditional$q$,
  category_label = $q$Traditional$q$,
  medium = $q$Acrylic on Canvas Board$q$,
  dimensions = $q$55 x 80$q$,
  status = $q$sold$q$,
  price = 200000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$the-pestle$q$;

update artworks set
  title = $q$Lion Roar$q$,
  description = $q$A Lion roar captured at the moment projecting the power of the Lion and its position in the jungle$q$,
  category = $q$abstract$q$,
  category_label = $q$Abstract$q$,
  medium = $q$Charcoal $q$,
  dimensions = $q$30 x 45$q$,
  status = $q$sold$q$,
  price = 60000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$uprising$q$;

update artworks set
  title = $q$Technicolor Zebra$q$,
  description = $q$A familiar animal rebuilt in impossible rainbow stripes — the eye keeps looking for the zebra it expects and finds something else.$q$,
  category = $q$illusional$q$,
  category_label = $q$Illusional$q$,
  medium = $q$Mixed Media on Canvas$q$,
  dimensions = $q$7 x 15$q$,
  status = $q$sold$q$,
  price = 15000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$technicolor-zebra$q$;

update artworks set
  title = $q$Break Through$q$,
  description = $q$A larger-than-life cartoon character bursts through an exterior wall in bold outline and flat colour — commissioned scale work, taken off the canvas entirely.$q$,
  category = $q$mural$q$,
  category_label = $q$Mural$q$,
  medium = $q$Silk Mural on Stucco$q$,
  dimensions = $q$80 x 120$q$,
  status = $q$commission$q$,
  price = 200000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$break-through$q$;

update artworks set
  title = $q$Lion$q$,
  description = $q$A dancer mid-turn, rendered in stained-glass colour blocks that shift from gold to rose to teal across the panel.$q$,
  category = $q$abstract$q$,
  category_label = $q$Abstract$q$,
  medium = $q$Acrylic on Wood Panel$q$,
  dimensions = $q$75 x 85$q$,
  status = $q$available$q$,
  price = 400000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$prism-dancer$q$;

update artworks set
  title = $q$Twilight Dancer$q$,
  description = $q$A silhouetted figure spins beneath a wide sun hat, dress caught mid-swirl in warm dusk tones.$q$,
  category = $q$modern$q$,
  category_label = $q$Modern$q$,
  medium = $q$Acrylic on Wood Panel$q$,
  dimensions = null,
  status = $q$sold$q$,
  price = null,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$twilight-dancer$q$;

update artworks set
  title = $q$Cartoon Study — Penguin Salute$q$,
  description = $q$A playful animated-style penguin character in bold linework and flat colour — a study in character illustration for younger collectors and playful spaces.$q$,
  category = $q$cartoons$q$,
  category_label = $q$Cartoons$q$,
  medium = $q$Acrylic on Wood$q$,
  dimensions = null,
  status = $q$sold$q$,
  price = null,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$cartoon-study-penguin$q$;

update artworks set
  title = $q$Dog & Bug Ammusment$q$,
  description = $q$The piece portrays a dog funnily playing with a lady bug while the lady bug jumps on the dog's nose for ammusment$q$,
  category = $q$hyperrealism$q$,
  category_label = $q$Hyperrealism$q$,
  medium = $q$Charcoal & Acrylic$q$,
  dimensions = $q$60 x 90$q$,
  status = $q$available$q$,
  price = 350000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$dog-bug-ammusment-rkb9$q$;

update artworks set
  title = $q$African Pride$q$,
  description = $q$Pride of an African woman expressed through hyperrealism blending on silhouette $q$,
  category = $q$traditional$q$,
  category_label = $q$Traditional$q$,
  medium = $q$Acrylic on canvas $q$,
  dimensions = $q$46 x 60$q$,
  status = $q$available$q$,
  price = 190000,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$african-pride-ws0f$q$;

update artworks set
  title = $q$Rush Hour $q$,
  description = $q$On progress $q$,
  category = $q$hyperrealism$q$,
  category_label = $q$Hyperrealism$q$,
  medium = $q$Acrylic$q$,
  dimensions = $q$60 x 90$q$,
  status = $q$commission$q$,
  price = 3e+06,
  currency = $q$TZS$q$,
  updated_at = now()
where id = $q$rush-hour-mee4$q$;

update site_settings s set value = (
  select string_agg(coalesce(r.old_id, t.id), ',' order by t.ord)
  from unnest(string_to_array(s.value, ',')) with ordinality as t(id, ord)
  left join artwork_redirects r on r.new_id = trim(t.id)
), updated_at = now()
where s.key in ('hero_collage_ids', 'hero_mobile_ids') and s.value <> '';

drop table if exists artwork_redirects;
alter table artworks drop column if exists width_cm;
alter table artworks drop column if exists height_cm;
alter table artworks drop column if exists featured;

commit;

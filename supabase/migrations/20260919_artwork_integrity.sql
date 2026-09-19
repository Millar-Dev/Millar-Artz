-- Phase 1: artwork data integrity (approved by Millar, 2026-09-19)
--
-- Run once in the Supabase SQL editor. Everything is in one transaction: if
-- any record no longer matches what the audit saw, nothing is changed.
-- Reverse with 20260919_artwork_integrity_down.sql.
--
-- 1a  new columns: width_cm, height_cm (numbers, cm), featured (boolean)
-- 1b  corrected titles/descriptions/categories, clean slugs, 301 redirect table
-- 1c  sizes moved from free text into width_cm/height_cm
-- 1d  status is now available | sold | not_for_sale; price required when available

begin;

alter table artworks add column if not exists width_cm numeric check (width_cm > 0);
alter table artworks add column if not exists height_cm numeric check (height_cm > 0);
alter table artworks add column if not exists featured boolean not null default false;

-- Old address -> current address. Follows renames automatically (on update
-- cascade), so a piece renamed twice still redirects from its first slug.
create table if not exists artwork_redirects (
  old_id text primary key,
  new_id text not null references artworks(id) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);
alter table artwork_redirects enable row level security;

-- Safety check: every record must still have the title the audit recorded.
do $check$
declare missing text;
begin
  select string_agg(e.id, ', ') into missing
  from (values
    ($q$woman-of-the-savanna$q$, $q$Woman of the Savanna$q$),
    ($q$the-storyteller$q$, $q$The Storyteller$q$),
    ($q$reflection$q$, $q$Reflection$q$),
    ($q$rhino-study$q$, $q$Rhino Study$q$),
    ($q$bloom$q$, $q$Bloom$q$),
    ($q$one-love-tribute$q$, $q$One Love — A Tribute$q$),
    ($q$caught-laughing$q$, $q$Caught Laughing$q$),
    ($q$elephant-study-in-amber$q$, $q$Elephant Study in Amber$q$),
    ($q$the-herd$q$, $q$The Herd$q$),
    ($q$sentinel-eagle$q$, $q$Panther$q$),
    ($q$giraffe-nocturne$q$, $q$Giraffe Nocturne$q$),
    ($q$kindred-bee-eaters$q$, $q$Kindred - Bee Eaters$q$),
    ($q$bee-eaters-in-flight$q$, $q$Mother & Child$q$),
    ($q$mother-and-child-embuan$q$, $q$Mother and Child$q$),
    ($q$the-pestle$q$, $q$The Pestle$q$),
    ($q$uprising$q$, $q$Lion Roar$q$),
    ($q$technicolor-zebra$q$, $q$Technicolor Zebra$q$),
    ($q$break-through$q$, $q$Break Through$q$),
    ($q$prism-dancer$q$, $q$Lion$q$),
    ($q$twilight-dancer$q$, $q$Twilight Dancer$q$),
    ($q$cartoon-study-penguin$q$, $q$Cartoon Study — Penguin Salute$q$),
    ($q$dog-bug-ammusment-rkb9$q$, $q$Dog & Bug Ammusment$q$),
    ($q$african-pride-ws0f$q$, $q$African Pride$q$),
    ($q$rush-hour-mee4$q$, $q$Rush Hour $q$)
  ) as e(id, title)
  left join artworks a on a.id = e.id and a.title = e.title
  where a.id is null;
  if missing is not null then
    raise exception 'Records changed since the audit, nothing applied: %', missing;
  end if;
end
$check$;

-- Content, status, featured, sizes and prices, record by record (by current slug).
update artworks set
  featured = false,
  width_cm = 35,
  height_cm = 65,
  updated_at = now()
where id = $q$woman-of-the-savanna$q$;

update artworks set
  description = $q$A seated man, chin resting on his hand, rendered in charcoal and graphite — every crease of the shirt, the lanyard and the watch built up stroke by stroke.$q$,
  featured = false,
  width_cm = null,
  height_cm = null,
  updated_at = now()
where id = $q$the-storyteller$q$;

update artworks set
  title = $q$Silenced$q$,
  description = $q$Tears run down a young face as a pair of hands presses over the mouth — grief held in silence, rendered in hyperrealistic charcoal.$q$,
  featured = false,
  width_cm = 35,
  height_cm = 50,
  price = 150,
  currency = $q$USD$q$,
  updated_at = now()
where id = $q$reflection$q$;

update artworks set
  description = $q$A rhino's head in warm sepia tones — the folds of hide, the ears and the long front horn built up in fine layered shading.$q$,
  status = $q$not_for_sale$q$,
  featured = true,
  width_cm = null,
  height_cm = null,
  updated_at = now()
where id = $q$rhino-study$q$;

update artworks set
  description = $q$A portrait of a woman in cool blue monochrome — twisted hair gathered up, hoop earrings, a fine pendant and a softly patterned floral blouse.$q$,
  featured = false,
  width_cm = 60,
  height_cm = 90,
  updated_at = now()
where id = $q$bloom$q$;

update artworks set
  description = $q$A tribute portrait in bold black linework on white — flowing dreadlocks, a wide smile and the words “One Love” lettered along the edge.$q$,
  featured = false,
  width_cm = 60,
  height_cm = 80,
  price = 320,
  currency = $q$USD$q$,
  updated_at = now()
where id = $q$one-love-tribute$q$;

update artworks set
  status = $q$not_for_sale$q$,
  featured = false,
  width_cm = 21,
  height_cm = 29.7,
  updated_at = now()
where id = $q$caught-laughing$q$;

update artworks set
  featured = false,
  width_cm = 35,
  height_cm = 35,
  updated_at = now()
where id = $q$elephant-study-in-amber$q$;

update artworks set
  description = $q$Three elephants crowd together, heads and tusks overlapping — a study of family and closeness in warm, earthy tones.$q$,
  status = $q$available$q$,
  featured = true,
  width_cm = 90,
  height_cm = 60,
  price = 345,
  currency = $q$USD$q$,
  updated_at = now()
where id = $q$the-herd$q$;

update artworks set
  description = $q$A black panther in profile, pale eyes fixed beyond the frame — worked from deep black to soft grey against a light ground.$q$,
  featured = false,
  width_cm = 45,
  height_cm = 60,
  price = 185,
  currency = $q$USD$q$,
  updated_at = now()
where id = $q$sentinel-eagle$q$;

update artworks set
  featured = false,
  width_cm = 50,
  height_cm = 80,
  updated_at = now()
where id = $q$giraffe-nocturne$q$;

update artworks set
  title = $q$Kindred — Bee-eaters$q$,
  featured = false,
  width_cm = 75,
  height_cm = 80,
  updated_at = now()
where id = $q$kindred-bee-eaters$q$;

update artworks set
  title = $q$Mother and Child$q$,
  description = $q$A community commission for the Embuan Children & Youth Foundation — a smiling mother in a beaded collar with her sleeping baby, painted in warm sunset tones on a slice of reclaimed log.$q$,
  featured = false,
  width_cm = 50,
  height_cm = 65,
  updated_at = now()
where id = $q$bee-eaters-in-flight$q$;

update artworks set
  title = $q$Nourish$q$,
  description = $q$A nursing child painted up close — wide, pale eyes glancing sideways, white markings across the face, and a small hand with a beaded bracelet resting against the mother.$q$,
  featured = false,
  width_cm = 50,
  height_cm = 50,
  price = 230,
  currency = $q$USD$q$,
  updated_at = now()
where id = $q$mother-and-child-embuan$q$;

update artworks set
  title = $q$Calabash Carriers$q$,
  description = $q$Two children in hide capes walk side by side in profile, one holding a tall staff, the other shouldering a stick hung with calabashes — a traditional scene in soft earth tones on a pale ground.$q$,
  featured = false,
  width_cm = 55,
  height_cm = 80,
  updated_at = now()
where id = $q$the-pestle$q$;

update artworks set
  description = $q$A lion mid-roar, drawn in white on a black ground — fangs bared, mane in fine strands, one amber eye the only colour in the piece.$q$,
  category = $q$wildlife$q$,
  category_label = $q$Wildlife$q$,
  medium = $q$Charcoal$q$,
  featured = false,
  width_cm = 30,
  height_cm = 45,
  updated_at = now()
where id = $q$uprising$q$;

update artworks set
  featured = false,
  width_cm = null,
  height_cm = null,
  updated_at = now()
where id = $q$technicolor-zebra$q$;

update artworks set
  status = $q$not_for_sale$q$,
  featured = false,
  width_cm = 80,
  height_cm = 120,
  updated_at = now()
where id = $q$break-through$q$;

update artworks set
  title = $q$Golden Mane$q$,
  description = $q$A lion in profile, head lifted toward the light — the mane built up in long strokes of gold, amber and cream against a dark ground.$q$,
  category = $q$wildlife$q$,
  category_label = $q$Wildlife$q$,
  featured = false,
  width_cm = 75,
  height_cm = 85,
  price = 365,
  currency = $q$USD$q$,
  updated_at = now()
where id = $q$prism-dancer$q$;

update artworks set
  featured = false,
  width_cm = null,
  height_cm = null,
  updated_at = now()
where id = $q$twilight-dancer$q$;

update artworks set
  featured = false,
  width_cm = null,
  height_cm = null,
  updated_at = now()
where id = $q$cartoon-study-penguin$q$;

update artworks set
  title = $q$Dog & Bug Amusement$q$,
  description = $q$A black dog bares a toothy grin as a ladybird lands on its nose — a playful close-up, with fur, whiskers and nose texture worked in fine detail.$q$,
  featured = false,
  width_cm = 60,
  height_cm = 90,
  price = 305,
  currency = $q$USD$q$,
  updated_at = now()
where id = $q$dog-bug-ammusment-rkb9$q$;

update artworks set
  description = $q$A woman in profile, eyes closed and chin raised, framed by a golden sun — a hoop earring catching the light against a warm orange ground.$q$,
  medium = $q$Acrylic on Canvas$q$,
  featured = false,
  width_cm = 46,
  height_cm = 60,
  price = 245,
  currency = $q$USD$q$,
  updated_at = now()
where id = $q$african-pride-ws0f$q$;

update artworks set
  title = $q$Rush Hour$q$,
  description = $q$Work in progress: an overland 4×4 with roof rack, snorkel and spotlights — the body finished in hyperreal detail while the wheels and dust are still in pencil.$q$,
  status = $q$not_for_sale$q$,
  featured = false,
  width_cm = null,
  height_cm = null,
  updated_at = now()
where id = $q$rush-hour-mee4$q$;

-- Clean slugs. Each rename leaves a redirect from the old address.
update artworks set id = $q$silenced$q$ where id = $q$reflection$q$;
update artworks set id = $q$panther$q$ where id = $q$sentinel-eagle$q$;
update artworks set id = $q$mother-and-child$q$ where id = $q$bee-eaters-in-flight$q$;
update artworks set id = $q$nourish$q$ where id = $q$mother-and-child-embuan$q$;
update artworks set id = $q$calabash-carriers$q$ where id = $q$the-pestle$q$;
update artworks set id = $q$lion-roar$q$ where id = $q$uprising$q$;
update artworks set id = $q$golden-mane$q$ where id = $q$prism-dancer$q$;
update artworks set id = $q$dog-and-bug-amusement$q$ where id = $q$dog-bug-ammusment-rkb9$q$;
update artworks set id = $q$african-pride$q$ where id = $q$african-pride-ws0f$q$;
update artworks set id = $q$rush-hour$q$ where id = $q$rush-hour-mee4$q$;

insert into artwork_redirects (old_id, new_id) values
  ($q$reflection$q$, $q$silenced$q$),
  ($q$sentinel-eagle$q$, $q$panther$q$),
  ($q$bee-eaters-in-flight$q$, $q$mother-and-child$q$),
  ($q$mother-and-child-embuan$q$, $q$nourish$q$),
  ($q$the-pestle$q$, $q$calabash-carriers$q$),
  ($q$uprising$q$, $q$lion-roar$q$),
  ($q$prism-dancer$q$, $q$golden-mane$q$),
  ($q$dog-bug-ammusment-rkb9$q$, $q$dog-and-bug-amusement$q$),
  ($q$african-pride-ws0f$q$, $q$african-pride$q$),
  ($q$rush-hour-mee4$q$, $q$rush-hour$q$)
on conflict (old_id) do update set new_id = excluded.new_id;

-- The home hero selections store slugs; point them at the new ones.
update site_settings s set value = (
  select string_agg(coalesce(r.new_id, t.id), ',' order by t.ord)
  from unnest(string_to_array(s.value, ',')) with ordinality as t(id, ord)
  left join artwork_redirects r on r.old_id = trim(t.id)
), updated_at = now()
where s.key in ('hero_collage_ids', 'hero_mobile_ids') and s.value <> '';

-- The new rules, enforced from here on.
alter table artworks drop constraint if exists artworks_status_check;
alter table artworks add constraint artworks_status_check
  check (status in ('available', 'sold', 'not_for_sale'));
alter table artworks drop constraint if exists artworks_price_when_available;
alter table artworks add constraint artworks_price_when_available
  check (status <> 'available' or price is not null);

commit;

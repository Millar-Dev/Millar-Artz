-- Phase 5: the /learn section — lessons and articles, editable in the Studio.
--
-- Run once in the Supabase SQL editor. Safe to re-run: it creates nothing
-- twice and leaves existing posts alone.
-- Reverse with 20260923_learn_down.sql.

begin;

create table if not exists learn_posts (
  -- The slug, as in artworks: the address is the key.
  id text primary key,
  title text not null,
  excerpt text not null default '',
  -- Plain text with "## " headings and "- " bullets; no HTML is rendered.
  body text not null default '',
  -- One of the five disciplines: painting, music, dance, sculpture, acrobatics.
  discipline text not null default 'painting',
  cover_path text,
  youtube_url text,
  -- Drafts stay off the site until this is true.
  published boolean not null default false,
  published_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table learn_posts enable row level security;

create index if not exists learn_posts_published_idx
  on learn_posts (published, sort_order);

-- Three outlines to write into, kept as drafts so nothing unfinished is
-- published. Headings are a suggested shape; change them freely in the Studio.
insert into learn_posts (id, title, excerpt, discipline, sort_order, body) values
(
  'photograph-a-reference-photo',
  'How to photograph a reference photo for a portrait commission',
  'TODO(miller): one or two sentences on why the reference decides how good the portrait can be.',
  'painting',
  1,
  '## Why the reference decides the portrait
TODO(miller): what you can and cannot fix later.

## Light
TODO(miller): daylight, facing the light, what time of day, what to avoid.

## Angle and distance
TODO(miller): eye level, how far back to stand, phone lens distortion.

## Focus and resolution
TODO(miller): sharp eyes, how to check on the phone, what to send.

## Expression
TODO(miller): posed vs caught, how many photos to take.

## Common mistakes
TODO(miller): the three you see most often.

## What to send the studio
TODO(miller): how many photos, which format, how to send them.'
),
(
  'charcoal-vs-graphite',
  'Charcoal vs graphite: what each one does to a face',
  'TODO(miller): one or two sentences on how the two materials differ in a portrait.',
  'painting',
  2,
  '## The short answer
TODO(miller): one paragraph.

## What graphite does
TODO(miller): tone range, sheen, fine detail, how it holds an edge.

## What charcoal does
TODO(miller): depth of black, softness, skin, hair.

## Skin, eyes, hair
TODO(miller): how each material behaves on each.

## Paper and surface
TODO(miller): what you work on and why.

## Choosing for a commission
TODO(miller): which you would suggest, and when.'
),
(
  'what-happens-during-a-mural-commission',
  'What actually happens during a mural commission',
  'TODO(miller): one or two sentences on what a client should expect from first call to finished wall.',
  'painting',
  3,
  '## Looking at the wall
TODO(miller): site visit, surface, size, light, permission.

## The design
TODO(miller): sketches, approval, how changes are handled.

## Preparing the surface
TODO(miller): cleaning, priming, what the wall needs.

## Painting on site
TODO(miller): how many days, working hours, weather, access, what you need from the client.

## Paint and protection
TODO(miller): materials, sealing, how long it lasts outdoors.

## Cost and payment
TODO(miller): what drives the price, and how payment is split.

## Looking after it
TODO(miller): cleaning, touch-ups, when to call the studio.'
)
on conflict (id) do nothing;

commit;

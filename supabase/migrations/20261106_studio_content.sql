-- Content the artist should be able to add without a developer.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Reverse with 20261106_studio_content_down.sql.
--
-- Three things lived in code files with TODO notes: photographs for the four
-- departments that have none, the dance and acrobatics classes, and the
-- studio's record (exhibitions, press, collectors, what clients said). Each
-- needed a deploy to change, which means they were never going to be filled
-- in. They move here, behind panels in the Studio.

begin;

-- Photographs and videos for a department. One row per item.
create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  -- Which shelf this belongs to: "dept:music", "dept:dance",
  -- "dept:sculpture", "dept:acrobatics", "dept:painting".
  collection text not null,
  image_path text,
  youtube_url text,
  title text not null default '',
  caption text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A row with neither a photo nor a video has nothing to show.
  constraint media_items_has_something check (
    coalesce(image_path, '') <> '' or coalesce(youtube_url, '') <> ''
  )
);
create index if not exists media_items_collection_idx on media_items (collection, sort_order);
alter table media_items enable row level security;

-- Dance and acrobatics classes and coaching.
create table if not exists training_offers (
  id uuid primary key default gen_random_uuid(),
  discipline text not null default 'dance',
  name text not null,
  level text not null default '',
  schedule text not null default '',
  location text not null default '',
  price text not null default '',
  notes text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table training_offers enable row level security;

-- The studio's record, on the About page.
create table if not exists about_entries (
  id uuid primary key default gen_random_uuid(),
  -- exhibition | press | collector | testimonial
  kind text not null,
  -- Exhibition: the show. Press: the headline. Collector/testimonial: unused.
  title text not null default '',
  -- Exhibition: the venue. Press: the outlet.
  subtitle text not null default '',
  -- Free text, as the artist writes it: "March 2026", "2025".
  date_text text not null default '',
  url text,
  -- Testimonial only, and only ever in the client's own words.
  quote text not null default '',
  -- Collector or testimonial: how they wish to be named, and where.
  name text not null default '',
  place text not null default '',
  -- Testimonial: the piece it was about, if any.
  artwork_id text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint about_entries_kind check (kind in ('exhibition', 'press', 'collector', 'testimonial'))
);
create index if not exists about_entries_kind_idx on about_entries (kind, sort_order);
alter table about_entries enable row level security;

commit;

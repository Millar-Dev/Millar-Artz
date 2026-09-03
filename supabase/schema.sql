-- Miller Artz — admin content schema.
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- for a fresh project. Safe to re-run: every statement is idempotent.

create table if not exists artworks (
  id text primary key,
  title text not null,
  category text not null,
  category_label text not null,
  medium text not null,
  dimensions text,
  status text not null default 'available',
  description text not null default '',
  year int not null,
  image_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_images (
  id text primary key, -- e.g. 'about_portrait'
  image_path text not null,
  caption text not null default '',
  updated_at timestamptz not null default now()
);

-- Row Level Security: the app only ever talks to these tables through the
-- server (using the service role key, which bypasses RLS entirely), never
-- from the browser. RLS is enabled anyway as a safety net — with no policies
-- defined, it denies all access to any client that isn't using the service
-- role key.
alter table artworks enable row level security;
alter table site_images enable row level security;

-- Public storage bucket for artwork/site images, uploaded by the admin
-- through the app and served directly to visitors.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy if not exists "Public read access to site images"
  on storage.objects for select
  using (bucket_id = 'site-images');

-- MillerArtz — admin content schema.
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

-- Price is optional: a piece with no price shows "Price on request" rather
-- than a number, which is normal for commission-led studios.
alter table artworks add column if not exists price numeric;
alter table artworks add column if not exists currency text not null default 'USD';

-- Newsletter signups captured from the Subscription page.
create table if not exists subscribers (
  email text primary key,
  tier text not null default 'free',
  created_at timestamptz not null default now()
);

-- Commission/contact enquiries. Saved server-side so there's a record in the
-- Studio even when someone never follows through on the email or WhatsApp
-- handoff.
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  style text not null default '',
  budget text not null default '',
  timeline text not null default '',
  subject text not null default '',
  message text not null default '',
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Small key/value store for things the artist should be able to edit without
-- a deploy: social profile URLs, contact details, etc.
create table if not exists site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- Row Level Security: the app only ever talks to these tables through the
-- server (using the service role key, which bypasses RLS entirely), never
-- from the browser. RLS is enabled anyway as a safety net — with no policies
-- defined, it denies all access to any client that isn't using the service
-- role key.
alter table artworks enable row level security;
alter table site_images enable row level security;
alter table subscribers enable row level security;
alter table inquiries enable row level security;
alter table site_settings enable row level security;

-- Public storage bucket for artwork/site images, uploaded by the admin
-- through the app and served directly to visitors.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- CREATE POLICY has no IF NOT EXISTS in Postgres, so drop-then-create instead.
drop policy if exists "Public read access to site images" on storage.objects;
create policy "Public read access to site images"
  on storage.objects for select
  using (bucket_id = 'site-images');

-- MillerArtz — visitor analytics.
--
-- Run once in the Supabase SQL editor. Safe to run again.
--
-- One row per page view or interaction. Deliberately holds nothing that
-- identifies a person: no IP address, no cookie, no name or email. `visitor`
-- is a one-way hash of the connection details salted with the date, so the
-- same person counts once per day and cannot be recognised on any other day
-- or traced back to who they are.

create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  -- 'pageview' or 'interaction'
  kind        text not null,
  -- 'pageview', 'whatsapp_click', 'call_click', 'email_click',
  -- 'instagram_click', 'facebook_click', 'commission_click',
  -- 'enquiry_sent', 'subscribed'
  name        text not null,
  path        text not null default '',
  -- Where they came from: google, instagram, facebook, whatsapp, direct, ...
  source      text not null default 'direct',
  referrer    text not null default '',
  country     text not null default '',
  region      text not null default '',
  city        text not null default '',
  device      text not null default '',
  browser     text not null default '',
  visitor     text not null default '',
  -- True on the first page of a visit.
  entry       boolean not null default false
);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

-- Same rule as every other table: the server writes and reads with the
-- service role key; with RLS on and no policies, nothing else can.
alter table public.analytics_events enable row level security;

-- 2026-09-19: sizes as numbers, featured as its own flag, a tidier status set
-- and 301s for renamed paintings. See supabase/migrations/20260919_artwork_integrity.sql.
alter table artworks add column if not exists width_cm numeric check (width_cm > 0);
alter table artworks add column if not exists height_cm numeric check (height_cm > 0);
alter table artworks add column if not exists featured boolean not null default false;
create table if not exists artwork_redirects (
  old_id text primary key,
  new_id text not null references artworks(id) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);
alter table artwork_redirects enable row level security;

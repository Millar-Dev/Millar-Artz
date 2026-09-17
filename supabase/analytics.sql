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

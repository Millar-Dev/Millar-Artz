-- The wall as it was, before the mural.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Reverse with 20261105_mural_before_photo_down.sql.
--
-- A mural is judged by what it replaced, so each piece can carry a photo of
-- the bare wall. Only murals use it today, but it is on `artworks` rather
-- than a table of its own: a restored canvas or a repainted sculpture would
-- want exactly the same field.

begin;

alter table artworks add column if not exists before_image_path text;

comment on column artworks.before_image_path is
  'Optional photo of the surface before the work was made — shown as a before/after comparison.';

commit;

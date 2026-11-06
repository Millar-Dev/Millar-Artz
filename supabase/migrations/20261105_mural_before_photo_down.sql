-- Reverses 20261105_mural_before_photo.sql. The stored photos themselves stay
-- in Storage; only the link to them is dropped.

begin;

alter table artworks drop column if exists before_image_path;

commit;

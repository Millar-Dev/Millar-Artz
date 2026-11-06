-- Reverses 20261106_studio_content.sql. Everything added through the Studio's
-- Departments, Training and About panels is deleted, so export first if any of
-- it matters. Uploaded photographs themselves stay in Storage.

begin;

drop table if exists media_items;
drop table if exists training_offers;
drop table if exists about_entries;

commit;

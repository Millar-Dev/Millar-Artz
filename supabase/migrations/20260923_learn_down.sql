-- Reverses 20260923_learn.sql. Deletes every /learn post, including any
-- written since, so export anything worth keeping first.

begin;

drop index if exists learn_posts_published_idx;
drop table if exists learn_posts;

commit;

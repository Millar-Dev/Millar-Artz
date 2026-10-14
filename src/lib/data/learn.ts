import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import { slugify } from "../slug";
import type { DisciplineId } from "../gallery-data";

/**
 * Lessons and articles for /learn.
 *
 * Kept in the database rather than in the code so the artist can write and
 * edit them in the Studio without a deploy — the same way artworks work.
 * Drafts (published = false) never leave the Studio.
 */

export interface LearnPostRow {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  discipline: string;
  cover_path: string | null;
  youtube_url: string | null;
  published: boolean;
  published_at: string | null;
  sort_order: number;
  updated_at?: string;
}

export interface LearnPost {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  discipline: DisciplineId;
  cover: string | null;
  youtubeUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  sortOrder: number;
}

export function fromLearnRow(row: LearnPostRow): LearnPost {
  return {
    id: row.id,
    title: row.title.trim(),
    excerpt: row.excerpt.trim(),
    body: row.body,
    discipline: row.discipline as DisciplineId,
    cover: row.cover_path,
    youtubeUrl: row.youtube_url,
    published: row.published,
    publishedAt: row.published_at,
    sortOrder: row.sort_order,
  };
}

/** Published posts, for the public pages. Empty when the table doesn't exist
 *  yet, so /learn renders its empty state instead of failing. */
export const listLearnPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<LearnPostRow[]> => {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await getSupabaseAdmin()
      .from("learn_posts")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("listLearnPosts failed:", error.message);
      return [];
    }
    return data as LearnPostRow[];
  },
);

/** Everything, drafts included — the Studio's list. */
export const listAllLearnPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<LearnPostRow[]> => {
    await requireAdmin();
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await getSupabaseAdmin()
      .from("learn_posts")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("listAllLearnPosts failed:", error.message);
      return [];
    }
    return data as LearnPostRow[];
  },
);

export interface LearnPostInput {
  /** Current slug when editing; omitted for a new post. */
  id?: string;
  title: string;
  excerpt: string;
  body: string;
  discipline: string;
  cover?: string | null;
  youtubeUrl?: string | null;
  published: boolean;
  sortOrder?: number;
}

const clean = (v: string | null | undefined) => (v ?? "").trim();

export const upsertLearnPost = createServerFn({ method: "POST" })
  .validator((input: LearnPostInput) => input)
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const title = clean(input.title);
    if (!title) throw new Error("A lesson needs a title.");

    // As with artworks, the slug follows the title: renaming a lesson moves
    // its address rather than leaving a stale one behind.
    let id = input.id;
    if (!id) {
      id = slugify(title);
      const { data: clash } = await supabase.from("learn_posts").select("id").eq("id", id).maybeSingle();
      if (clash) id = `${id}-${new Date().getFullYear()}`;
    } else {
      const { data: existing } = await supabase
        .from("learn_posts")
        .select("title,published,published_at")
        .eq("id", id)
        .maybeSingle();
      if (existing && slugify(existing.title) !== slugify(title)) {
        const next = slugify(title);
        const { data: clash } = await supabase.from("learn_posts").select("id").eq("id", next).maybeSingle();
        if (!clash) {
          const { error } = await supabase.from("learn_posts").update({ id: next }).eq("id", id);
          if (error) throw new Error(error.message);
          id = next;
        }
      }
    }

    // The publication date is set once, the first time it goes live.
    const { data: current } = await supabase
      .from("learn_posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    const publishedAt =
      input.published && !current?.published_at ? new Date().toISOString() : (current?.published_at ?? null);

    const { error } = await supabase.from("learn_posts").upsert({
      id,
      title,
      excerpt: clean(input.excerpt),
      body: input.body ?? "",
      discipline: clean(input.discipline) || "painting",
      cover_path: clean(input.cover) || null,
      youtube_url: clean(input.youtubeUrl) || null,
      published: Boolean(input.published),
      published_at: publishedAt,
      sort_order: input.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (/schema cache|relation .* does not exist/i.test(error.message)) {
        throw new Error(
          "The lessons table doesn't exist yet. Run the 23 Sep migration in the Supabase SQL editor, then save again.",
        );
      }
      throw new Error(error.message);
    }
    return { ok: true as const, id };
  });

export const deleteLearnPost = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin().from("learn_posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

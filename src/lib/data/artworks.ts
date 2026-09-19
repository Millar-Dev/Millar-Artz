import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { ARTWORK_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "./supabase";
import { ARTWORK_STATUSES, type ArtworkDbRow, type ArtworkStatus } from "../gallery-data";
import { slugify } from "../slug";

export type { ArtworkStatus };
export type ArtworkRow = ArtworkDbRow;

export const listArtworks = createServerFn({ method: "GET" }).handler(async (): Promise<ArtworkRow[]> => {
  // Before Supabase is connected (or if it's briefly unreachable), the site
  // should still render — just with an empty collection — rather than
  // taking down every page that shows artwork.
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("artworks")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("listArtworks failed:", error.message);
    return [];
  }
  return data as ArtworkRow[];
});

/**
 * Where a retired painting address now lives, or null. Old slugs are kept in
 * `artwork_redirects` so links shared before a rename still arrive.
 */
export const findArtworkRedirect = createServerFn({ method: "GET" })
  .validator((oldId: string) => String(oldId).slice(0, 200))
  .handler(async ({ data: oldId }) => {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await getSupabaseAdmin()
      .from("artwork_redirects")
      .select("new_id")
      .eq("old_id", oldId)
      .maybeSingle();
    // Before the redirect table exists this errors; that just means "none".
    if (error || !data) return null;
    return data.new_id as string;
  });

export interface ArtworkInput {
  /** The current slug when editing; omitted for a new piece. */
  id?: string;
  title: string;
  category: string;
  categoryLabel: string;
  medium: string;
  widthCm?: number | null;
  heightCm?: number | null;
  status: ArtworkStatus;
  featured?: boolean;
  description: string;
  year: number;
  imagePath: string;
  sortOrder?: number;
  /** Required when the piece is available; optional otherwise. */
  price?: number | null;
  currency?: string;
}

const clean = (v: string | undefined | null) => (v ?? "").trim();
const positive = (v: number | null | undefined) =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;

/**
 * A free slug for `title`. A clash with another painting — or with a retired
 * address that still redirects somewhere — is settled with the year, then the
 * category, and only then a number.
 */
async function uniqueSlug(title: string, year: number, category: string, self?: string) {
  const supabase = getSupabaseAdmin();
  const base = slugify(title);
  const [{ data: ids }, { data: retired }] = await Promise.all([
    supabase.from("artworks").select("id").like("id", `${base}%`),
    supabase.from("artwork_redirects").select("old_id,new_id").like("old_id", `${base}%`),
  ]);
  const taken = new Set<string>([
    ...(ids ?? []).map((r) => r.id as string).filter((id) => id !== self),
    // A retired address pointing at this same piece can be reclaimed.
    ...(retired ?? []).filter((r) => r.new_id !== self).map((r) => r.old_id as string),
  ]);
  const candidates = [base, `${base}-${year}`, `${base}-${slugify(category)}`];
  for (const c of candidates) if (!taken.has(c)) return c;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

/** Hero selections are stored as slugs; follow a rename into them. */
async function renameInSettings(oldId: string, newId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", ["hero_collage_ids", "hero_mobile_ids"]);
  for (const row of data ?? []) {
    const ids = String(row.value).split(",").map((s) => s.trim());
    if (!ids.includes(oldId)) continue;
    await supabase
      .from("site_settings")
      .update({
        value: ids.map((id) => (id === oldId ? newId : id)).join(","),
        updated_at: new Date().toISOString(),
      })
      .eq("key", row.key);
  }
}

export const upsertArtwork = createServerFn({ method: "POST" })
  .validator((input: ArtworkInput) => input)
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const supabase = getSupabaseAdmin();

    // Trim on write: a stray space in a title ended up in a page heading.
    const title = clean(input.title);
    const medium = clean(input.medium);
    if (!title || !medium) throw new Error("Title and medium are required.");
    if (!ARTWORK_STATUSES.includes(input.status)) throw new Error("Unknown status.");
    const price = input.price == null || Number.isNaN(input.price) ? null : input.price;
    if (input.status === "available" && price == null) {
      throw new Error("A piece that's available needs a price.");
    }

    // The slug follows the title. Renaming a piece moves its address and
    // leaves a redirect behind, so its page never keeps describing a title it
    // no longer has — the fault that left a lion at /gallery/prism-dancer.
    let id = input.id;
    if (!id) {
      id = await uniqueSlug(title, input.year, input.category);
    } else {
      const { data: existing } = await supabase.from("artworks").select("title").eq("id", id).maybeSingle();
      if (existing && slugify(existing.title) !== slugify(title)) {
        const next = await uniqueSlug(title, input.year, input.category, id);
        if (next !== id) {
          const { error: moveError } = await supabase.from("artworks").update({ id: next }).eq("id", id);
          if (moveError) throw new Error(moveError.message);
          // Reclaiming a retired address: it must stop redirecting.
          await supabase.from("artwork_redirects").delete().eq("old_id", next);
          await supabase.from("artwork_redirects").upsert({ old_id: id, new_id: next });
          await renameInSettings(id, next);
          id = next;
        }
      }
    }

    const { error } = await supabase.from("artworks").upsert({
      id,
      title,
      category: input.category,
      category_label: input.categoryLabel,
      medium,
      width_cm: positive(input.widthCm),
      height_cm: positive(input.heightCm),
      status: input.status,
      featured: Boolean(input.featured),
      description: clean(input.description),
      year: input.year,
      image_path: input.imagePath,
      sort_order: input.sortOrder ?? 0,
      price,
      currency: input.currency || "TZS",
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, id };
  });

export const deleteArtwork = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin().from("artworks").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const reorderArtworks = createServerFn({ method: "POST" })
  .validator((ids: string[]) => ids)
  .handler(async ({ data: ids }) => {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    await Promise.all(
      ids.map((id, index) => supabase.from("artworks").update({ sort_order: index }).eq("id", id)),
    );
    return { ok: true as const };
  });

/** Accepts a multipart form with a single "file" field, uploads it to Storage, returns the public URL. */
export const uploadArtworkImage = createServerFn({ method: "POST" })
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new Error("No file provided.");
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `artworks/${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from(ARTWORK_BUCKET)
      .upload(path, bytes, { contentType: file.type || "image/jpeg" });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(ARTWORK_BUCKET).getPublicUrl(path);
    return { imagePath: data.publicUrl };
  });

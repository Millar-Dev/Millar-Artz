import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { ARTWORK_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export type ArtworkStatus = "available" | "sold" | "commission" | "featured";

export interface ArtworkRow {
  id: string;
  title: string;
  category: string;
  category_label: string;
  medium: string;
  dimensions: string | null;
  status: ArtworkStatus;
  description: string;
  year: number;
  image_path: string;
  sort_order: number;
}

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

export interface ArtworkInput {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  medium: string;
  dimensions?: string;
  status: ArtworkStatus;
  description: string;
  year: number;
  imagePath: string;
  sortOrder?: number;
}

export const upsertArtwork = createServerFn({ method: "POST" })
  .validator((input: ArtworkInput) => input)
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin()
      .from("artworks")
      .upsert({
        id: input.id,
        title: input.title,
        category: input.category,
        category_label: input.categoryLabel,
        medium: input.medium,
        dimensions: input.dimensions ?? null,
        status: input.status,
        description: input.description,
        year: input.year,
        image_path: input.imagePath,
        sort_order: input.sortOrder ?? 0,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);
    return { ok: true as const };
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

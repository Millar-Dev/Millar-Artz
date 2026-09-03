import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { ARTWORK_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface SiteImageRow {
  id: string;
  image_path: string;
  caption: string;
}

export const getSiteImage = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<SiteImageRow | null> => {
    // Falls back to null (callers use a bundled placeholder image) until
    // Supabase is connected.
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await getSupabaseAdmin()
      .from("site_images")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("getSiteImage failed:", error.message);
      return null;
    }
    return data as SiteImageRow | null;
  });

export const updateSiteImage = createServerFn({ method: "POST" })
  .validator((input: { id: string; imagePath: string; caption: string }) => input)
  .handler(async ({ data: input }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin()
      .from("site_images")
      .upsert({
        id: input.id,
        image_path: input.imagePath,
        caption: input.caption,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Shared with uploadArtworkImage's storage path convention but kept separate for clarity of intent. */
export const uploadSiteImage = createServerFn({ method: "POST" })
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new Error("No file provided.");
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `site/${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from(ARTWORK_BUCKET)
      .upload(path, bytes, { contentType: file.type || "image/jpeg" });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(ARTWORK_BUCKET).getPublicUrl(path);
    return { imagePath: data.publicUrl };
  });

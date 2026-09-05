import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

/** Editable-without-a-deploy site details. Keys are fixed; values are yours. */
export const SETTING_KEYS = [
  "instagram_url",
  "facebook_url",
  "whatsapp_number",
  "email",
  "phone_primary",
  "phone_secondary",
  "location",
  /** Comma-separated artwork ids shown in the home hero bouquet, in order
   *  from the left petal round to the right. */
  "hero_collage_ids",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
export type SiteSettings = Record<SettingKey, string>;

/** Used until the artist saves their own values — and as the fallback if the
 *  database is briefly unreachable, so the footer never renders empty. */
export const SETTING_DEFAULTS: SiteSettings = {
  instagram_url: "",
  facebook_url: "",
  whatsapp_number: "255616110100",
  email: "studio@millerartz.com",
  phone_primary: "+255 616 110 100",
  phone_secondary: "+255 754 300 543",
  location: "Tanzania — visits by appointment.",
  hero_collage_ids: "",
};

/** How many pieces the hero bouquet holds. */
export const HERO_COLLAGE_SLOTS = 5;

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteSettings> => {
    if (!isSupabaseConfigured()) return SETTING_DEFAULTS;
    const { data, error } = await getSupabaseAdmin().from("site_settings").select("*");
    if (error) {
      console.error("getSiteSettings failed:", error.message);
      return SETTING_DEFAULTS;
    }
    const settings = { ...SETTING_DEFAULTS };
    for (const row of (data ?? []) as { key: string; value: string }[]) {
      if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
        settings[row.key as SettingKey] = row.value;
      }
    }
    return settings;
  },
);

export const updateSiteSettings = createServerFn({ method: "POST" })
  .validator((input: Partial<SiteSettings>) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const rows = Object.entries(data)
      .filter(([key]) => (SETTING_KEYS as readonly string[]).includes(key))
      .map(([key, value]) => ({
        key,
        value: (value ?? "").trim().slice(0, 500),
        updated_at: new Date().toISOString(),
      }));
    if (rows.length === 0) return { ok: true as const };
    const { error } = await getSupabaseAdmin()
      .from("site_settings")
      .upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

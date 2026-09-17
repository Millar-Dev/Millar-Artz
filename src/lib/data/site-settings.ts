import { createServerFn } from "@tanstack/react-start";
import { BASE_CURRENCY, DEFAULT_BUDGET_BANDS, DEFAULT_RATES } from "../currency";
import { requireAdmin } from "./admin-session";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

/** Editable-without-a-deploy site details. Keys are fixed; values are yours. */
export const SETTING_KEYS = [
  "instagram_url",
  "facebook_url",
  "tiktok_url",
  "youtube_url",
  "whatsapp_number",
  "email",
  "phone_primary",
  "phone_secondary",
  "location",
  /** Currency a first-time visitor sees prices in. */
  "display_currency",
  /** JSON: shillings per unit of each foreign currency, e.g. {"USD":2645.5}. */
  "currency_rates",
  /** When the owner last set the rates — shown in the Studio and beside
   *  converted prices, so nobody mistakes an old rate for today's. */
  "rates_updated",
  /** Comma-separated upper bounds, in shillings, for the enquiry budget field. */
  "budget_bands",
  /** Comma-separated artwork ids shown in the home hero bouquet, in order
   *  from the left petal round to the right. */
  "hero_collage_ids",
  /** Comma-separated artwork ids for the phone/tablet hero, which is a
   *  cross-fading stack rather than a bouquet and so is chosen separately. */
  "hero_mobile_ids",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
export type SiteSettings = Record<SettingKey, string>;

/** Used until the artist saves their own values — and as the fallback if the
 *  database is briefly unreachable, so the footer never renders empty. */
export const SETTING_DEFAULTS: SiteSettings = {
  instagram_url: "",
  facebook_url: "",
  tiktok_url: "",
  youtube_url: "",
  whatsapp_number: "255616110100",
  email: "millarkitumi04@gmail.com",
  phone_primary: "+255 616 110 100",
  phone_secondary: "+255 754 300 543",
  location: "Arusha, Tanzania — visits by appointment.",
  display_currency: BASE_CURRENCY,
  currency_rates: JSON.stringify(DEFAULT_RATES),
  rates_updated: "2026-09-17",
  budget_bands: DEFAULT_BUDGET_BANDS.join(","),
  hero_collage_ids: "",
  hero_mobile_ids: "",
};

/** How many pieces the hero bouquet holds. */
export const HERO_COLLAGE_SLOTS = 5;
/** How many slides the phone/tablet hero cycles through. */
export const HERO_MOBILE_SLOTS = 5;

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

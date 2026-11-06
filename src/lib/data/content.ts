import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

/**
 * Content the artist writes in the Studio: department photographs and videos,
 * the dance and acrobatics classes, and the studio's record on the About page.
 *
 * Every list is "published only" for the public pages and "everything" for the
 * Studio, so a half-finished entry can be saved without anyone seeing it. The
 * public readers swallow errors and return nothing: before the tables exist,
 * each page shows the same honest empty state it showed when these lived in
 * code files full of TODOs.
 */

export interface MediaItemRow {
  id: string;
  collection: string;
  image_path: string | null;
  youtube_url: string | null;
  title: string;
  caption: string;
  sort_order: number;
  published: boolean;
}

export interface TrainingOfferRow {
  id: string;
  discipline: string;
  name: string;
  level: string;
  schedule: string;
  location: string;
  price: string;
  notes: string;
  sort_order: number;
  published: boolean;
}

export type AboutKind = "exhibition" | "press" | "collector" | "testimonial";

export interface AboutEntryRow {
  id: string;
  kind: AboutKind;
  title: string;
  subtitle: string;
  date_text: string;
  url: string | null;
  quote: string;
  name: string;
  place: string;
  artwork_id: string | null;
  sort_order: number;
  published: boolean;
}

/** "music" → "dept:music", the shelf a department's media sits on. */
export const deptCollection = (disciplineId: string) => `dept:${disciplineId}`;

const clean = (v: string | null | undefined) => (v ?? "").trim();

async function readAll<T>(table: string, publishedOnly: boolean): Promise<T[]> {
  if (!isSupabaseConfigured()) return [];
  let query = getSupabaseAdmin().from(table).select("*").order("sort_order", { ascending: true });
  if (publishedOnly) query = query.eq("published", true);
  const { data, error } = await query;
  // Before the 6 Nov migration these tables don't exist; an empty list is the
  // honest answer, and every page already has an empty state.
  if (error) return [];
  return (data ?? []) as T[];
}

// ── Department photographs and videos ───────────────────────────────────────

export const listMediaItems = createServerFn({ method: "GET" }).handler(
  async (): Promise<MediaItemRow[]> => readAll<MediaItemRow>("media_items", true),
);

export const listAllMediaItems = createServerFn({ method: "GET" }).handler(
  async (): Promise<MediaItemRow[]> => {
    await requireAdmin();
    return readAll<MediaItemRow>("media_items", false);
  },
);

/** Which departments have something to show — the navigation asks. */
export const departmentsWithMedia = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const rows = await readAll<MediaItemRow>("media_items", true);
    return [
      ...new Set(
        rows
          .map((r) => r.collection)
          .filter((c) => c.startsWith("dept:"))
          .map((c) => c.slice("dept:".length)),
      ),
    ];
  },
);

export interface MediaItemInput {
  id?: string;
  collection: string;
  imagePath?: string | null;
  youtubeUrl?: string | null;
  title?: string;
  caption?: string;
  sortOrder?: number;
  published?: boolean;
}

export const upsertMediaItem = createServerFn({ method: "POST" })
  .validator((input: MediaItemInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (!clean(data.imagePath) && !clean(data.youtubeUrl)) {
      throw new Error("Add a photo or a video link — one of the two.");
    }
    const row = {
      ...(data.id ? { id: data.id } : {}),
      collection: clean(data.collection),
      image_path: clean(data.imagePath) || null,
      youtube_url: clean(data.youtubeUrl) || null,
      title: clean(data.title),
      caption: clean(data.caption),
      sort_order: data.sortOrder ?? 0,
      published: data.published ?? true,
      updated_at: new Date().toISOString(),
    };
    const { error } = await getSupabaseAdmin().from("media_items").upsert(row);
    if (error) throw new Error(migrationHint(error.message));
    return { ok: true as const };
  });

export const deleteMediaItem = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin().from("media_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ── Training and coaching ───────────────────────────────────────────────────

export const listTrainingOffers = createServerFn({ method: "GET" }).handler(
  async (): Promise<TrainingOfferRow[]> => readAll<TrainingOfferRow>("training_offers", true),
);

export const listAllTrainingOffers = createServerFn({ method: "GET" }).handler(
  async (): Promise<TrainingOfferRow[]> => {
    await requireAdmin();
    return readAll<TrainingOfferRow>("training_offers", false);
  },
);

export interface TrainingOfferInput {
  id?: string;
  discipline: string;
  name: string;
  level?: string;
  schedule?: string;
  location?: string;
  price?: string;
  notes?: string;
  sortOrder?: number;
  published?: boolean;
}

export const upsertTrainingOffer = createServerFn({ method: "POST" })
  .validator((input: TrainingOfferInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (!clean(data.name)) throw new Error("A class needs a name.");
    const { error } = await getSupabaseAdmin()
      .from("training_offers")
      .upsert({
        ...(data.id ? { id: data.id } : {}),
        discipline: clean(data.discipline) || "dance",
        name: clean(data.name),
        level: clean(data.level),
        schedule: clean(data.schedule),
        location: clean(data.location),
        price: clean(data.price),
        notes: clean(data.notes),
        sort_order: data.sortOrder ?? 0,
        published: data.published ?? true,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(migrationHint(error.message));
    return { ok: true as const };
  });

export const deleteTrainingOffer = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin().from("training_offers").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ── The studio's record ─────────────────────────────────────────────────────

export const listAboutEntries = createServerFn({ method: "GET" }).handler(
  async (): Promise<AboutEntryRow[]> => readAll<AboutEntryRow>("about_entries", true),
);

export const listAllAboutEntries = createServerFn({ method: "GET" }).handler(
  async (): Promise<AboutEntryRow[]> => {
    await requireAdmin();
    return readAll<AboutEntryRow>("about_entries", false);
  },
);

export interface AboutEntryInput {
  id?: string;
  kind: AboutKind;
  title?: string;
  subtitle?: string;
  dateText?: string;
  url?: string | null;
  quote?: string;
  name?: string;
  place?: string;
  artworkId?: string | null;
  sortOrder?: number;
  published?: boolean;
}

const ABOUT_KINDS: AboutKind[] = ["exhibition", "press", "collector", "testimonial"];

export const upsertAboutEntry = createServerFn({ method: "POST" })
  .validator((input: AboutEntryInput) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (!ABOUT_KINDS.includes(data.kind)) throw new Error("Unknown kind of entry.");
    // Each kind has one thing it cannot do without, so nothing blank is ever
    // published: a show needs a venue, a feature an outlet, a quote a person.
    if (data.kind === "exhibition" && (!clean(data.title) || !clean(data.subtitle))) {
      throw new Error("An exhibition needs its name and the venue.");
    }
    if (data.kind === "press" && (!clean(data.title) || !clean(data.subtitle))) {
      throw new Error("A press entry needs the headline and the outlet.");
    }
    if (data.kind === "collector" && !clean(data.name)) {
      throw new Error("A collector entry needs the name they agreed to.");
    }
    if (data.kind === "testimonial" && (!clean(data.quote) || !clean(data.name))) {
      throw new Error("A testimonial needs their words and how they're named.");
    }
    const { error } = await getSupabaseAdmin()
      .from("about_entries")
      .upsert({
        ...(data.id ? { id: data.id } : {}),
        kind: data.kind,
        title: clean(data.title),
        subtitle: clean(data.subtitle),
        date_text: clean(data.dateText),
        url: clean(data.url) || null,
        quote: clean(data.quote),
        name: clean(data.name),
        place: clean(data.place),
        artwork_id: clean(data.artworkId) || null,
        sort_order: data.sortOrder ?? 0,
        published: data.published ?? true,
        updated_at: new Date().toISOString(),
      });
    if (error) throw new Error(migrationHint(error.message));
    return { ok: true as const };
  });

export const deleteAboutEntry = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin().from("about_entries").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

function migrationHint(message: string) {
  return /schema cache|relation .* does not exist|column .* does not exist/i.test(message)
    ? "The database doesn't have this table yet. Run the newest file in supabase/migrations in the Supabase SQL editor, then save again."
    : message;
}

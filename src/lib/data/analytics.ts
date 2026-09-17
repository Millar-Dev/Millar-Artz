import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { INTERACTIONS, isMissingTable, record } from "./analytics-record";
import { getSupabaseAdmin, isSupabaseConfigured, type AnalyticsEventRow } from "./supabase";

/**
 * Visitor analytics, kept in the studio's own database and shown in the
 * Studio dashboard.
 *
 * Privacy is the constraint everything else is built around. No cookie, no
 * IP address, nothing a visitor typed is stored. A visitor is recognised only
 * as a one-way hash of their connection details salted with today's date — so
 * they count once per day, and cannot be recognised on any other day or traced
 * back to who they are. Location is the city-level guess Vercel's edge already
 * makes from the connection, not GPS. That keeps the site clear of consent
 * banners while still answering the questions that matter: how many people,
 * from where, arriving how, and what they did.
 */

/** Public — called by the page tracker in the browser. */
export const trackEvent = createServerFn({ method: "POST" })
  .validator(
    (input: {
      kind: "pageview" | "interaction";
      name: string;
      path: string;
      referrer?: string;
      utmSource?: string;
      entry?: boolean;
    }) => input,
  )
  .handler(async ({ data }) => {
    const isPageview = data.kind === "pageview" && data.name === "pageview";
    const isInteraction =
      data.kind === "interaction" &&
      (INTERACTIONS as readonly string[]).includes(data.name) &&
      // These two are recorded server-side, where they can't be faked.
      data.name !== "enquiry_sent" &&
      data.name !== "subscribed";
    if (!isPageview && !isInteraction) return { ok: false as const };
    await record(data);
    return { ok: true as const };
  });

// ── Reporting ────────────────────────────────────────────────────────────

/** Dashboard days follow Tanzania's clock. */
const TZ = "Africa/Dar_es_Salaam";
const dayOf = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

type Tally = Map<string, number>;
const bump = (m: Tally, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by);
const top = (m: Tally, n: number) =>
  [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

export interface AnalyticsReport {
  status: "ok" | "needs_setup" | "unavailable";
  days: number;
  totals: { visitors: number; pageviews: number; interactions: number; enquiries: number };
  previous: { visitors: number; pageviews: number; interactions: number; enquiries: number };
  daily: { date: string; visitors: number; pageviews: number }[];
  pages: { path: string; views: number; visitors: number }[];
  sources: { name: string; visitors: number }[];
  countries: { code: string; visitors: number }[];
  cities: { name: string; country: string; visitors: number }[];
  devices: { name: string; visitors: number }[];
  interactions: { name: string; count: number }[];
  recent: {
    at: string;
    kind: string;
    name: string;
    path: string;
    source: string;
    city: string;
    country: string;
    device: string;
  }[];
  truncated: boolean;
}

const EMPTY_TOTALS = { visitors: 0, pageviews: 0, interactions: 0, enquiries: 0 };

function totalsOf(rows: AnalyticsEventRow[]) {
  const visitors = new Set<string>();
  let pageviews = 0,
    interactions = 0,
    enquiries = 0;
  for (const r of rows) {
    if (r.visitor) visitors.add(r.visitor);
    if (r.kind === "pageview") pageviews++;
    else interactions++;
    if (r.name === "enquiry_sent") enquiries++;
  }
  return { visitors: visitors.size, pageviews, interactions, enquiries };
}

/** Owner-only. `days` is the window; the one before it is returned alongside
 *  so the dashboard can say whether attention is growing. */
export const getAnalytics = createServerFn({ method: "GET" })
  .validator((days: number) => days)
  .handler(async ({ data }): Promise<AnalyticsReport> => {
    await requireAdmin();
    const days = [7, 30, 90].includes(data) ? data : 30;
    const empty: AnalyticsReport = {
      status: "ok",
      days,
      totals: EMPTY_TOTALS,
      previous: EMPTY_TOTALS,
      daily: [],
      pages: [],
      sources: [],
      countries: [],
      cities: [],
      devices: [],
      interactions: [],
      recent: [],
      truncated: false,
    };
    if (!isSupabaseConfigured()) return { ...empty, status: "unavailable" };

    const now = Date.now();
    const DAY = 86_400_000;
    const since = new Date(now - days * 2 * DAY).toISOString();
    const cutoff = now - days * DAY;

    // PostgREST caps a response at 1,000 rows, so page through.
    const PAGE = 1000;
    const MAX_ROWS = 100_000;
    const rows: AnalyticsEventRow[] = [];
    for (let from = 0; from < MAX_ROWS; from += PAGE) {
      const { data: page, error } = await getSupabaseAdmin()
        .from("analytics_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) {
        if (isMissingTable(error)) return { ...empty, status: "needs_setup" };
        console.error("getAnalytics failed:", error.message);
        return { ...empty, status: "unavailable" };
      }
      rows.push(...(page ?? []));
      if (!page || page.length < PAGE) break;
    }

    const current = rows.filter((r) => Date.parse(r.created_at) >= cutoff);
    const previous = rows.filter((r) => Date.parse(r.created_at) < cutoff);

    // Every day in the window, including the quiet ones — a gap in a chart
    // should read as zero, not as a missing day.
    const dayVisitors = new Map<string, Set<string>>();
    const dayViews: Tally = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = dayOf(new Date(now - i * DAY));
      dayVisitors.set(d, new Set());
      dayViews.set(d, 0);
    }

    const pageViews: Tally = new Map();
    const pageVisitors = new Map<string, Set<string>>();
    const sourceVisitors = new Map<string, Set<string>>();
    const countryVisitors = new Map<string, Set<string>>();
    const cityVisitors = new Map<string, Set<string>>();
    const deviceVisitors = new Map<string, Set<string>>();
    const interactionCounts: Tally = new Map();
    const add = (m: Map<string, Set<string>>, k: string, v: string) => {
      if (!k) return;
      if (!m.has(k)) m.set(k, new Set());
      m.get(k)!.add(v);
    };

    for (const r of current) {
      const d = dayOf(new Date(r.created_at));
      if (r.kind === "pageview") {
        dayVisitors.get(d)?.add(r.visitor);
        if (dayViews.has(d)) bump(dayViews, d);
        bump(pageViews, r.path);
        add(pageVisitors, r.path, r.visitor);
        add(sourceVisitors, r.source || "direct", r.visitor);
        add(countryVisitors, r.country, r.visitor);
        add(cityVisitors, r.city ? `${r.city}|${r.country}` : "", r.visitor);
        add(deviceVisitors, r.device, r.visitor);
      } else {
        bump(interactionCounts, r.name);
      }
    }

    const bySize = (m: Map<string, Set<string>>, n: number) =>
      [...m.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, n);

    return {
      status: "ok",
      days,
      totals: totalsOf(current),
      previous: totalsOf(previous),
      daily: [...dayVisitors.entries()].map(([date, v]) => ({
        date,
        visitors: v.size,
        pageviews: dayViews.get(date) ?? 0,
      })),
      pages: top(pageViews, 10).map(([path, views]) => ({
        path,
        views,
        visitors: pageVisitors.get(path)?.size ?? 0,
      })),
      sources: bySize(sourceVisitors, 8).map(([name, v]) => ({ name, visitors: v.size })),
      countries: bySize(countryVisitors, 8).map(([code, v]) => ({ code, visitors: v.size })),
      cities: bySize(cityVisitors, 8).map(([key, v]) => {
        const [name, country] = key.split("|");
        return { name, country, visitors: v.size };
      }),
      devices: bySize(deviceVisitors, 3).map(([name, v]) => ({ name, visitors: v.size })),
      interactions: top(interactionCounts, INTERACTIONS.length).map(([name, count]) => ({
        name,
        count,
      })),
      recent: current.slice(0, 25).map((r) => ({
        at: r.created_at,
        kind: r.kind,
        name: r.name,
        path: r.path,
        source: r.source,
        city: r.city,
        country: r.country,
        device: r.device,
      })),
      truncated: rows.length >= MAX_ROWS,
    };
  });

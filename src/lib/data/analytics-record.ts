// Server-only. Reads the incoming request (headers, IP, session), so it must
// never be reachable from the client bundle: import it only from other
// src/lib/data/*.ts files, and only call it inside a createServerFn handler,
// whose body the build strips from the browser. A module-level reference is
// what the import-protection check rejects.
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { isAdminRequest } from "./admin-session";
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  type AnalyticsEventRow,
} from "./supabase";

/** Interactions the site reports. Anything else is rejected at the door. */
export const INTERACTIONS = [
  "whatsapp_click",
  "call_click",
  "email_click",
  "instagram_click",
  "facebook_click",
  "tiktok_click",
  "youtube_click",
  "commission_click",
  "enquiry_sent",
  "subscribed",
] as const;
export type InteractionName = (typeof INTERACTIONS)[number];

/** The owner's clock: the dashboard's "today" should be Tanzania's today. */
const TZ = "Africa/Dar_es_Salaam";
const dayOf = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

const BOT_UA =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|whatsapp\/|telegrambot|headless|lighthouse|pagespeed|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|preview/i;

function deviceOf(ua: string) {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}

function browserOf(ua: string) {
  if (/Instagram/i.test(ua)) return "Instagram app";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook app";
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "TikTok app";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Other";
}

/**
 * Where a visit came from, in the owner's terms. Campaign tags win, then the
 * referring site, then the in-app browser — Instagram and Facebook often send
 * no referrer at all, but their in-app browsers announce themselves.
 */
function sourceOf(referrerHost: string, utmSource: string, ua: string) {
  if (utmSource) return utmSource.toLowerCase();
  const h = referrerHost.toLowerCase();
  const table: [RegExp, string][] = [
    [/(^|\.)google\./, "google"],
    [/(^|\.)bing\.com$/, "bing"],
    [/(^|\.)yahoo\./, "yahoo"],
    [/duckduckgo\.com$/, "duckduckgo"],
    [/instagram\.com$/, "instagram"],
    [/(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
    [/(wa\.me|whatsapp\.com)$/, "whatsapp"],
    [/tiktok\.com$/, "tiktok"],
    [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "x"],
    [/linkedin\.com$|lnkd\.in$/, "linkedin"],
    [/youtube\.com$|youtu\.be$/, "youtube"],
    [/pinterest\./, "pinterest"],
  ];
  for (const [re, name] of table) if (re.test(h)) return name;
  if (h && !/millerartz\.com$/.test(h)) return h;
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "tiktok";
  return "direct";
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

export function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /analytics_events/.test(error.message ?? "")
  );
}

interface EventInput {
  kind: "pageview" | "interaction";
  name: string;
  path: string;
  referrer?: string;
  utmSource?: string;
  entry?: boolean;
}

/**
 * Writes one event using the current request's headers. Never throws:
 * analytics must not be able to break a page or a form submission.
 */
export async function record(input: EventInput) {
  try {
    if (!isSupabaseConfigured()) return;
    const ua = getRequestHeader("user-agent") ?? "";
    if (!ua || BOT_UA.test(ua)) return;
    if (getRequestHeader("purpose") === "prefetch") return;
    if (await isAdminRequest()) return;

    const path = clip(input.path, 200) || "/";
    if (!path.startsWith("/") || path.startsWith("/studio") || path.startsWith("/api")) return;

    let referrerHost = "";
    try {
      if (input.referrer) referrerHost = new URL(input.referrer).hostname;
    } catch {
      /* not a URL — ignore */
    }

    const ip = getRequestIP({ xForwardedFor: true }) ?? "";
    const salt = process.env.ADMIN_SESSION_SECRET ?? "millerartz";
    const visitor = (
      await sha256Hex(`${salt}|${dayOf(new Date())}|${ip}|${ua}`)
    ).slice(0, 20);

    const decode = (v?: string) => {
      try {
        return v ? decodeURIComponent(v) : "";
      } catch {
        return v ?? "";
      }
    };

    const row: Omit<AnalyticsEventRow, "id" | "created_at"> = {
      kind: input.kind,
      name: input.name,
      path,
      source: clip(sourceOf(referrerHost, clip(input.utmSource, 60), ua), 60),
      referrer: clip(referrerHost, 120),
      country: clip(getRequestHeader("x-vercel-ip-country"), 2).toUpperCase(),
      region: clip(decode(getRequestHeader("x-vercel-ip-country-region")), 60),
      city: clip(decode(getRequestHeader("x-vercel-ip-city")), 80),
      device: deviceOf(ua),
      browser: browserOf(ua),
      visitor,
      entry: Boolean(input.entry),
    };
    const { error } = await getSupabaseAdmin().from("analytics_events").insert(row);
    // A missing table just means setup hasn't been run yet; stay quiet.
    if (error && !isMissingTable(error)) {
      console.error("analytics insert failed:", error.message);
    }
  } catch (err) {
    console.error("analytics record failed:", err);
  }
}

/** For server code that has just completed something worth counting — a sent
 *  enquiry, a new subscriber. Recorded where it happens, so it can't be spoofed. */
export async function recordServerInteraction(name: InteractionName, path: string) {
  await record({ kind: "interaction", name, path });
}


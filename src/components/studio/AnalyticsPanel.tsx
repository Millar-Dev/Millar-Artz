import { useEffect, useMemo, useRef, useState } from "react";
import { getAnalytics, type AnalyticsReport } from "@/lib/data/analytics";
import { Check, Copy, Loader2 } from "lucide-react";
import setupSql from "../../../supabase/analytics.sql?raw";
import { EXCLUDE_DEVICE_KEY } from "@/components/site/VisitTracker";

/**
 * "Is anyone looking?" — the owner's view of the site's audience.
 *
 * Laid out in reading order for that question: the headline numbers against
 * the previous period, the daily shape, then where people come from, what
 * they look at, where they are, and what they did. Every figure in a chart is
 * also printed as text, so nothing depends on hovering.
 */

const RANGES = [7, 30, 90] as const;

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct or typed in",
  google: "Google search",
  bing: "Bing",
  yahoo: "Yahoo",
  duckduckgo: "DuckDuckGo",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  pinterest: "Pinterest",
};

const INTERACTION_LABELS: Record<string, string> = {
  enquiry_sent: "Enquiries sent",
  whatsapp_click: "WhatsApp taps",
  call_click: "Phone call taps",
  email_click: "Email taps",
  commission_click: "“Commission” button",
  share_click: "Paintings shared",
  review_click: "Review link taps",
  buy_click: "Buy button taps",
  instagram_click: "Instagram taps",
  facebook_click: "Facebook taps",
  tiktok_click: "TikTok taps",
  youtube_click: "YouTube taps",
  subscribed: "New subscribers",
};

/** How each interaction reads in a sentence: "Someone in Arusha …". */
const INTERACTION_VERBS: Record<string, string> = {
  enquiry_sent: "sent an enquiry",
  whatsapp_click: "tapped WhatsApp",
  call_click: "tapped to call",
  email_click: "tapped to email",
  commission_click: "clicked Commission",
  share_click: "shared a painting",
  review_click: "opened the review form",
  buy_click: "started buying a painting",
  instagram_click: "opened Instagram",
  facebook_click: "opened Facebook",
  tiktok_click: "opened TikTok",
  youtube_click: "opened YouTube",
  subscribed: "subscribed",
};

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/paintings": "Paintings",
  "/music": "Music",
  "/dance": "Dance",
  "/sculpting": "Sculpting",
  "/acrobatics": "Acrobatics",
  "/gallery": "Full archive",
  "/about": "About",
  "/faq": "FAQ",
  "/contact": "Contact",
  "/subscription": "Subscribe",
};

/** "/gallery/woman-of-the-savanna" -> "Painting: Woman Of The Savanna". */
const pageLabel = (path: string) => {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  const m = path.match(/^\/gallery\/([^/]+)$/);
  if (!m) return path;
  const name = decodeURIComponent(m[1])
    .replace(/-[a-z0-9]{4}$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `Painting: ${name}`;
};

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;
const countryName = (code: string) => {
  if (!code) return "Unknown";
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
};
const compact = (n: number) =>
  new Intl.NumberFormat("en", { notation: n >= 10_000 ? "compact" : "standard" }).format(n);

const dayLabel = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", opts);

function ago(iso: string) {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86_400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export function AnalyticsPanel() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    getAnalytics({ data: days })
      .then((r) => live && (setReport(r), setFailed(false)))
      .catch(() => live && setFailed(true))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [days]);

  return (
    <section className="mt-10">
      {/* One row of controls above everything it scopes. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl italic text-ink">Visitors</h2>
          <p className="mt-1 text-xs text-ink/55">
            Who is finding the site, how they got here, and what they did. Your
            own visits while signed in are not counted.
          </p>
        </div>
        <div
          role="group"
          aria-label="Time range"
          className="inline-flex rounded-sm border border-ink/15 p-0.5"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                days === r ? "bg-ink text-canvas" : "text-ink/60 hover:text-ink"
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      <DeviceToggle />

      {!report && loading && (
        <p className="mt-8 inline-flex items-center gap-2 text-sm text-ink/55">
          <Loader2 size={14} className="animate-spin" /> Loading visitor numbers…
        </p>
      )}
      {failed && !report && (
        <p className="mt-8 text-sm text-ink/60">
          Couldn't load visitor numbers just now. Refresh to try again.
        </p>
      )}

      {report?.status === "needs_setup" && <SetupCard />}
      {report?.status === "unavailable" && (
        <p className="mt-8 text-sm text-ink/60">
          The database isn't reachable right now, so visitor numbers can't be shown.
        </p>
      )}

      {report?.status === "ok" && (
        // Refetching holds the previous numbers on screen, dimmed, rather than
        // blanking the dashboard.
        <div className={`transition-opacity ${loading ? "opacity-50" : ""}`}>
          <Report report={report} />
        </div>
      )}
    </section>
  );
}

function Report({ report }: { report: AnalyticsReport }) {
  const { totals, previous, days } = report;
  const nothingYet = totals.pageviews === 0 && totals.interactions === 0;

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden border border-ink/10 bg-ink/10 lg:grid-cols-4">
        <Stat
          hero
          label="Visitors"
          value={totals.visitors}
          prev={previous.visitors}
          days={days}
          hint="People, counted once per day."
        />
        <Stat label="Page views" value={totals.pageviews} prev={previous.pageviews} days={days} />
        <Stat
          label="Interactions"
          value={totals.interactions}
          prev={previous.interactions}
          days={days}
          hint="Taps on WhatsApp, call, email, Instagram, Facebook, TikTok, YouTube and Commission."
        />
        <Stat label="Enquiries sent" value={totals.enquiries} prev={previous.enquiries} days={days} />
      </div>

      {nothingYet ? (
        <div className="border border-dashed border-ink/15 p-8 text-center">
          <p className="font-display text-lg text-ink">No visits recorded in the last {days} days yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/55">
            Counting starts from the moment this was switched on. Share your link on
            Instagram or WhatsApp and the first visitors will appear here within
            seconds.
          </p>
        </div>
      ) : (
        <>
          <div className="border border-ink/10 bg-paper p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/70">
              Visitors per day
            </h3>
            <DailyChart daily={report.daily} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RankList
              title="Where they came from"
              rows={report.sources.map((s) => ({
                key: s.name,
                label: SOURCE_LABELS[s.name] ?? s.name,
                value: s.visitors,
              }))}
              unit="visitors"
            />
            <RankList
              title="Most viewed pages"
              rows={report.pages.map((p) => ({
                key: p.path,
                label: pageLabel(p.path),
                value: p.views,
              }))}
              unit="views"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <RankList
              title="Countries"
              rows={report.countries.map((c) => ({
                key: c.code,
                label: countryName(c.code),
                value: c.visitors,
              }))}
              unit="visitors"
            />
            <RankList
              title="Cities (approximate)"
              note="From the visitor's internet provider, not GPS. Many Tanzanian networks route through Dar es Salaam, so people elsewhere in Tanzania — Arusha included — often show up there. Countries are reliable."
              rows={report.cities.map((c) => ({
                key: `${c.name}-${c.country}`,
                label: c.name,
                sub: countryName(c.country),
                value: c.visitors,
              }))}
              unit="visitors"
              empty="City shows once visitors arrive through millerartz.com."
            />
            <RankList
              title="Devices"
              rows={report.devices.map((d) => ({
                key: d.name,
                label: d.name[0].toUpperCase() + d.name.slice(1),
                value: d.visitors,
              }))}
              unit="visitors"
              percent
            />
          </div>

          <RankList
            title="What visitors did"
            rows={report.interactions.map((i) => ({
              key: i.name,
              label: INTERACTION_LABELS[i.name] ?? i.name,
              value: i.count,
            }))}
            unit="times"
            empty="No taps or enquiries yet in this period."
          />

          <Recent rows={report.recent} />
        </>
      )}

      <p className="text-[11px] leading-relaxed text-ink/45">
        Privacy: no cookies, no IP addresses and nothing visitors type are stored.
        Each visitor is an anonymous code that changes every day, and locations come
        from their internet connection — so there's no way to see a visitor's name,
        and no consent banner is needed.
        {report.truncated && " Showing the most recent 100,000 events."}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  prev,
  days,
  hint,
  hero,
}: {
  label: string;
  value: number;
  prev: number;
  days: number;
  hint?: string;
  hero?: boolean;
}) {
  let delta: string;
  if (prev === 0) delta = value > 0 ? "New this period" : "No change";
  else {
    const pct = Math.round(((value - prev) / prev) * 100);
    delta = pct === 0 ? "No change" : `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct)}%`;
  }
  return (
    <div className="bg-paper p-5" title={hint}>
      <p className="text-xs text-ink/60">{label}</p>
      <p className={`mt-1 font-sans font-semibold text-ink ${hero ? "text-5xl" : "text-3xl"}`}>
        {compact(value)}
      </p>
      <p className="mt-2 text-[11px] text-ink/55">
        {delta} <span className="text-ink/40">vs previous {days} days</span>
      </p>
    </div>
  );
}

/** Nice round axis maximum and its ticks. */
function niceTicks(max: number) {
  if (max <= 0) return [0, 1];
  const rough = max / 3;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? pow * 10;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= top + 1e-9; t += step) ticks.push(Math.round(t));
  return ticks;
}

/** Visitors per day. Single series, so no legend: the heading names it. */
function DailyChart({ daily }: { daily: AnalyticsReport["daily"] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 200;
  const m = { top: 20, right: 4, bottom: 24, left: 34 };
  const plotW = width - m.left - m.right;
  const plotH = H - m.top - m.bottom;
  const n = daily.length;
  const ticks = useMemo(() => niceTicks(Math.max(0, ...daily.map((d) => d.visitors))), [daily]);
  const yMax = ticks[ticks.length - 1] || 1;
  const band = plotW / Math.max(1, n);
  // Capped at 24px and never filling the slot: the leftover is air, and it
  // always leaves at least the 2px surface gap between neighbours.
  const barW = Math.max(1, Math.min(24, band - 2));
  const y = (v: number) => m.top + plotH - (v / yMax) * plotH;
  const peak = daily.reduce((best, d, i) => (d.visitors > daily[best].visitors ? i : best), 0);

  /** Column with a 4px rounded data end and a square foot on the baseline. */
  const column = (x: number, top: number) => {
    const h = m.top + plotH - top;
    if (h <= 0) return "";
    const r = Math.min(4, barW / 2, h);
    const base = m.top + plotH;
    return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + barW - r}Q${x + barW},${top} ${x + barW},${top + r}V${base}Z`;
  };

  const labelIdx = n <= 1 ? [0] : [0, Math.floor((n - 1) / 2), n - 1];
  const a = active != null ? daily[active] : null;
  const tipLeft = active != null ? m.left + band * active + band / 2 : 0;

  return (
    <div ref={wrap} className="relative mt-3">
      <svg
        width={width}
        height={H}
        role="img"
        tabIndex={0}
        aria-label={`Visitors per day over the last ${n} days. Peak of ${daily[peak]?.visitors ?? 0} on ${daily[peak] ? dayLabel(daily[peak].date) : ""}. Use left and right arrows to step through days.`}
        className="block overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        onFocus={() => setActive((v) => v ?? n - 1)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setActive((v) => Math.max(0, (v ?? n) - 1));
          if (e.key === "ArrowRight") setActive((v) => Math.min(n - 1, (v ?? -1) + 1));
        }}
        onPointerLeave={() => setActive(null)}
      >
        {/* Recessive hairline grid and ticks. */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={m.left}
              x2={width - m.right}
              y1={y(t)}
              y2={y(t)}
              stroke="currentColor"
              className="text-ink/10"
              strokeWidth={1}
            />
            <text
              x={m.left - 8}
              y={y(t)}
              dy="0.32em"
              textAnchor="end"
              className="fill-ink/50 text-[10px] tabular-nums"
            >
              {t.toLocaleString("en")}
            </text>
          </g>
        ))}

        {daily.map((d, i) => {
          const x = m.left + band * i + (band - barW) / 2;
          return (
            <g key={d.date}>
              <path
                d={column(x, y(d.visitors))}
                fill="var(--chart-mark)"
                style={active === i ? { filter: "brightness(1.18)" } : undefined}
              />
              {/* Hit target is the whole column band, not the painted bar. */}
              <rect
                x={m.left + band * i}
                y={m.top}
                width={band}
                height={plotH}
                fill="transparent"
                onPointerEnter={() => setActive(i)}
              />
            </g>
          );
        })}

        {/* One direct label: the busiest day. */}
        {daily[peak] && daily[peak].visitors > 0 && (
          <text
            x={m.left + band * peak + band / 2}
            y={y(daily[peak].visitors) - 6}
            textAnchor="middle"
            className="fill-ink/70 text-[10px] font-semibold"
          >
            {daily[peak].visitors}
          </text>
        )}

        {labelIdx.map((i) => (
          <text
            key={i}
            x={m.left + band * i + band / 2}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            className="fill-ink/50 text-[10px]"
          >
            {daily[i] ? dayLabel(daily[i].date) : ""}
          </text>
        ))}
      </svg>

      {a && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-full rounded-sm border border-ink/10 bg-canvas px-3 py-2 shadow-lg"
          style={{
            left: Math.min(Math.max(tipLeft, 70), width - 70),
          }}
        >
          <p className="whitespace-nowrap text-[11px] text-ink/55">
            {dayLabel(a.date, { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <p className="mt-1 flex items-center gap-2 whitespace-nowrap">
            <span
              aria-hidden="true"
              className="inline-block h-0.5 w-3"
              style={{ background: "var(--chart-mark)" }}
            />
            <span className="text-sm font-semibold text-ink">{a.visitors}</span>
            <span className="text-[11px] text-ink/55">visitors</span>
          </p>
          <p className="mt-0.5 whitespace-nowrap pl-5 text-[11px] text-ink/55">
            {a.pageviews} page views
          </p>
        </div>
      )}

      {/* Every value reachable without hovering. */}
      <details className="mt-3 text-xs text-ink/60">
        <summary className="cursor-pointer select-none hover:text-ink">Show as table</summary>
        <div className="mt-2 max-h-56 overflow-auto">
          <table className="w-full text-left tabular-nums">
            <thead>
              <tr className="text-ink/45">
                <th className="py-1 font-medium">Day</th>
                <th className="py-1 text-right font-medium">Visitors</th>
                <th className="py-1 text-right font-medium">Page views</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date} className="border-t border-ink/5">
                  <td className="py-1">{dayLabel(d.date, { weekday: "short", day: "numeric", month: "short" })}</td>
                  <td className="py-1 text-right">{d.visitors}</td>
                  <td className="py-1 text-right">{d.pageviews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/**
 * A ranked breakdown: one series, so one colour for every bar — a darker bar
 * for a bigger number would only repeat what its length already says.
 */
function RankList({
  title,
  rows,
  unit,
  percent,
  note,
  empty = "Nothing recorded in this period.",
}: {
  title: string;
  note?: string;
  rows: { key: string; label: string; sub?: string; value: number }[];
  unit: string;
  percent?: boolean;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <div className="border border-ink/10 bg-paper p-5">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/70">{title}</h3>
      {note && <p className="mt-1.5 text-[11px] leading-snug text-ink/45">{note}</p>}
      {rows.length === 0 ? (
        <p className="mt-4 text-xs text-ink/45">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.key} title={`${r.label}: ${r.value} ${unit}`}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-ink/80">
                  {r.label}
                  {r.sub && <span className="ml-1.5 text-xs text-ink/45">{r.sub}</span>}
                </span>
                <span className="shrink-0 tabular-nums text-ink">
                  {r.value.toLocaleString("en")}
                  {percent && (
                    <span className="ml-1.5 text-xs text-ink/45">
                      {Math.round((r.value / total) * 100)}%
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-1.5">
                <div
                  className="h-full rounded-r-[4px]"
                  style={{
                    width: `${Math.max(2, (r.value / max) * 100)}%`,
                    background: "var(--chart-mark)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The latest arrivals and actions, in plain sentences. */
function Recent({ rows }: { rows: AnalyticsReport["recent"] }) {
  if (rows.length === 0) return null;
  return (
    <div className="border border-ink/10 bg-paper p-5">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/70">
        Latest activity
      </h3>
      <ul className="mt-4 divide-y divide-ink/5">
        {rows.map((r, i) => {
          // Country only: the city is a network guess, and in Tanzania it is
          // usually Dar es Salaam regardless of where the person actually is.
          const where = r.country ? countryName(r.country) : "";
          const page = pageLabel(r.path);
          const via = SOURCE_LABELS[r.source] ?? r.source;
          const action =
            r.kind === "pageview"
              ? `viewed ${page}`
              : `${INTERACTION_VERBS[r.name] ?? r.name} on ${page}`;
          return (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-sm">
              <span className="min-w-0 text-ink/80">
                Someone{where ? ` in ${where}` : ""} {action}
                {r.kind === "pageview" && r.source !== "direct" && (
                  <span className="text-ink/50"> · from {via}</span>
                )}
                <span className="text-ink/40"> · {r.device}</span>
              </span>
              <span className="shrink-0 text-xs text-ink/45">{ago(r.at)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Keeps the owner's own phone and laptop out of the numbers, even when not
 * signed in. Any browser that opens this dashboard is excluded automatically
 * the first time; the button undoes it, for instance to test tracking. Stored
 * per browser, so each device is set by signing into the Studio on it once.
 */
function DeviceToggle() {
  const [excluded, setExcluded] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(EXCLUDE_DEVICE_KEY) === null) {
        localStorage.setItem(EXCLUDE_DEVICE_KEY, "1");
      }
      setExcluded(localStorage.getItem(EXCLUDE_DEVICE_KEY) === "1");
    } catch {
      setExcluded(null);
    }
  }, []);

  if (excluded === null) return null;
  const flip = () => {
    const next = !excluded;
    try {
      localStorage.setItem(EXCLUDE_DEVICE_KEY, next ? "1" : "0");
      setExcluded(next);
    } catch {
      /* storage blocked */
    }
  };
  return (
    <p className="mt-3 text-xs text-ink/55">
      {excluded
        ? "Visits from this device aren't counted, even when you're signed out."
        : "Visits from this device are being counted."}{" "}
      <button onClick={flip} className="font-medium text-ink/75 underline underline-offset-2 hover:text-ink">
        {excluded ? "Count this device" : "Stop counting this device"}
      </button>
    </p>
  );
}

/** Shown until the analytics table exists. */
function SetupCard() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-6 border border-ink/15 bg-paper p-6">
      <p className="font-display text-lg text-ink">One step to switch this on</p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink/70">
        <li>Open your Supabase project and go to <strong>SQL Editor</strong>.</li>
        <li>Click <strong>Copy SQL</strong> below, paste it in, and press <strong>Run</strong>.</li>
        <li>Come back and refresh this page. Visits are counted from then on.</li>
      </ol>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(setupSql);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-band"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy SQL"}
        </button>
        <span className="text-xs text-ink/45">Safe to run more than once.</span>
      </div>
      <details className="mt-4 text-xs text-ink/55">
        <summary className="cursor-pointer select-none hover:text-ink">See the SQL</summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-sm bg-ink/5 p-3 text-[11px] leading-relaxed">
          {setupSql}
        </pre>
      </details>
    </div>
  );
}

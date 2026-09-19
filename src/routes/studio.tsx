import { createFileRoute, useRouter } from "@tanstack/react-router";
import { sized } from "@/lib/images";
import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { AnalyticsPanel } from "@/components/studio/AnalyticsPanel";
import { SOCIAL_PROFILES } from "@/lib/social";
import { PricingPanel } from "@/components/studio/PricingPanel";
import { CURRENCIES } from "@/lib/currency";
import {
  ARTWORK_STATUSES,
  categories,
  fromArtworkRow,
  STATUS_LABEL,
  type Artwork,
  type ArtworkStatus,
} from "@/lib/gallery-data";
import { formatSizeShort } from "@/lib/artwork-size";
import { adminLogin, adminLogout, checkAdminSession } from "@/lib/data/admin-auth";
import {
  deleteArtwork,
  listArtworks,
  reorderArtworks,
  uploadArtworkImage,
  upsertArtwork,
} from "@/lib/data/artworks";
import { getSiteImage, updateSiteImage, uploadSiteImage } from "@/lib/data/site-images";
import {
  deleteInquiry,
  getAlertStatus,
  listInquiries,
  setInquiryHandled,
  triggerTestAlert,
  type InquiryRow,
} from "@/lib/data/inquiries";
import {
  deleteSubscriber,
  listSubscribers,
  type SubscriberRow,
} from "@/lib/data/subscribers";
import {
  getSiteSettings,
  updateSiteSettings,
  HERO_COLLAGE_SLOTS,
  HERO_MOBILE_SLOTS,
  type SiteSettings,
} from "@/lib/data/site-settings";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export const Route = createFileRoute("/studio")({
  loader: async () => {
    const { isAdmin } = await checkAdminSession();
    if (!isAdmin) return { isAdmin: false as const };
    const [rows, portrait, studioPhoto, inquiries, subscribers, settings] =
      await Promise.all([
        listArtworks(),
        getSiteImage({ data: "about_portrait" }),
        getSiteImage({ data: "studio_photo" }),
        listInquiries(),
        listSubscribers(),
        getSiteSettings(),
      ]);
    return {
      isAdmin: true as const,
      artworks: rows.map(fromArtworkRow),
      portrait,
      studioPhoto,
      inquiries,
      subscribers,
      settings,
    };
  },
  head: () => ({ meta: [{ title: "Studio — MillerArtz" }, { name: "robots", content: "noindex" }] }),
  component: Studio,
});

function Studio() {
  const data = Route.useLoaderData();
  const router = useRouter();

  if (!data.isAdmin) {
    return (
      <Layout>
        <LoginScreen onSuccess={() => router.invalidate()} />
      </Layout>
    );
  }

  return (
    <Layout>
      <Dashboard
        initialArtworks={data.artworks}
        initialPortrait={data.portrait}
        initialStudioPhoto={data.studioPhoto}
        initialInquiries={data.inquiries}
        initialSubscribers={data.subscribers}
        initialSettings={data.settings}
        onSignedOut={() => router.invalidate()}
      />
    </Layout>
  );
}

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await adminLogin({ data: password });
      if (!res.ok) {
        if (res.lockedMinutes > 0) {
          setError(
            `Too many wrong attempts. Try again in ${res.lockedMinutes} minute${res.lockedMinutes === 1 ? "" : "s"}.`,
          );
        } else if (res.remaining <= 2) {
          setError(
            `Wrong password. ${res.remaining} attempt${res.remaining === 1 ? "" : "s"} left before a 15-minute lock.`,
          );
        } else {
          setError("Wrong password.");
        }
        return;
      }
      onSuccess();
    } catch {
      setError("Studio isn't connected yet — set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <form onSubmit={submit} className="w-full max-w-sm border border-ink/10 bg-paper p-8">
        <h1 className="font-display font-bold text-2xl text-ink">Studio</h1>
        <p className="mt-2 text-sm text-ink/60">Private — for Miller only.</p>
        <label className="mt-8 block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">Password</span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
          />
        </label>
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-8 w-full rounded-sm bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-band disabled:opacity-50"
        >
          {busy ? "Checking…" : "Enter"}
        </button>
      </form>
    </section>
  );
}

const emptyDraft = (): Partial<Artwork> => ({
  category: "hyperrealism",
  status: "available",
  year: new Date().getFullYear(),
  currency: "TZS",
});

function Dashboard({
  initialArtworks,
  initialPortrait,
  initialStudioPhoto,
  initialInquiries,
  initialSubscribers,
  initialSettings,
  onSignedOut,
}: {
  initialArtworks: Artwork[];
  initialPortrait: { id: string; image_path: string; caption: string } | null;
  initialStudioPhoto: { id: string; image_path: string; caption: string } | null;
  initialInquiries: InquiryRow[];
  initialSubscribers: SubscriberRow[];
  initialSettings: SiteSettings;
  onSignedOut: () => void;
}) {
  const [artworks, setArtworks] = useState(initialArtworks);
  const [editing, setEditing] = useState<Partial<Artwork> | null>(null);
  const [portrait, setPortrait] = useState(
    initialPortrait ?? { id: "about_portrait", image_path: "", caption: "" },
  );
  const [studioPhoto, setStudioPhoto] = useState(
    initialStudioPhoto ?? { id: "studio_photo", image_path: "", caption: "" },
  );

  async function refresh() {
    const rows = await listArtworks();
    setArtworks(rows.map(fromArtworkRow));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this artwork? This can't be undone.")) return;
    await deleteArtwork({ data: id });
    await refresh();
  }

  /** Moves a piece up or down the running order. The list order here is the
   *  order pieces appear in their category row on Home and in the Gallery,
   *  so this is how you choose what leads each row. Optimistic — the list
   *  reorders immediately, then persists. */
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= artworks.length) return;
    const next = [...artworks];
    [next[index], next[target]] = [next[target], next[index]];
    setArtworks(next);
    await reorderArtworks({ data: next.map((a) => a.id) });
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Studio</h1>
          <p className="mt-1 text-sm text-ink/60">
            Changes here go live on the Home and Gallery pages immediately.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setEditing(emptyDraft())}
            className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-band"
          >
            <Plus size={14} /> New artwork
          </button>
          <button
            onClick={async () => {
              await adminLogout();
              onSignedOut();
            }}
            className="rounded-sm border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/70"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* First thing on sign-in: is the site being seen? */}
      <AnalyticsPanel />

      {/* About portrait */}
      <div className="mt-16 flex flex-wrap items-center gap-6 border border-ink/10 bg-paper p-6">
        <img
          src={portrait.image_path || undefined}
          alt=""
          className="h-24 w-20 rounded-sm object-cover bg-ink/5"
        />
        <div className="flex-1 min-w-[240px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            About page portrait
          </p>
          <PortraitEditor portrait={portrait} onSaved={setPortrait} />
        </div>
      </div>

      {/* Studio photograph — shown in the About page's studio section */}
      <div className="mt-4 flex flex-wrap items-center gap-6 border border-ink/10 bg-paper p-6">
        <img
          src={studioPhoto.image_path || undefined}
          alt=""
          className="h-24 w-32 rounded-sm bg-ink/5 object-cover"
        />
        <div className="min-w-[240px] flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            Studio photo
          </p>
          <p className="mt-1 text-xs text-ink/45">
            Appears in “The Studio” section on the About page. Until you upload
            one, that section shows a placeholder note instead.
          </p>
          <PortraitEditor portrait={studioPhoto} onSaved={setStudioPhoto} />
        </div>
      </div>

      {/* Artworks table */}
      <p className="mt-10 text-xs text-ink/50">
        Order here is the order pieces appear in their category row — the top
        of each category leads the row on the Home page.
      </p>
      <div className="mt-3 space-y-3">
        {artworks.map((a, i) => (
          <div
            key={a.id}
            className="flex items-center gap-4 border border-ink/10 bg-paper p-3"
          >
            <div className="flex flex-col">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${a.title} up`}
                className="rounded-sm p-1 text-ink/50 hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-25"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === artworks.length - 1}
                aria-label={`Move ${a.title} down`}
                className="rounded-sm p-1 text-ink/50 hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-25"
              >
                <ChevronDown size={16} />
              </button>
            </div>
            <img src={sized(a.image, 120)} alt="" className="h-16 w-14 rounded-sm object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-bold text-lg text-ink">{a.title}</p>
              <p className="text-xs uppercase tracking-widest text-ink/50">
                {a.categoryLabel} · {a.medium}
                {a.widthCm ? ` · ${formatSizeShort(a.widthCm, a.heightCm)}` : ""} ·{" "}
                {STATUS_LABEL[a.status]}
                {a.featured ? " · ★ featured" : ""}
              </p>
            </div>
            <button
              onClick={() => setEditing(a)}
              aria-label="Edit"
              className="rounded-sm p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDelete(a.id)}
              aria-label="Delete"
              className="rounded-sm p-2 text-ink/60 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {artworks.length === 0 && (
          <p className="py-16 text-center text-sm text-ink/50">
            No artworks yet — add the first one.
          </p>
        )}
      </div>

      <HeroPicker
        initial={initialSettings}
        artworks={artworks}
        settingKey="hero_collage_ids"
        slots={HERO_COLLAGE_SLOTS}
        title="Home hero bouquet (desktop)"
        blurb="The five pieces fanned out at the top of the home page, left to right. The centre one sits tallest and in front."
        labels={[
          "Left petal",
          "Inner left",
          "Centre (front)",
          "Inner right",
          "Right petal",
        ]}
        saveLabel="Save bouquet"
      />
      <HeroPicker
        initial={initialSettings}
        artworks={artworks}
        settingKey="hero_mobile_ids"
        slots={HERO_MOBILE_SLOTS}
        title="Home hero slides (phone & tablet)"
        blurb="Narrow screens can't hold the fan, so they show these pieces one at a time, cross-fading in this order. Chosen separately from the bouquet."
        labels={["Slide 1", "Slide 2", "Slide 3", "Slide 4", "Slide 5"]}
        saveLabel="Save slides"
      />
      <InquiriesPanel initial={initialInquiries} />
      <SubscribersPanel initial={initialSubscribers} />
      <PricingPanel initial={initialSettings} />
      <SettingsPanel initial={initialSettings} />

      {editing && (
        <ArtworkEditor
          draft={editing}
          nextSortOrder={artworks.length}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </section>
  );
}

/** Ordered artwork picker behind either home hero. The desktop bouquet and the
 *  phone slideshow are different compositions — a piece that carries the centre
 *  stem is not necessarily the one to open a slideshow — so each keeps its own
 *  selection rather than sharing one list. */
function HeroPicker({
  initial,
  artworks,
  settingKey,
  slots: slotCount,
  title,
  blurb,
  labels,
  saveLabel,
}: {
  initial: SiteSettings;
  artworks: Artwork[];
  settingKey: "hero_collage_ids" | "hero_mobile_ids";
  slots: number;
  title: string;
  blurb: string;
  labels: string[];
  saveLabel: string;
}) {
  const parse = (v: string) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const [slots, setSlots] = useState<string[]>(() => {
    const saved = parse(initial[settingKey] || "");
    return Array.from(
      { length: slotCount },
      (_, i) => saved[i] ?? artworks[i]?.id ?? "",
    );
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function setSlot(index: number, id: string) {
    setSlots((s) => s.map((v, i) => (i === index ? id : v)));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    try {
      await updateSiteSettings({
        data: { [settingKey]: slots.filter(Boolean).join(",") },
      });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <h2 className="font-display font-bold text-2xl text-ink">{title}</h2>
      <p className="mt-1 text-xs text-ink/50">{blurb}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((id, i) => {
          const chosen = artworks.find((a) => a.id === id);
          return (
            <div key={i} className="border border-ink/10 bg-paper p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                {labels[i] ?? `Slot ${i + 1}`}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-ink/10">
                  {chosen && (
                    <img
                      src={sized(chosen.image, 160)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <select
                  value={id}
                  onChange={(e) => setSlot(i, e.target.value)}
                  className="w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink focus:border-gold focus:outline-none"
                >
                  <option value="">— empty —</option>
                  {artworks.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-band disabled:opacity-50"
        >
          {busy && <Loader2 size={14} className="animate-spin" />} {saveLabel}
        </button>
        {saved && <span className="text-sm text-gold">Saved.</span>}
      </div>
    </section>
  );
}

/**
 * Whether a new enquiry emails the owner. Off until RESEND_API_KEY is set on
 * Vercel — the line says so plainly, with the one step that turns it on.
 */
function AlertStatus() {
  const [status, setStatus] = useState<{ configured: boolean; to: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    getAlertStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  async function test() {
    setSending(true);
    setResult("");
    try {
      const r = await triggerTestAlert();
      setResult(r.ok ? "Test sent — check your inbox (and spam, the first time)." : r.reason);
    } catch {
      setResult("Couldn't send the test.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 border border-ink/10 bg-paper px-4 py-3 text-xs text-ink/65">
      {status.configured ? (
        <div className="flex flex-wrap items-center gap-3">
          <span>
            <span className="font-semibold text-ink">Email alerts are on.</span> Each new
            enquiry is emailed to {status.to} as it arrives.
          </span>
          <button
            onClick={test}
            disabled={sending}
            className="inline-flex items-center gap-1.5 rounded-sm border border-ink/15 px-3 py-1.5 font-medium text-ink/75 hover:text-ink disabled:opacity-50"
          >
            {sending && <Loader2 size={12} className="animate-spin" />} Send test alert
          </button>
          {result && <span className="italic text-gold">{result}</span>}
        </div>
      ) : (
        <span>
          <span className="font-semibold text-ink">Email alerts are off.</span> Add a
          RESEND_API_KEY in Vercel → Settings → Environment Variables to be emailed
          whenever an enquiry arrives.
        </span>
      )}
    </div>
  );
}

/** Commission/contact enquiries submitted through the Contact page. */
function InquiriesPanel({ initial }: { initial: InquiryRow[] }) {
  const [rows, setRows] = useState(initial);
  const [showHandled, setShowHandled] = useState(false);

  const visible = showHandled ? rows : rows.filter((r) => !r.handled);
  const openCount = rows.filter((r) => !r.handled).length;

  async function toggleHandled(row: InquiryRow) {
    const handled = !row.handled;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, handled } : r)));
    await setInquiryHandled({ data: { id: row.id, handled } });
  }

  async function remove(id: string) {
    if (!confirm("Delete this enquiry? This can't be undone.")) return;
    setRows((rs) => rs.filter((r) => r.id !== id));
    await deleteInquiry({ data: id });
  }

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-bold text-2xl text-ink">
          Enquiries{" "}
          {openCount > 0 && (
            <span className="ml-1 rounded-full bg-gold px-2 py-0.5 align-middle font-sans text-[11px] font-bold not- text-band">
              {openCount} new
            </span>
          )}
        </h2>
        <label className="flex items-center gap-2 text-xs text-ink/60">
          <input
            type="checkbox"
            checked={showHandled}
            onChange={(e) => setShowHandled(e.target.checked)}
          />
          Show handled
        </label>
      </div>

      <AlertStatus />

      <div className="mt-5 space-y-3">
        {visible.map((r) => (
          <div
            key={r.id}
            className={`border border-ink/10 bg-paper p-4 ${r.handled ? "opacity-55" : ""}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-bold text-lg text-ink">
                  {r.subject || "Enquiry"}
                </p>
                <p className="mt-1 text-xs text-ink/60">
                  {r.full_name} ·{" "}
                  <a href={`mailto:${r.email}`} className="hover:text-gold">
                    {r.email}
                  </a>
                  {r.phone && ` · ${r.phone}`}
                  {" · "}
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => toggleHandled(r)}
                  className="rounded-sm border border-ink/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/70 hover:border-gold hover:text-gold"
                >
                  {r.handled ? "Reopen" : "Mark handled"}
                </button>
                <button
                  onClick={() => remove(r.id)}
                  aria-label="Delete enquiry"
                  className="rounded-sm p-2 text-ink/50 hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {(r.style || r.budget || r.timeline) && (
              <p className="mt-3 text-xs uppercase tracking-widest text-ink/50">
                {[r.style, r.budget, r.timeline].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink/75">
              {r.message}
            </p>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/50">
            {rows.length === 0
              ? "No enquiries yet."
              : "Nothing outstanding — every enquiry is handled."}
          </p>
        )}
      </div>
    </section>
  );
}

/** Newsletter signups, with a copy-to-clipboard for pasting into a mail tool. */
function SubscribersPanel({ initial }: { initial: SubscriberRow[] }) {
  const [rows, setRows] = useState(initial);
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(rows.map((r) => r.email).join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked — the list is on screen to copy by hand anyway.
    }
  }

  async function remove(email: string) {
    if (!confirm(`Remove ${email} from the list?`)) return;
    setRows((rs) => rs.filter((r) => r.email !== email));
    await deleteSubscriber({ data: email });
  }

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display font-bold text-2xl text-ink">
          Collector&rsquo;s Circle{" "}
          <span className="text-base not- text-ink/50">
            ({rows.length})
          </span>
        </h2>
        {rows.length > 0 && (
          <button
            onClick={copyAll}
            className="rounded-sm border border-ink/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/70 hover:border-gold hover:text-gold"
          >
            {copied ? "Copied" : "Copy all emails"}
          </button>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {rows.map((r) => (
          <div
            key={r.email}
            className="flex items-center justify-between gap-3 border border-ink/10 bg-paper px-4 py-2.5"
          >
            <span className="truncate text-sm text-ink/80">{r.email}</span>
            <span className="shrink-0 text-[10px] uppercase tracking-widest text-ink/40">
              {r.tier} · {new Date(r.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={() => remove(r.email)}
              aria-label={`Remove ${r.email}`}
              className="shrink-0 rounded-sm p-1.5 text-ink/40 hover:bg-red-500/10 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/50">
            No signups yet.
          </p>
        )}
      </div>
    </section>
  );
}

/** Contact details and social links — editable without a deploy. */
/** The fields the Contact & social panel owns — and the only ones it saves. */
const CONTACT_FIELDS = [
  ...SOCIAL_PROFILES.map((p) => [p.key, `${p.label} URL`, p.placeholder] as const),
  ["whatsapp_number", "WhatsApp number", "255616110100"],
  ["email", "Email", "millarkitumi04@gmail.com"],
  ["phone_primary", "Phone (primary)", "+255 616 110 100"],
  ["phone_secondary", "Phone (secondary)", "+255 754 300 543"],
  ["location", "Location", "Arusha, Tanzania — visits by appointment."],
  ["map_url", "Studio map link (Google Maps → Share)", "https://maps.app.goo.gl/…"],
  ["payment_mobile", "Payment: mobile money number", "+255 793 730 227"],
  ["payment_lipa_bank", "Payment: Lipa Namba bank", "Equity Bank"],
  ["payment_lipa_namba", "Payment: Lipa Namba", "80025069"],
  ["payment_lipa_name", "Payment: Lipa Namba name", "MILLER S.K."],
  ["paypal_name", "PayPal name", "Miller Kitumi"],
  ["paypal_link", "PayPal link (optional)", "https://paypal.me/…"],
  ["google_profile_url", "Google Business Profile link", "https://g.page/r/…"],
  ["google_review_url", "Google review link (Ask for reviews)", "https://g.page/r/…/review"],
] as const;

function SettingsPanel({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof SiteSettings, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
    setError("");
  }

  async function save() {
    setBusy(true);
    try {
      // Only this panel's fields. Sending the whole settings object would
      // write back the values from page load over anything saved since by
      // another panel — a re-picked hero bouquet, new exchange rates.
      const data = Object.fromEntries(
        CONTACT_FIELDS.map(([key]) => [key, form[key] ?? ""]),
      ) as Partial<SiteSettings>;
      await updateSiteSettings({ data });
      setSaved(true);
    } catch (err) {
      // e.g. a map link that isn't Google Maps — say so rather than failing silently.
      setError(err instanceof Error ? err.message : "Couldn't save these details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <h2 className="font-display font-bold text-2xl text-ink">Contact &amp; social</h2>
      <p className="mt-1 text-xs text-ink/50">
        Shown in the footer and on the Contact page. Social icons stay hidden
        until you add a real profile link. For the map, open your studio's pin in
        Google Maps, tap Share, and paste the link — leave it empty to hide the map.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {CONTACT_FIELDS.map(([key, label, placeholder]) => (
          <Field key={key} label={label}>
            <input
              value={form[key] ?? ""}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
            />
          </Field>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-band disabled:opacity-50"
        >
          {busy && <Loader2 size={14} className="animate-spin" />} Save details
        </button>
        {saved && <span className="text-sm text-gold">Saved.</span>}
        {error && <span className="text-sm text-red-700">{error}</span>}
      </div>
    </section>
  );
}

/** Caption + replace-photo control for any single site image (the About
 *  portrait, the studio photograph, and anything added later). */
function PortraitEditor({
  portrait,
  onSaved,
}: {
  portrait: { id: string; image_path: string; caption: string };
  onSaved: (p: { id: string; image_path: string; caption: string }) => void;
}) {
  const [caption, setCaption] = useState(portrait.caption);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = portrait.id;

  async function save(newImagePath?: string) {
    setBusy(true);
    try {
      const imagePath = newImagePath ?? portrait.image_path;
      await updateSiteImage({ data: { id, imagePath, caption } });
      onSaved({ id, image_path: imagePath, caption });
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const { imagePath } = await uploadSiteImage({ data: formData });
      await save(imagePath);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3">
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={() => save()}
        placeholder="Caption"
        className="w-64 border-b border-ink/20 bg-transparent py-1 text-sm text-ink focus:border-gold focus:outline-none"
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-sm border border-ink/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/70 disabled:opacity-50"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Replace photo
      </button>
    </div>
  );
}


function ArtworkEditor({
  draft,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  draft: Partial<Artwork>;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(draft);
  const [imagePreview, setImagePreview] = useState(draft.image ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof Artwork>(key: K, value: Artwork[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const { imagePath } = await uploadArtworkImage({ data: formData });
      update("image", imagePath);
      setImagePreview(imagePath);
    } catch {
      setError("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim() || !form.category || !form.medium?.trim() || !form.image || !form.year || !form.status) {
      setError("Title, category, medium, year, status and an image are all required.");
      return;
    }
    if (form.status === "available" && form.price == null) {
      setError("A piece that's available needs a price — or set it to “Not for sale”.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const category = categories.find((c) => c.value === form.category);
      await upsertArtwork({
        data: {
          // New pieces get their slug from the title on the server; renaming
          // an existing piece moves its slug and leaves a redirect.
          id: form.id,
          title: form.title,
          category: form.category,
          categoryLabel: category?.label ?? form.category,
          medium: form.medium,
          widthCm: form.widthCm ?? null,
          heightCm: form.heightCm ?? null,
          featured: form.featured ?? false,
          price: form.price ?? null,
          currency: form.currency || "TZS",
          status: form.status,
          description: form.description ?? "",
          year: form.year,
          imagePath: form.image,
          // Preserve the existing position when editing; only brand-new
          // artworks (no sortOrder yet) go to the end of the list.
          sortOrder: form.sortOrder ?? nextSortOrder,
        },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="animate-fade fixed inset-0 z-[100] flex items-center justify-center bg-band/90 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-auto border border-white/10 bg-paper p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-ink">
            {draft.id ? "Edit artwork" : "New artwork"}
          </h2>
          <button type="button" onClick={onClose} className="text-ink/50 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[160px_1fr]">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="block h-40 w-full overflow-hidden rounded-sm border border-dashed border-ink/20 bg-ink/5"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-ink/50">
                  {busy ? "Uploading…" : "Upload image"}
                </span>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <Field label="Title" required>
              <input
                required
                value={form.title ?? ""}
                onChange={(e) => update("title", e.target.value)}
                className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <select
                  value={form.category ?? ""}
                  onChange={(e) => update("category", e.target.value as Artwork["category"])}
                  className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                >
                  {categories
                    .filter((c) => c.value !== "all")
                    .map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Status" required>
                <select
                  value={form.status ?? "available"}
                  onChange={(e) => update("status", e.target.value as ArtworkStatus)}
                  className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                >
                  {ARTWORK_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={form.featured ?? false}
                onChange={(e) => update("featured", e.target.checked)}
                className="accent-[var(--color-gold)]"
              />
              Featured — shown first on the home page
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Medium" required>
            <input
              required
              value={form.medium ?? ""}
              onChange={(e) => update("medium", e.target.value)}
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
            />
          </Field>
          <Field label="Size (cm, width × height)">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.widthCm ?? ""}
                onChange={(e) => update("widthCm", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="W"
                aria-label="Width in cm"
                className="w-full border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
              />
              <span className="text-ink/40">×</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.heightCm ?? ""}
                onChange={(e) => update("heightCm", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="H"
                aria-label="Height in cm"
                className="w-full border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
              />
            </div>
          </Field>
          <Field label="Price" required={form.status === "available"}>
            <input
              type="number"
              min="0"
              step="1"
              value={form.price ?? ""}
              onChange={(e) =>
                update(
                  "price",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              placeholder={form.status === "available" ? "Required for sale" : "Optional — not shown"}
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
            />
          </Field>
          <Field label="Currency">
            <select
              value={form.currency ?? "TZS"}
              onChange={(e) => update("currency", e.target.value)}
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Year" required>
            <input
              required
              type="number"
              value={form.year ?? ""}
              onChange={(e) => update("year", Number(e.target.value))}
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
            />
          </Field>
        </div>

        <Field label="Description" required>
          <textarea
            required
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            className="mt-4 w-full resize-none border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
          />
        </Field>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-8 rounded-sm bg-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-band disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

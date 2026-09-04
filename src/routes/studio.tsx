import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { categories, fromArtworkRow, type Artwork, type ArtworkStatus } from "@/lib/gallery-data";
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
  listInquiries,
  setInquiryHandled,
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
    const [rows, portrait, inquiries, subscribers, settings] = await Promise.all([
      listArtworks(),
      getSiteImage({ data: "about_portrait" }),
      listInquiries(),
      listSubscribers(),
      getSiteSettings(),
    ]);
    return {
      isAdmin: true as const,
      artworks: rows.map(fromArtworkRow),
      portrait,
      inquiries,
      subscribers,
      settings,
    };
  },
  head: () => ({ meta: [{ title: "Studio — Miller Artz" }, { name: "robots", content: "noindex" }] }),
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
        setError("Wrong password.");
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
        <h1 className="font-display text-2xl italic text-ink">Studio</h1>
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
  currency: "USD",
});

function Dashboard({
  initialArtworks,
  initialPortrait,
  initialInquiries,
  initialSubscribers,
  initialSettings,
  onSignedOut,
}: {
  initialArtworks: Artwork[];
  initialPortrait: { id: string; image_path: string; caption: string } | null;
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
          <h1 className="font-display text-3xl italic text-ink">Studio</h1>
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

      {/* About portrait */}
      <div className="mt-10 flex flex-wrap items-center gap-6 border border-ink/10 bg-paper p-6">
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
            <img src={a.image} alt="" className="h-16 w-14 rounded-sm object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg italic text-ink">{a.title}</p>
              <p className="text-xs uppercase tracking-widest text-ink/50">
                {a.categoryLabel} · {a.medium} · {a.status}
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

      <InquiriesPanel initial={initialInquiries} />
      <SubscribersPanel initial={initialSubscribers} />
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
        <h2 className="font-display text-2xl italic text-ink">
          Enquiries{" "}
          {openCount > 0 && (
            <span className="ml-1 rounded-full bg-gold px-2 py-0.5 align-middle font-sans text-[11px] font-bold not-italic text-band">
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

      <div className="mt-5 space-y-3">
        {visible.map((r) => (
          <div
            key={r.id}
            className={`border border-ink/10 bg-paper p-4 ${r.handled ? "opacity-55" : ""}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg italic text-ink">
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
        <h2 className="font-display text-2xl italic text-ink">
          Collector&rsquo;s Circle{" "}
          <span className="text-base not-italic text-ink/50">
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
function SettingsPanel({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: keyof SiteSettings, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    try {
      await updateSiteSettings({ data: form });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <h2 className="font-display text-2xl italic text-ink">Contact &amp; social</h2>
      <p className="mt-1 text-xs text-ink/50">
        Shown in the footer and on the Contact page. Social icons stay hidden
        until you add a real profile link.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {(
          [
            ["instagram_url", "Instagram URL", "https://instagram.com/yourhandle"],
            ["facebook_url", "Facebook URL", "https://facebook.com/yourpage"],
            ["whatsapp_number", "WhatsApp number", "255616110100"],
            ["email", "Email", "studio@millerartz.com"],
            ["phone_primary", "Phone (primary)", "+255 616 110 100"],
            ["phone_secondary", "Phone (secondary)", "+255 754 300 543"],
            ["location", "Location", "Tanzania — visits by appointment."],
          ] as const
        ).map(([key, label, placeholder]) => (
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
        {saved && <span className="text-sm italic text-gold">Saved.</span>}
      </div>
    </section>
  );
}

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

  async function save(newImagePath?: string) {
    setBusy(true);
    try {
      const imagePath = newImagePath ?? portrait.image_path;
      await updateSiteImage({ data: { id: "about_portrait", imagePath, caption } });
      onSaved({ id: "about_portrait", image_path: imagePath, caption });
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

const statusOptions: ArtworkStatus[] = ["available", "sold", "commission", "featured"];

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
    if (!form.title || !form.category || !form.medium || !form.image || !form.year || !form.status) {
      setError("Title, category, medium, year, status and an image are all required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const category = categories.find((c) => c.value === form.category);
      await upsertArtwork({
        data: {
          id: form.id ?? slugify(form.title),
          title: form.title,
          category: form.category,
          categoryLabel: category?.label ?? form.category,
          medium: form.medium,
          dimensions: form.dimensions,
          price: form.price ?? null,
          currency: form.currency || "USD",
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
    } catch {
      setError("Save failed.");
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
          <h2 className="font-display text-2xl italic text-ink">
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
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
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
          <Field label="Dimensions">
            <input
              value={form.dimensions ?? ""}
              onChange={(e) => update("dimensions", e.target.value)}
              placeholder="e.g. 60 × 80 cm"
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
            />
          </Field>
          <Field label="Price">
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
              placeholder="Leave blank for “on request”"
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
            />
          </Field>
          <Field label="Currency">
            <select
              value={form.currency ?? "USD"}
              onChange={(e) => update("currency", e.target.value)}
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="TZS">TZS (Tanzanian shilling)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
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

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

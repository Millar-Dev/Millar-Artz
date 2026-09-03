import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { categories, fromArtworkRow, type Artwork, type ArtworkStatus } from "@/lib/gallery-data";
import { adminLogin, adminLogout, checkAdminSession } from "@/lib/data/admin-auth";
import {
  deleteArtwork,
  listArtworks,
  uploadArtworkImage,
  upsertArtwork,
} from "@/lib/data/artworks";
import { getSiteImage, updateSiteImage, uploadSiteImage } from "@/lib/data/site-images";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";

export const Route = createFileRoute("/studio")({
  loader: async () => {
    const { isAdmin } = await checkAdminSession();
    if (!isAdmin) return { isAdmin: false as const };
    const [rows, portrait] = await Promise.all([
      listArtworks(),
      getSiteImage({ data: "about_portrait" }),
    ]);
    return { isAdmin: true as const, artworks: rows.map(fromArtworkRow), portrait };
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
});

function Dashboard({
  initialArtworks,
  initialPortrait,
  onSignedOut,
}: {
  initialArtworks: Artwork[];
  initialPortrait: { id: string; image_path: string; caption: string } | null;
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
      <div className="mt-10 space-y-3">
        {artworks.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-4 border border-ink/10 bg-paper p-3"
          >
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
              className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
            />
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

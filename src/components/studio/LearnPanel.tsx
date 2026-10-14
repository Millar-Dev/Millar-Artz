import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import {
  deleteLearnPost,
  fromLearnRow,
  upsertLearnPost,
  type LearnPost,
  type LearnPostRow,
} from "@/lib/data/learn";
import { uploadArtworkImage } from "@/lib/data/artworks";
import { disciplines } from "@/lib/gallery-data";
import { sized } from "@/lib/images";
import { youtubeId } from "@/lib/youtube";

/**
 * Writing and editing the /learn lessons.
 *
 * Posts are drafts until "Published" is ticked, so a half-written lesson can
 * be saved as often as needed without anyone seeing it. The body is plain
 * text: "## " starts a heading, "- " starts a bullet, a blank line starts a
 * paragraph — nothing else is interpreted.
 */
export function LearnPanel({ initial }: { initial: LearnPostRow[] }) {
  const [posts, setPosts] = useState<LearnPost[]>(initial.map(fromLearnRow));
  const [editing, setEditing] = useState<Partial<LearnPost> | null>(null);
  const [error, setError] = useState("");

  async function refresh(saved: LearnPost) {
    setPosts((list) => {
      const rest = list.filter((p) => p.id !== saved.id && p.id !== editing?.id);
      return [...rest, saved].sort((a, b) => a.sortOrder - b.sortOrder);
    });
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete “${title}”? This can't be undone.`)) return;
    try {
      await deleteLearnPost({ data: id });
      setPosts((list) => list.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that lesson.");
    }
  }

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-ink">Learn</h2>
          <p className="mt-1 text-xs text-ink/50">
            Lessons and articles at millerartz.com/learn. Drafts stay hidden until you tick
            “Published”.
          </p>
        </div>
        <button
          onClick={() =>
            setEditing({ discipline: "painting", published: false, sortOrder: posts.length + 1 })
          }
          className="inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
        >
          <Plus size={14} /> New lesson
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {posts.length === 0 && (
          <p className="py-6 text-sm text-ink/50">
            No lessons yet. If you ran the 23 Sep migration, three outlines are waiting here as
            drafts.
          </p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 py-4">
            {p.cover ? (
              <img src={sized(p.cover, 120)} alt="" className="h-12 w-16 rounded-sm object-cover" />
            ) : (
              <span className="h-12 w-16 rounded-sm bg-ink/5" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-bold text-lg text-ink">{p.title}</p>
              <p className="text-xs uppercase tracking-widest text-ink/50">
                {disciplines.find((d) => d.id === p.discipline)?.label ?? p.discipline}
                {" · "}
                {p.published ? "Published" : "Draft"}
                {youtubeId(p.youtubeUrl) ? " · video" : ""}
              </p>
            </div>
            <button onClick={() => setEditing(p)} aria-label="Edit" className="text-ink/50 hover:text-ink">
              <Pencil size={16} />
            </button>
            <button
              onClick={() => remove(p.id, p.title)}
              aria-label="Delete"
              className="text-ink/40 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <LearnEditor
          draft={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            refresh(saved);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

function LearnEditor({
  draft,
  onClose,
  onSaved,
}: {
  draft: Partial<LearnPost>;
  onClose: () => void;
  onSaved: (post: LearnPost) => void;
}) {
  const [form, setForm] = useState(draft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof LearnPost>(key: K, value: LearnPost[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onCover(file: File) {
    setBusy(true);
    try {
      const data = new FormData();
      data.set("file", file);
      const { imagePath } = await uploadArtworkImage({ data });
      set("cover", imagePath);
    } catch {
      setError("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError("A lesson needs a title.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { id } = await upsertLearnPost({
        data: {
          id: form.id,
          title: form.title,
          excerpt: form.excerpt ?? "",
          body: form.body ?? "",
          discipline: form.discipline ?? "painting",
          cover: form.cover ?? null,
          youtubeUrl: form.youtubeUrl ?? null,
          published: Boolean(form.published),
          sortOrder: form.sortOrder ?? 0,
        },
      });
      onSaved({
        id,
        title: form.title.trim(),
        excerpt: (form.excerpt ?? "").trim(),
        body: form.body ?? "",
        discipline: form.discipline ?? "painting",
        cover: form.cover ?? null,
        youtubeUrl: form.youtubeUrl ?? null,
        published: Boolean(form.published),
        publishedAt: form.publishedAt ?? null,
        sortOrder: form.sortOrder ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none";

  return (
    <div
      className="animate-fade fixed inset-0 z-[100] flex items-center justify-center bg-band/90 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-auto border border-white/10 bg-paper p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-ink">
            {draft.id ? "Edit lesson" : "New lesson"}
          </h2>
          <button type="button" onClick={onClose} className="text-ink/50 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <label className="mt-6 block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            Title <span className="text-gold">*</span>
          </span>
          <input
            required
            value={form.title ?? ""}
            onChange={(e) => set("title", e.target.value)}
            className={`${field} mt-1 font-display text-xl`}
          />
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
              Department
            </span>
            <select
              value={form.discipline ?? "painting"}
              onChange={(e) => set("discipline", e.target.value as LearnPost["discipline"])}
              className={`${field} mt-1`}
            >
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
              YouTube link (optional)
            </span>
            <input
              value={form.youtubeUrl ?? ""}
              onChange={(e) => set("youtubeUrl", e.target.value)}
              placeholder="https://youtu.be/…"
              className={`${field} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
              Order
            </span>
            <input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              className={`${field} mt-1`}
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            Summary — one or two sentences, shown on the Learn page and in Google
          </span>
          <textarea
            rows={2}
            value={form.excerpt ?? ""}
            onChange={(e) => set("excerpt", e.target.value)}
            className={`${field} mt-1 resize-none`}
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {form.cover && (
            <img src={sized(form.cover, 160)} alt="" className="h-16 w-24 rounded-sm object-cover" />
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/70 hover:text-ink">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {form.cover ? "Replace cover photo" : "Add cover photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onCover(f);
              }}
            />
          </label>
          {form.cover && (
            <button
              type="button"
              onClick={() => set("cover", null)}
              className="text-xs text-ink/50 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>

        <label className="mt-6 block">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            The lesson
          </span>
          <span className="mt-1 block text-[11px] text-ink/45">
            Start a line with <code>## </code> for a heading and <code>- </code> for a bullet. Leave
            a blank line between paragraphs.
          </span>
          <textarea
            rows={18}
            value={form.body ?? ""}
            onChange={(e) => set("body", e.target.value)}
            className={`${field} mt-2 font-mono text-sm leading-relaxed`}
          />
        </label>

        <label className="mt-6 flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={form.published ?? false}
            onChange={(e) => set("published", e.target.checked)}
            className="accent-[var(--color-gold)]"
          />
          Published — visible at millerartz.com/learn
        </label>

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

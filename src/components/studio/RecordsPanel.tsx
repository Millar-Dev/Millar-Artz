import { useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { uploadArtworkImage } from "@/lib/data/artworks";
import { sized } from "@/lib/images";

/**
 * One panel shape for the lists the artist keeps: department photographs,
 * the classes, the exhibitions and press, the collectors, the testimonials.
 *
 * They differ only in their fields, so they share this: a list with edit and
 * delete, a "new" button, and a form built from a description of the fields.
 * Writing four near-identical panels would have meant four places to fix
 * every time one of them needed a change.
 */

export type FieldType = "text" | "textarea" | "number" | "image" | "select" | "checkbox";

export interface FieldSpec<T> {
  key: keyof T & string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  required?: boolean;
  /** Half-width on wide screens, so short fields pair up. */
  half?: boolean;
}

export interface RecordsPanelProps<T extends { id?: string }> {
  heading: string;
  blurb?: string;
  rows: T[];
  fields: FieldSpec<T>[];
  /** The line shown in the list for a row. */
  describe: (row: T) => { title: string; detail?: string; image?: string | null };
  /** A fresh, empty record. */
  emptyRow: () => T;
  onSave: (row: T) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  addLabel?: string;
  emptyNote?: string;
}

export function RecordsPanel<T extends { id?: string }>({
  heading,
  blurb,
  rows: initial,
  fields,
  describe,
  emptyRow,
  onSave,
  onDelete,
  addLabel = "Add",
  emptyNote,
}: RecordsPanelProps<T>) {
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<T | null>(null);
  const [error, setError] = useState("");

  async function remove(row: T) {
    const { title } = describe(row);
    if (!row.id || !confirm(`Delete “${title}”? This can't be undone.`)) return;
    try {
      await onDelete(row.id);
      setRows((list) => list.filter((r) => r.id !== row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that.");
    }
  }

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-ink">{heading}</h2>
          {blurb && <p className="mt-1 max-w-2xl text-xs text-ink/50">{blurb}</p>}
        </div>
        <button
          onClick={() => setEditing(emptyRow())}
          className="inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
        >
          <Plus size={14} /> {addLabel}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {rows.length === 0 && (
          <p className="py-6 text-sm text-ink/50">{emptyNote ?? "Nothing here yet."}</p>
        )}
        {rows.map((row) => {
          const { title, detail, image } = describe(row);
          return (
            <div key={row.id} className="flex items-center gap-4 py-4">
              {image ? (
                <img src={sized(image, 120)} alt="" className="h-12 w-16 rounded-sm object-cover" />
              ) : (
                <span className="h-12 w-16 shrink-0 rounded-sm bg-ink/5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold text-lg text-ink">{title}</p>
                {detail && (
                  <p className="truncate text-xs uppercase tracking-widest text-ink/50">{detail}</p>
                )}
              </div>
              <button
                onClick={() => setEditing(row)}
                aria-label="Edit"
                className="text-ink/50 hover:text-ink"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => remove(row)}
                aria-label="Delete"
                className="text-ink/40 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {editing && (
        <RecordEditor
          heading={heading}
          draft={editing}
          fields={fields}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setRows((list) => {
              const i = list.findIndex((r) => r.id && r.id === saved.id);
              if (i === -1) return [...list, saved];
              const next = [...list];
              next[i] = saved;
              return next;
            });
            setEditing(null);
          }}
          onSave={onSave}
        />
      )}
    </section>
  );
}

function RecordEditor<T extends { id?: string }>({
  heading,
  draft,
  fields,
  onClose,
  onSaved,
  onSave,
}: {
  heading: string;
  draft: T;
  fields: FieldSpec<T>[];
  onClose: () => void;
  onSaved: (row: T) => void;
  onSave: (row: T) => Promise<void>;
}) {
  const [form, setForm] = useState<T>(draft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const value = (key: string) => (form as Record<string, unknown>)[key];

  async function upload(key: string, file: File) {
    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      data.set("file", file);
      const { imagePath } = await uploadArtworkImage({ data });
      set(key, imagePath);
    } catch {
      setError("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(form);
      onSaved(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none";

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
            {draft.id ? `Edit — ${heading}` : `New — ${heading}`}
          </h2>
          <button type="button" onClick={onClose} className="text-ink/50 hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {fields.map((f) => {
            const type = f.type ?? "text";
            const wide = !f.half || type === "textarea" || type === "image";
            return (
              <label key={f.key} className={`block ${wide ? "md:col-span-2" : ""}`}>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
                  {f.label}
                  {f.required && <span className="text-gold"> *</span>}
                </span>
                {f.hint && <span className="mt-1 block text-[11px] text-ink/45">{f.hint}</span>}

                {type === "textarea" && (
                  <textarea
                    rows={3}
                    required={f.required}
                    value={String(value(f.key) ?? "")}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={`${input} mt-1 resize-none`}
                  />
                )}

                {type === "select" && (
                  <select
                    value={String(value(f.key) ?? "")}
                    onChange={(e) => set(f.key, e.target.value)}
                    className={`${input} mt-1`}
                  >
                    {(f.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}

                {type === "checkbox" && (
                  <span className="mt-2 flex items-center gap-2 text-sm text-ink/70">
                    <input
                      type="checkbox"
                      checked={Boolean(value(f.key))}
                      onChange={(e) => set(f.key, e.target.checked)}
                      className="accent-[var(--color-gold)]"
                    />
                    {f.placeholder ?? "Yes"}
                  </span>
                )}

                {type === "number" && (
                  <input
                    type="number"
                    value={Number(value(f.key) ?? 0)}
                    onChange={(e) => set(f.key, Number(e.target.value))}
                    className={`${input} mt-1`}
                  />
                )}

                {type === "image" && (
                  <span className="mt-2 flex flex-wrap items-center gap-3">
                    {value(f.key) ? (
                      <img
                        src={sized(String(value(f.key)), 160)}
                        alt=""
                        className="h-16 w-24 rounded-sm object-cover"
                      />
                    ) : null}
                    <input
                      ref={(el) => {
                        fileRefs.current[f.key] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) upload(f.key, file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[f.key]?.click()}
                      className="inline-flex items-center gap-2 rounded-sm border border-ink/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-ink/70 hover:text-ink"
                    >
                      {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      {value(f.key) ? "Replace photo" : "Upload photo"}
                    </button>
                    {value(f.key) ? (
                      <button
                        type="button"
                        onClick={() => set(f.key, null)}
                        className="text-xs text-ink/50 hover:text-red-500"
                      >
                        Remove
                      </button>
                    ) : null}
                  </span>
                )}

                {type === "text" && (
                  <input
                    required={f.required}
                    value={String(value(f.key) ?? "")}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={`${input} mt-1`}
                  />
                )}
              </label>
            );
          })}
        </div>

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

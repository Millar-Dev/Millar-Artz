import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { categories, disciplines } from "@/lib/gallery-data";

const contactSearchSchema = z.object({
  type: z.string().optional(),
});

export const Route = createFileRoute("/contact")({
  validateSearch: contactSearchSchema,
  head: () => ({
    meta: [
      { title: "Contact — Miller Artz" },
      {
        name: "description",
        content:
          "Request a commission or get in touch with Miller Artz. Phone, WhatsApp and email — a quotation follows within days.",
      },
      { property: "og:title", content: "Contact Miller Artz" },
      { property: "og:description", content: "Reach the Miller Artz studio for commissions and inquiries." },
    ],
  }),
  component: Contact,
});

const WHATSAPP_NUMBER = "255616110100";

const styleOptions = [
  ...categories.filter((c) => c.value !== "all").map((c) => c.label),
  ...disciplines.map((d) => d.label),
  "Not sure yet",
];

const budgetOptions = ["Under $150", "$150 – $400", "$400 – $1,000", "$1,000+", "Let's discuss"];
const timelineOptions = ["Flexible", "Within a month", "Within 2 weeks", "Specific deadline"];

function Contact() {
  const search = Route.useSearch();
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    style: search.type ?? "",
    subject: search.type ? `Commission inquiry — ${search.type}` : "",
    budget: "",
    timeline: "",
    message: "",
  });

  useEffect(() => {
    if (!search.type) return;
    setForm((f) => ({
      ...f,
      style: search.type ?? f.style,
      subject: f.subject || `Commission inquiry — ${search.type}`,
    }));
  }, [search.type]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function composeDetails() {
    return [
      form.style && `Style: ${form.style}`,
      form.budget && `Budget: ${form.budget}`,
      form.timeline && `Timeline: ${form.timeline}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const details = composeDetails();
    const body = `From: ${form.fullName} (${form.email}${form.phone ? `, ${form.phone}` : ""})\n${
      details ? `\n${details}\n` : ""
    }\n${form.message}`;
    const mailto = `mailto:studio@millerartz.com?subject=${encodeURIComponent(
      form.subject || "Commission inquiry",
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setStatus("sent");
    setTimeout(() => setStatus("idle"), 8000);
  }

  function openWhatsApp() {
    const details = composeDetails();
    const text = encodeURIComponent(
      `Hello Miller Artz,\n\nMy name is ${form.fullName || "..."} and I'd like to inquire about: ${
        form.subject || "an artwork"
      }.\n${details ? `\n${details}\n` : ""}\n${form.message}`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener");
  }

  return (
    <Layout>
      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Contact</span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] text-ink md:text-7xl">
            Let's <span className="italic">talk</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-ink/70">
            Whether it's a commission, a question about a piece, or an idea for a discipline that
            isn't in the gallery yet — share the details below and a quotation follows within days.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-12">
          {/* Info column */}
          <aside className="md:col-span-4">
            <h2 className="font-display text-2xl italic text-ink">Studio</h2>
            <div className="mt-8 space-y-6 text-sm text-ink/70">
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink">Phone</p>
                  <a href="tel:+255616110100" className="mt-1 block hover:text-gold">+255 616 110 100</a>
                  <a href="tel:+255754300543" className="mt-1 block hover:text-gold">+255 754 300 543</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink">Email</p>
                  <a href="mailto:studio@millerartz.com" className="mt-1 block hover:text-gold">
                    studio@millerartz.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink">Location</p>
                  <p className="mt-1">Tanzania — visits by appointment.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-sm bg-ink px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-canvas hover:bg-gold"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="rounded-sm border border-ink/10 p-3 text-ink hover:text-gold">
                <Instagram size={16} />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="rounded-sm border border-ink/10 p-3 text-ink hover:text-gold">
                <Facebook size={16} />
              </a>
            </div>

            <div className="mt-10 border border-dashed border-ink/15 bg-paper p-5 text-xs text-ink/50">
              <p className="font-display text-sm italic text-ink">Map preview</p>
              <p className="mt-2">
                Studio location map integration reserved for a future update.
              </p>
            </div>
          </aside>

          {/* Form column */}
          <div className="md:col-span-8">
            <form onSubmit={onSubmit} className="space-y-6 border border-ink/10 bg-paper p-8 md:p-12">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Full Name" required>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    maxLength={100}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={255}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    maxLength={30}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </Field>
                <Field label="Style / Discipline">
                  <select
                    value={form.style}
                    onChange={(e) => update("style", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="">Select one...</option>
                    {styleOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Budget range">
                  <select
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="">Select one...</option>
                    {budgetOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Timeline">
                  <select
                    value={form.timeline}
                    onChange={(e) => update("timeline", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="">Select one...</option>
                    {timelineOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Subject" required>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    maxLength={140}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </Field>
              </div>
              <Field label="Message" required>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  maxLength={2000}
                  placeholder="Describe the piece you're imagining, or attach reference photos when you follow up by email or WhatsApp."
                  className="w-full resize-none border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                />
              </Field>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="rounded-sm bg-ink px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-canvas hover:bg-gold"
                >
                  Send message
                </button>
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="rounded-sm border border-ink/20 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink hover:bg-ink/5"
                >
                  Send via WhatsApp
                </button>
                {status === "sent" && (
                  <p className="text-sm italic text-gold">
                    Opening your email app with the message ready to send...
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
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
      <div className="mt-2">{children}</div>
    </label>
  );
}

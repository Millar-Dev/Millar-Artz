import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { categories, disciplines } from "@/lib/gallery-data";
import { submitInquiry } from "@/lib/data/inquiries";
import { getSiteSettings } from "@/lib/data/site-settings";
import { canonical, seoMeta } from "@/lib/seo";
import { savedProfiles } from "@/lib/social";
import { SocialIcon } from "@/components/site/SocialIcon";
import { StudioMap } from "@/components/site/StudioMap";
import { ReviewLink } from "@/components/site/ReviewLink";
import { CurrencySelect, RateNote, useCurrency } from "@/components/site/CurrencyProvider";
import { translator, useT } from "@/lib/i18n";

const contactSearchSchema = z.object({
  type: z.string().optional(),
  /** A painting's title, when arriving from its page. */
  piece: z.string().max(160).optional(),
});

export const Route = createFileRoute("/contact")({
  validateSearch: contactSearchSchema,
  head: ({ match }) => {
    const { lang } = match.context;
    const t = translator(lang);
    return {
      meta: seoMeta(
        t("Commission Art from Arusha, Tanzania — MillerArtz"),
        t("Commission a painting, portrait or mural from Arusha-based artist Miller S.K. by WhatsApp, phone or email. Delivery across Tanzania and worldwide."),
        "/contact",
        undefined,
        lang,
      ),
      links: [canonical("/contact", lang)],
    };
  },
  loader: () => getSiteSettings(),
  component: Contact,
});

const styleOptions = [
  ...categories.filter((c) => c.value !== "all").map((c) => c.label),
  ...disciplines.map((d) => d.label),
  "Not sure yet",
];

const timelineOptions = [
  "Flexible",
  "Within a month",
  "Within 2 weeks",
  "Specific deadline",
];

function Contact() {
  const t = useT();
  const search = Route.useSearch();
  const settings = Route.useLoaderData();
  // Budget bands are set in shillings in the Studio and shown in whatever
  // currency the visitor has chosen; the stored value is always the shilling
  // range, so the studio reads every enquiry in the same currency.
  const { budgets, currency } = useCurrency();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    style: search.type ?? "",
    subject: search.piece
      ? t("Enquiry about “{piece}”", { piece: search.piece })
      : search.type
        ? t("Commission inquiry — {type}", { type: t(search.type) })
        : "",
    budget: "",
    timeline: "",
    message: "",
  });

  useEffect(() => {
    if (!search.type) return;
    setForm((f) => ({
      ...f,
      style: search.type ?? f.style,
      subject:
        f.subject ||
        (search.piece
          ? t("Enquiry about “{piece}”", { piece: search.piece })
          : t("Commission inquiry — {type}", { type: t(search.type ?? "") })),
    }));
  }, [search.type]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /** The shilling range, plus the currency the client was thinking in. */
  function budgetText() {
    if (!form.budget) return "";
    return currency !== "TZS" && form.budget !== "Let's discuss"
      ? `${form.budget} (client viewing prices in ${currency})`
      : form.budget;
  }

  /** Written in the visitor's language: it goes out from their own email or
   *  WhatsApp. What's saved to the Studio stays in English. */
  function composeDetails() {
    const budget = budgetText();
    return [
      form.style && `${t("Style")}: ${t(form.style)}`,
      budget && `${t("Budget")}: ${budget}`,
      form.timeline && `${t("Timeline")}: ${t(form.timeline)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");

    // Save to the studio inbox first so there's a record even if the visitor
    // never completes the email handoff (or has no mail client configured,
    // which is common on phones).
    let saved = false;
    try {
      await submitInquiry({ data: { ...form, budget: budgetText() } });
      saved = true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("Couldn't reach the studio inbox — please use WhatsApp instead."),
      );
    }

    const details = composeDetails();
    const body = `From: ${form.fullName} (${form.email}${form.phone ? `, ${form.phone}` : ""})\n${
      details ? `\n${details}\n` : ""
    }\n${form.message}`;
    const mailto = `mailto:${settings.email}?subject=${encodeURIComponent(
      form.subject || t("Commission inquiry"),
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    setStatus(saved ? "sent" : "idle");
    if (saved) setTimeout(() => setStatus("idle"), 10000);
  }

  function openWhatsApp() {
    const details = composeDetails();
    const text = encodeURIComponent(
      `${t("Hello MillerArtz,\n\nMy name is {name} and I'd like to inquire about: {subject}.", {
        name: form.fullName || "...",
        subject: form.subject || t("an artwork"),
      })}\n${details ? `\n${details}\n` : ""}\n${form.message}`,
    );
    window.open(
      `https://wa.me/${settings.whatsapp_number}?text=${text}`,
      "_blank",
      "noopener",
    );
  }

  return (
    <Layout>
      <section className="grain relative pt-16 pb-10">
        <div className="glow-teal pointer-events-none absolute -right-40 top-0 h-[420px] w-[420px] rounded-full opacity-[0.12] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            {t("Contact")}
          </span>
          <h1 className="mt-6 max-w-3xl font-display font-bold text-5xl leading-[1.05] text-ink md:text-7xl">
            {t("Let's talk.")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-ink/70">
            {t("Whether it's a commission, a question about a piece, or an idea for a discipline that isn't in the gallery yet — share the details below and a quotation follows within days.")}
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-12">
          {/* Info column */}
          <aside className="md:col-span-4">
            <h2 className="font-display font-bold text-2xl text-ink">{t("Studio")}</h2>
            <div className="mt-8 space-y-6 text-sm text-ink/70">
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink">
                    {t("Phone")}
                  </p>
                  {settings.phone_primary && (
                    <a
                      href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
                      className="mt-1 block hover:text-gold"
                    >
                      {settings.phone_primary}
                    </a>
                  )}
                  {settings.phone_secondary && (
                    <a
                      href={`tel:${settings.phone_secondary.replace(/\s/g, "")}`}
                      className="mt-1 block hover:text-gold"
                    >
                      {settings.phone_secondary}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink">
                    {t("Email")}
                  </p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="mt-1 block hover:text-gold"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ink">
                    {t("Location")}
                  </p>
                  <p className="mt-1">{settings.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
              {/* Social icons only render once a real profile URL is saved in
                  the Studio — better no icon than one linking to instagram.com. */}
              {savedProfiles(settings).map((p) => (
                <a
                  key={p.key}
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={p.label}
                  className="rounded-sm border border-ink/10 p-3 text-ink hover:text-gold"
                >
                  <SocialIcon platform={p.key} size={16} />
                </a>
              ))}
            </div>

            <StudioMap settings={settings} className="mt-10" />
            <ReviewLink settings={settings} className="mt-6" />
          </aside>

          {/* Form column */}
          <div className="md:col-span-8">
            <form
              onSubmit={onSubmit}
              className="space-y-6 border border-ink/10 bg-paper p-8 md:p-12"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field label={t("Full Name")} required>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    maxLength={100}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </Field>
                <Field label={t("Email")} required>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={255}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </Field>
                <Field label={t("Phone Number")}>
                  <input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    maxLength={30}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </Field>
                <Field label={t("Style / Discipline")}>
                  <select
                    value={form.style}
                    onChange={(e) => update("style", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="">{t("Select one...")}</option>
                    {styleOptions.map((s) => (
                      <option key={s} value={s}>
                        {t(s)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("Budget range")}>
                  <select
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="">{t("Select one...")}</option>
                    {budgets().map((b) => (
                      <option key={b.value} value={b.value}>
                        {budgetLabel(b.label, t)}
                      </option>
                    ))}
                  </select>
                  <CurrencySelect className="mt-3" />
                  <RateNote className="mt-2 text-ink/50" />
                </Field>
                <Field label={t("Timeline")}>
                  <select
                    value={form.timeline}
                    onChange={(e) => update("timeline", e.target.value)}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="">{t("Select one...")}</option>
                    {timelineOptions.map((option) => (
                      <option key={option} value={option}>
                        {t(option)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("Subject")} required>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => update("subject", e.target.value)}
                    maxLength={140}
                    className="w-full border-b border-ink/20 bg-transparent py-2 text-ink focus:border-gold focus:outline-none"
                  />
                </Field>
              </div>
              <Field label={t("Message")} required>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  maxLength={2000}
                  placeholder={t("Describe the piece you're imagining, or attach reference photos when you follow up by email or WhatsApp.")}
                  className="w-full resize-none border-b border-ink/20 bg-transparent py-2 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                />
              </Field>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft disabled:opacity-60"
                >
                  {status === "sending" && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {t("Send message")}
                </button>
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="rounded-sm border border-ink/20 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-ink hover:border-gold hover:text-gold"
                >
                  {t("Send via WhatsApp")}
                </button>
                {status === "sent" && (
                  <p className="text-sm text-gold">
                    {t("Received — your message is with the studio. Your email app should also be opening with a copy.")}
                  </p>
                )}
                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}

/** Budget options arrive as "Under …" / "Over …" — only those words change. */
function budgetLabel(label: string, t: (s: string) => string) {
  return label
    .replace(/\bUnder\b/g, t("Under"))
    .replace(/\bOver\b/g, t("Over"))
    .replace("Let's discuss", t("Let's discuss"));
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

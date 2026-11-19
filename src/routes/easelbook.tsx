import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Apple,
  ArrowDown,
  Check,
  ChevronDown,
  Download,
  Globe,
  Laptop,
  Monitor,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import {
  absoluteUrl,
  canonical,
  faqGraph,
  jsonLd,
  seoMeta,
  SITE_URL,
} from "@/lib/seo";
import { langOf, translator, useT } from "@/lib/i18n";

/**
 * Easelbook — the studio and business app for artists, made by MillerArtz.
 *
 * The page wears the app's own colours (ink and gold) rather than the
 * gallery's, so it reads as the app's home on the studio site.
 *
 * Downloads: until the app is in the stores, every platform gets its build
 * from the public releases repository. When a store listing goes live, fill
 * in STORES below — the Android and iPhone cards then send people to the
 * store instead, and nothing else on the page needs changing.
 */
const STORES: { play: string | null; appStore: string | null } = {
  // play: "https://play.google.com/store/apps/details?id=com.artflow.business",
  play: null,
  appStore: null,
};

const RELEASES =
  "https://github.com/Millar-Dev/Easelbook-releases/releases/download";
const FILES = {
  android: `${RELEASES}/android-app/Easelbook.apk`,
  windows: `${RELEASES}/desktop/Easelbook-Setup.exe`,
  mac: `${RELEASES}/desktop/Easelbook-mac.dmg`,
};
const WEB_APP = "https://www.easelbookapp.com";
const A = "/easelbook";

type Device = "android" | "ios" | "windows" | "mac" | "other";

function detectDevice(): Device {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const iPadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || iPadOs) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "mac";
  return "other";
}

export const Route = createFileRoute("/easelbook")({
  head: ({ matches }) => {
    const lang = langOf(matches);
    const t = translator(lang);
    const title = t("Easelbook — the studio app for artists | MillerArtz");
    const description = t(
      "Price commissions, track payments, and build your art portfolio. Download Easelbook free for Android, iPhone, Windows, Mac or any browser.",
    );
    return {
      meta: [
        {
          name: "keywords",
          content: t(
            "Easelbook, MillerArtz app, artist app, art business app, commission pricing, mural pricing calculator, invoices for artists, art portfolio, Tanzania artists, Arusha, download Easelbook",
          ),
        },
        ...seoMeta(
          title,
          description,
          "/easelbook",
          {
            url: absoluteUrl(`${A}/walkthrough-poster.jpg`),
            alt: "Easelbook",
            width: 1280,
            height: 720,
          },
          lang,
        ),
      ],
      links: [canonical("/easelbook", lang)],
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Easelbook",
          url: `${SITE_URL}/easelbook`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Android, iOS, Windows, macOS, Web",
          description,
          publisher: { "@id": `${SITE_URL}/#studio` },
          offers: [
            {
              "@type": "Offer",
              name: "Free",
              price: "0",
              priceCurrency: "TZS",
            },
            {
              "@type": "Offer",
              name: "Pro (monthly)",
              price: "20000",
              priceCurrency: "TZS",
            },
            {
              "@type": "Offer",
              name: "Pro (yearly)",
              price: "200000",
              priceCurrency: "TZS",
            },
          ],
        }),
        jsonLd({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: t("How to use Easelbook"),
          description: t(
            "Open the app, sign up, upgrade to Pro, price a job, invoice, record payments and use the Community.",
          ),
          thumbnailUrl: absoluteUrl(`${A}/walkthrough-poster.jpg`),
          contentUrl: absoluteUrl(`${A}/easelbook-walkthrough.mp4`),
          uploadDate: "2026-11-19",
          duration: "PT1M8S",
        }),
        jsonLd(faqGraph(faqs.map((f) => ({ q: t(f.q), a: t(f.a) })))),
      ],
    };
  },
  component: EaselbookPage,
});

const features = [
  {
    img: "price-a-job",
    title: "Price any job",
    body: "Paintings by size and hours, murals by walls, days, team rates and materials. See your cost, margin and the price to quote.",
  },
  {
    img: "invoice",
    title: "Quotes and invoices",
    body: "Turn a saved quote into an invoice with instalments. Share it as a PDF, on WhatsApp or by email.",
  },
  {
    img: "record-payment",
    title: "Track every payment",
    body: "Record deposits as they come in. Easelbook shows what is still due and keeps withholding tax separate from cash.",
  },
  {
    img: "mural-jobs",
    title: "Know your numbers",
    body: "Revenue, cash collected, artist pay and profit for every job — on a card that fits your phone.",
  },
  {
    img: "community",
    title: "Artist community",
    body: "Share progress, ask other artists for feedback, and find questions that still need an answer.",
  },
  {
    img: "customers",
    title: "Clients and portfolio",
    body: "Keep every client in one place and build a public portfolio page you can send to anyone.",
  },
];

const steps = [
  {
    img: "sign-in",
    title: "Open Easelbook",
    body: "Install it from the download section below, then tap the Easelbook icon. On a computer you can also open it in your browser.",
  },
  {
    img: "sign-up",
    title: "Create your studio",
    body: "Tap Sign up, enter your name, email and a password, then type the confirmation code sent to your email.",
  },
  {
    img: "dashboard",
    title: "Find your way around",
    body: "The bottom bar takes you Home, to today's Spark prompt, Projects and Invoices. The gold + button adds anything new.",
  },
  {
    img: "price-a-job",
    title: "Price a job",
    body: "Tap Price a Piece. Choose Artwork or Mural, fill in the job, and save the price as a quote for your client.",
  },
  {
    img: "invoice",
    title: "Invoice the client",
    body: "Open the quote and convert it to an invoice. Set the deposit and instalments, then share it.",
  },
  {
    img: "record-payment",
    title: "Record payments",
    body: "When money arrives, tap Record payment. The balance updates everywhere, and the invoice is marked paid when it is settled.",
  },
  {
    img: "community",
    title: "Join the Community",
    body: "Tap Ask for feedback to post a question with a photo, or share progress and finished work.",
  },
];

const proSteps = [
  "Open the menu and tap Pro.",
  "Choose Monthly (TZS 20,000) or Yearly (TZS 200,000 — two months free).",
  "Pay to Equity Lipa Namba 80025069 (MILLER S. K.) from M-Pesa, Mixx by Yas, Airtel Money, HaloPesa or your bank app.",
  "Type the transaction reference from your payment SMS and tap I've paid. Pro turns on once the payment is checked — usually within a few hours.",
];

const plans = [
  {
    name: "Free",
    price: "TZS 0",
    note: "For every artist",
    items: [
      "Pricing calculator for paintings and murals",
      "Clients, income and expenses",
      "Up to 10 projects",
      "Up to 10 community posts and comments",
    ],
  },
  {
    name: "Pro",
    price: "TZS 20,000",
    note: "per month · or TZS 200,000 per year",
    items: [
      "Everything in Free",
      "Invoices and mural quotes",
      "Email invoices and reminders",
      "Public portfolio page",
      "Unlimited projects",
      "Unlimited community",
    ],
  },
];

const faqs = [
  {
    q: "Is Easelbook free?",
    a: "Yes. The free plan covers pricing, clients, income and expenses, up to 10 projects and up to 10 community posts and comments. Pro adds invoices, mural quotes, email, a portfolio page and unlimited projects and community.",
  },
  {
    q: "Does it work without internet?",
    a: "You can open the app and look at your work offline, and new entries are saved and sent when you are back online. Recording payments, confirming costs and sending email need a connection.",
  },
  {
    q: "When will it be on Google Play and the App Store?",
    a: "Easelbook is on its way to Google Play. Until then, Android users can install it directly from this page, and iPhone users can add it to their home screen from Safari. This page will link to the stores as soon as they are live.",
  },
  {
    q: "Is it safe to install the Android file?",
    a: "The file comes straight from MillerArtz's public release page. Android asks you to allow installs from your browser the first time — that is normal for apps installed outside the Play Store.",
  },
  {
    q: "Is it in Kiswahili?",
    a: "Yes. Easelbook works in English and Kiswahili, and prices are in Tanzanian shillings by default.",
  },
  {
    q: "Can I use my account on more than one device?",
    a: "Yes. Sign in with the same email on your phone, tablet and computer — your studio is the same everywhere.",
  },
  {
    q: "How do I delete my account?",
    a: "In the app, go to Profile → Account → Delete my account. Your data and uploaded files are removed.",
  },
];

/* ── Small pieces ────────────────────────────────────────────────────────── */

function Phone({
  img,
  alt,
  className = "",
}: {
  img: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.2rem] bg-black p-2 shadow-[0_30px_80px_rgba(0,0,0,.55)] ring-1 ring-white/10 ${className}`}
    >
      <img
        src={`${A}/${img}.webp`}
        alt={alt}
        width={585}
        height={1266}
        loading="lazy"
        className="block w-full rounded-[1.8rem]"
      />
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d9b05e]">
      {children}
    </span>
  );
}

type Option = {
  id: Device | "web";
  icon: ReactNode;
  name: string;
  detail: string;
  href: string;
  cta: string;
  download?: boolean;
  steps: string[];
};

function useOptions(): Option[] {
  const t = useT();
  return [
    STORES.play
      ? {
          id: "android",
          icon: <Smartphone className="h-6 w-6" />,
          name: t("Android"),
          detail: t("Google Play"),
          href: STORES.play,
          cta: t("Get it on Google Play"),
          steps: [t("Tap Get it on Google Play, then Install.")],
        }
      : {
          id: "android",
          icon: <Smartphone className="h-6 w-6" />,
          name: t("Android"),
          detail: t("Phones and tablets · Android 7 or newer"),
          href: FILES.android,
          cta: t("Download for Android"),
          download: true,
          steps: [
            t("Tap Download for Android."),
            t(
              "Open Easelbook.apk when it finishes — from your notifications or the Files app.",
            ),
            t(
              "If Android asks, allow installs from your browser, then tap Install.",
            ),
            t("Open Easelbook and sign up."),
          ],
        },
    STORES.appStore
      ? {
          id: "ios",
          icon: <Apple className="h-6 w-6" />,
          name: t("iPhone and iPad"),
          detail: t("App Store"),
          href: STORES.appStore,
          cta: t("Download on the App Store"),
          steps: [t("Tap Download on the App Store, then Get.")],
        }
      : {
          id: "ios",
          icon: <Apple className="h-6 w-6" />,
          name: t("iPhone and iPad"),
          detail: t("Installs from Safari — no App Store needed"),
          href: `${WEB_APP}/signup`,
          cta: t("Open in Safari"),
          steps: [
            t("Open this page in Safari and tap Open in Safari."),
            t("Tap the Share button, then Add to Home Screen."),
            t("Tap Add. Easelbook appears on your home screen like any app."),
          ],
        },
    {
      id: "windows",
      icon: <Monitor className="h-6 w-6" />,
      name: t("Windows"),
      detail: t("Windows 10 and 11"),
      href: FILES.windows,
      cta: t("Download for Windows"),
      download: true,
      steps: [
        t("Download and open Easelbook-Setup.exe."),
        t(
          "If Windows shows “Windows protected your PC”, tap More info → Run anyway.",
        ),
        t("Easelbook installs and opens. Sign in or sign up."),
      ],
    },
    {
      id: "mac",
      icon: <Laptop className="h-6 w-6" />,
      name: t("Mac"),
      detail: t("macOS 11 or newer"),
      href: FILES.mac,
      cta: t("Download for Mac"),
      download: true,
      steps: [
        t("Download and open Easelbook-mac.dmg."),
        t("Drag Easelbook into Applications."),
        t("The first time, right-click Easelbook and choose Open."),
      ],
    },
    {
      id: "web",
      icon: <Globe className="h-6 w-6" />,
      name: t("Any browser"),
      detail: t("Chrome, Edge, Safari, Firefox — nothing to install"),
      href: `${WEB_APP}/signup`,
      cta: t("Open the web app"),
      steps: [
        t("Open the web app and sign up."),
        t(
          "In Chrome or Edge you can choose Install app from the menu to keep it on your desktop.",
        ),
      ],
    },
  ];
}

function OptionCard({ o, primary }: { o: Option; primary: boolean }) {
  const t = useT();
  const [open, setOpen] = useState(primary);
  useEffect(() => setOpen(primary), [primary]);
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        primary
          ? "border-[#d9b05e] bg-[#d9b05e]/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-[#d9b05e]">
          {o.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-white">
              {o.name}
            </h3>
            {primary && (
              <span className="rounded-full bg-[#d9b05e] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#16171f]">
                {t("Your device")}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-[#efe4d0]/60">{o.detail}</p>
        </div>
      </div>
      <a
        href={o.href}
        {...(o.download
          ? { download: "" }
          : { target: "_blank", rel: "noopener" })}
        className={`mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
          primary
            ? "bg-[#d9b05e] text-[#16171f] hover:bg-[#e6c27a]"
            : "bg-white/10 text-white hover:bg-white/15"
        }`}
      >
        <Download className="h-4 w-4" />
        {o.cta}
      </a>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#efe4d0]/60 hover:text-[#efe4d0]"
        aria-expanded={open}
      >
        {t("How to install")}
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ol className="mt-3 space-y-2 text-sm text-[#efe4d0]/80">
          {o.steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-bold text-[#d9b05e]">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg font-bold text-white"
      >
        {q}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#d9b05e] transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="-mt-1 pb-5 text-[#efe4d0]/75">{a}</p>}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

function EaselbookPage() {
  const t = useT();
  const options = useOptions();
  const [device, setDevice] = useState<Device>("other");
  useEffect(() => setDevice(detectDevice()), []);
  const mine =
    options.find((o) => o.id === device) ??
    options.find((o) => o.id === "web")!;
  const ordered = [mine, ...options.filter((o) => o !== mine)];

  return (
    <Layout>
      <div className="bg-[#0e0f15] text-[#efe4d0]">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-40 top-0 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(217,176,94,.22),transparent_65%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-14 md:grid-cols-[1.1fr_.9fr] md:pb-24 md:pt-20">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={`${A}/icon.svg`}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-2xl"
                />
                <Eyebrow>{t("A MillerArtz app")}</Eyebrow>
              </div>
              <h1 className="mt-7 font-display text-5xl font-bold leading-[1.02] text-white md:text-7xl">
                Easelbook
              </h1>
              <p className="mt-5 max-w-xl text-xl font-light text-[#efe4d0]/80 md:text-2xl">
                {t(
                  "Price commissions, track payments, and build your art portfolio.",
                )}
              </p>
              <p className="mt-4 max-w-xl text-[#efe4d0]/60">
                {t(
                  "The studio and business app made by an artist, for artists — in English and Kiswahili, priced in shillings, and free to start.",
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={mine.href}
                  {...(mine.download
                    ? { download: "" }
                    : { target: "_blank", rel: "noopener" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d9b05e] px-6 py-3.5 font-semibold text-[#16171f] transition hover:bg-[#e6c27a]"
                >
                  <Download className="h-5 w-5" />
                  {mine.cta}
                </a>
                <a
                  href="#download"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-white transition hover:bg-white/5"
                >
                  {t("Other devices")}
                  <ArrowDown className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-5 text-sm text-[#efe4d0]/50">
                {STORES.play
                  ? t("Available on Google Play.")
                  : t(
                      "Coming soon to Google Play and the App Store — install it directly in the meantime.",
                    )}
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-[300px] md:max-w-[340px]">
              <Phone
                img="dashboard"
                alt={t("Easelbook home screen")}
                className="relative z-10 rotate-[-3deg]"
              />
              <Phone
                img="price-a-job"
                alt={t("Pricing a mural in Easelbook")}
                className="absolute -right-24 top-16 hidden w-[78%] rotate-[6deg] opacity-80 lg:block"
              />
            </div>
          </div>
        </section>

        {/* Video */}
        <section
          className="border-y border-white/5 bg-[#13151d] py-16 md:py-24"
          id="video"
        >
          <div className="mx-auto max-w-5xl px-6 text-center">
            <Eyebrow>{t("Watch")}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold text-white md:text-5xl">
              {t("Easelbook in one minute")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#efe4d0]/70">
              {t(
                "How to open the app, sign up, upgrade to Pro, price a job, send an invoice, record payments and use the Community.",
              )}
            </p>
            <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_30px_90px_rgba(0,0,0,.5)]">
              <video
                controls
                playsInline
                preload="metadata"
                poster={`${A}/walkthrough-poster.jpg`}
                className="block aspect-video w-full bg-black"
              >
                <source
                  src={`${A}/easelbook-walkthrough.mp4`}
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>{t("What it does")}</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold text-white md:text-5xl">
              {t("Everything between the brush and the bank.")}
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <article
                  key={f.title}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="h-56 overflow-hidden bg-gradient-to-b from-[#1c1f2a] to-[#0e0f15] px-10 pt-6">
                    <img
                      src={`${A}/${f.img}.webp`}
                      alt={t(f.title)}
                      loading="lazy"
                      width={585}
                      height={1266}
                      className="w-full rounded-t-2xl shadow-2xl"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-white">
                      {t(f.title)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#efe4d0]/70">
                      {t(f.body)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-[#efe4d0]/60">
              <WifiOff className="h-4 w-4 text-[#d9b05e]" />
              {t(
                "Works offline for viewing and notes; payments and email need internet.",
              )}
            </p>
          </div>
        </section>

        {/* Download */}
        <section
          id="download"
          className="scroll-mt-24 border-y border-white/5 bg-[#13151d] py-16 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>{t("Download")}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold text-white md:text-5xl">
              {t("Get Easelbook on any device")}
            </h2>
            <p className="mt-4 max-w-2xl text-[#efe4d0]/70">
              {t(
                "One account works everywhere — sign in with the same email on your phone, tablet and computer.",
              )}
            </p>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ordered.map((o) => (
                <OptionCard key={o.id} o={o} primary={o === mine} />
              ))}
            </div>
          </div>
        </section>

        {/* How to use */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>{t("How to use it")}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold text-white md:text-5xl">
              {t("From first tap to first payment")}
            </h2>
            <ol className="mt-14 space-y-16 md:space-y-24">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}
                >
                  <div className="mx-auto w-full max-w-[250px]">
                    <Phone img={s.img} alt={t(s.title)} />
                  </div>
                  <div>
                    <span className="font-display text-6xl font-bold text-[#d9b05e]/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
                      {t(s.title)}
                    </h3>
                    <p className="mt-3 max-w-md text-lg text-[#efe4d0]/75">
                      {t(s.body)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Plans and upgrading */}
        <section
          className="border-y border-white/5 bg-[#13151d] py-16 md:py-24"
          id="pro"
        >
          <div className="mx-auto max-w-6xl px-6">
            <Eyebrow>{t("Plans")}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold text-white md:text-5xl">
              {t("Free to start. Pro when you're ready.")}
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-2xl border p-7 ${p.name === "Pro" ? "border-[#d9b05e] bg-[#d9b05e]/[0.07]" : "border-white/10 bg-white/[0.03]"}`}
                >
                  <h3 className="font-display text-2xl font-bold text-white">
                    {t(p.name)}
                  </h3>
                  <p className="mt-3 font-display text-4xl font-bold text-[#d9b05e]">
                    {p.price}
                  </p>
                  <p className="mt-1 text-sm text-[#efe4d0]/60">{t(p.note)}</p>
                  <ul className="mt-6 space-y-3">
                    {p.items.map((it) => (
                      <li key={it} className="flex gap-3 text-[#efe4d0]/85">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#d9b05e]" />
                        {t(it)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 grid items-center gap-10 md:grid-cols-[1fr_260px]">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {t("How to upgrade to Pro")}
                </h3>
                <ol className="mt-5 space-y-4">
                  {proSteps.map((s, i) => (
                    <li key={s} className="flex gap-4 text-[#efe4d0]/85">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d9b05e] font-bold text-[#16171f]">
                        {i + 1}
                      </span>
                      <span className="pt-1">{t(s)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="mx-auto w-full max-w-[240px]">
                <Phone img="pro-pay" alt={t("Paying for Easelbook Pro")} />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6">
            <Eyebrow>{t("Questions")}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-bold text-white md:text-5xl">
              {t("Good to know")}
            </h2>
            <div className="mt-8 border-t border-white/10">
              {faqs.map((f) => (
                <Faq key={f.q} q={t(f.q)} a={t(f.a)} />
              ))}
            </div>
          </div>
        </section>

        {/* Closing call */}
        <section className="pb-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-3xl bg-gradient-to-br from-[#1c1f2a] to-[#0e0f15] p-10 text-center ring-1 ring-white/10 md:p-14">
              <img
                src={`${A}/icon.svg`}
                alt=""
                width={72}
                height={72}
                className="mx-auto h-18 w-18 rounded-2xl"
              />
              <h2 className="mt-6 font-display text-3xl font-bold text-white md:text-4xl">
                {t("Run your studio like a business.")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[#efe4d0]/70">
                {t("Free for every artist. Install it in a minute.")}
              </p>
              <a
                href={mine.href}
                {...(mine.download
                  ? { download: "" }
                  : { target: "_blank", rel: "noopener" })}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#d9b05e] px-7 py-3.5 font-semibold text-[#16171f] transition hover:bg-[#e6c27a]"
              >
                <Download className="h-5 w-5" />
                {mine.cta}
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

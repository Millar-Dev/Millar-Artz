import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { subscribe } from "@/lib/data/subscribers";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription — Miller Artz" },
      {
        name: "description",
        content:
          "Join the Miller Artz Collector's Circle for early access to new collections, exclusive previews, and studio updates.",
      },
      { property: "og:title", content: "Miller Artz Subscription" },
      {
        property: "og:description",
        content:
          "Free and premium memberships for early access to Miller Artz collections and exclusive previews.",
      },
    ],
  }),
  component: Subscription,
});

const plans = [
  {
    name: "Free Membership",
    tag: "Complimentary",
    price: "Free",
    features: [
      "Monthly newsletter",
      "New artwork announcements",
      "Studio updates and stories",
      "Occasional promotional offers",
    ],
    cta: "Join for free",
    highlight: false,
  },
  {
    name: "Premium Membership",
    tag: "Collector's Circle",
    price: "By invitation",
    features: [
      "Early access to new collections",
      "Exclusive artwork previews",
      "Priority commission scheduling",
      "Private discount offers",
      "Custom artwork promotions",
    ],
    cta: "Request an invitation",
    highlight: true,
  },
];

function Subscription() {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<"free" | "premium">("free");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    try {
      await subscribe({ data: { email, tier } });
      setStatus("sent");
      setEmail("");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Layout>
      <section className="pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            The Collector's Circle
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-[1.05] text-ink md:text-7xl">
            Be the first to <span className="italic">see</span> what's next.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-ink/70">
            Subscribe to receive newsletters, artwork drops, and previews from
            Miller Artz. Two ways to follow the work — pick the one that suits
            you.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col p-10 transition-colors ${
                p.highlight
                  ? "bg-band text-band-foreground"
                  : "border border-ink/10 bg-paper text-ink"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                {p.tag}
              </span>
              <h2 className="mt-6 font-display text-3xl italic md:text-4xl">
                {p.name}
              </h2>
              <p
                className={`mt-4 font-display text-2xl italic ${
                  p.highlight ? "text-band-foreground/80" : "text-ink/60"
                }`}
              >
                {p.price}
              </p>
              <ul className="mt-8 space-y-3 text-sm font-light">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check size={16} className="mt-0.5 shrink-0 text-gold" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setTier(p.highlight ? "premium" : "free");
                  document
                    .getElementById("subscribe-form")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-10 rounded-sm bg-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section
        id="subscribe-form"
        className="border-t border-ink/5 bg-paper py-24"
      >
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center">
            <h2 className="font-display text-4xl italic text-ink md:text-5xl">
              Join the list
            </h2>
            <p className="mt-4 text-ink/60">
              We only send email when there's something worth showing.
              Unsubscribe any time.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-12 space-y-6">
            <div className="flex gap-2 rounded-sm border border-ink/10 bg-canvas p-2">
              {(["free", "premium"] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setTier(v)}
                  className={`flex-1 rounded-sm px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    tier === v
                      ? "bg-gold text-band"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {v === "free" ? "Free" : "Premium"}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
                Email
              </span>
              <input
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full border-b border-ink/20 bg-transparent py-3 text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gold px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft disabled:opacity-60"
            >
              {status === "sending" && <Loader2 size={14} className="animate-spin" />}
              {tier === "free" ? "Subscribe for free" : "Request an invitation"}
            </button>

            {error && <p className="text-center text-sm text-red-400">{error}</p>}

            {status === "sent" && (
              <p className="text-center text-sm italic text-gold">
                {tier === "free"
                  ? "You're on the list — thank you."
                  : "Thank you — we'll be in touch about the Collector's Circle."}
              </p>
            )}
          </form>
        </div>
      </section>
    </Layout>
  );
}

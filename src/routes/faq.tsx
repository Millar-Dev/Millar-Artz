import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { canonical, faqGraph, jsonLd, seoMeta } from "@/lib/seo";
import { translator, useT } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: ({ match }) => {
    const { lang } = match.context;
    const t = translator(lang);
    return {
      meta: seoMeta(
        t("FAQ — Commissioning Art from MillerArtz"),
        t("How commissions work at MillerArtz, the Arusha art studio of Miller S.K.: process, pricing, timelines, international delivery and payment."),
        "/faq",
        undefined,
        lang,
      ),
      links: [canonical("/faq", lang)],
      // FAQPage markup — these can surface as expandable answers in search,
      // in the language the page is in.
      scripts: [
        jsonLd(faqGraph(groups.flatMap((g) => g.items).map((i) => ({ q: t(i.q), a: t(i.a) })))),
      ],
    };
  },
  component: Faq,
});

const groups: { heading: string; items: { q: string; a: string; id?: string }[] }[] = [
  {
    heading: "Commissions",
    items: [
      {
        q: "How do I commission a piece?",
        a: "Send your reference photos or describe the idea through the Contact page, along with the style, rough size and any deadline. A quotation and timeline follow within a few days. Nothing is committed until you approve that quotation.",
      },
      {
        q: "What can be commissioned?",
        a: "Anything across the five disciplines — painting, music, dance, sculpture and acrobatics. Within painting that covers hyperrealistic portraits, wildlife, traditional and cultural pieces, abstract, illusional, modern, cartoons, and murals. If you have an idea that doesn't sit neatly in one of them, ask anyway.",
      },
      {
        q: "What makes a good reference photo?",
        a: "Good light and sharp focus matter far more than an expensive camera. For portraits, a photo taken in daylight, facing the light, at eye level gives the most to work from. Send several if you have them — the best reference isn't always the most flattering one.",
      },
      {
        q: "Can I see progress while it's being made?",
        a: "Yes. Progress photos are shared along the way for portraits and larger commissions, so there are no surprises at the end.",
      },
    ],
  },
  {
    heading: "Pricing & payment",
    items: [
      {
        q: "How much does a commission cost?",
        a: "It depends on size, medium and detail — a small graphite study and a full exterior mural are very different pieces of work. Share what you have in mind and you'll get a firm quotation rather than a guess.",
      },
      {
        q: "Why do some pieces say “Not for sale”?",
        a: "Some pieces were commissioned by a client, and some aren't offered for sale. If one speaks to you, ask about commissioning something similar.",
      },
      {
        q: "What currency are prices in?",
        a: "Pieces for sale are priced in US dollars. On the Gallery, painting and Contact pages you can show prices in Tanzanian shillings or about twenty other currencies — East African shillings and francs, euros and pounds, yuan, yen, won, rupees, dirhams, riyals and more. Those figures are converted at the studio's current rate and are a guide; the listed price, or your quotation for a commission, is what applies.",
      },
      {
        id: "payment",
        q: "How is payment handled?",
        a: "For a finished piece, tap “Buy this piece” to confirm on WhatsApp that it's still available, then pay by M-Pesa or other mobile money, Equity Bank Lipa Namba, or PayPal from abroad — the details are listed under every piece for sale. Commissions are normally split: a deposit to begin, the balance on completion before delivery. Payment details are arranged directly when you approve the quotation.",
      },
    ],
  },
  {
    heading: "Timelines & delivery",
    items: [
      {
        q: "How long does a piece take?",
        a: "Most commissioned portraits take a few weeks; larger paintings and murals take longer. Hyperrealism in particular is slow by nature — the detail is the work. You'll get a realistic timeline with your quotation, and rush requests are worth asking about.",
      },
      {
        id: "delivery",
        q: "Do you deliver outside Tanzania?",
        a: "Yes. Local pieces can be collected from the studio or delivered by arrangement. International shipping is quoted per piece, since size and framing change the cost considerably.",
      },
      {
        id: "packaging",
        q: "How is work packaged?",
        a: "Pieces are prepared for transit — framed, mounted or rolled depending on the medium and destination. Murals are painted on site, so delivery there means scheduling the work rather than shipping it.",
      },
    ],
  },
];

function Faq() {
  const t = useT();
  return (
    <Layout>
      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-3xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            {t("Questions")}
          </span>
          <h1 className="mt-6 font-display font-bold text-5xl leading-[1.05] text-ink md:text-6xl">
            {t("Before you commission.")}
          </h1>
          <p className="mt-6 text-lg font-light text-ink/70">
            {t("The things most people ask before ordering a piece. If your question isn't here, just ask — it's a short reply either way.")}
          </p>
        </div>
      </section>

      <section className="bg-gallery py-10 md:py-16">
        <div className="mx-auto max-w-3xl space-y-14 px-6">
          {groups.map((group) => (
            <div key={group.heading}>
              <h2 className="font-display font-bold text-2xl text-ink">
                {t(group.heading)}
              </h2>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {group.items.map((item) => (
                  <FaqItem key={item.q} id={item.id} question={t(item.q)} answer={t(item.a)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-band py-12 md:py-20 text-band-foreground">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl">
            {t("Still have a question?")}
          </h2>
          <p className="mt-4 text-band-foreground/70">
            {t("Ask directly — no obligation, and no pressure to commit to anything.")}
          </p>
          <Link
            to="/contact"
            search={{ type: "commission" }}
            className="mt-8 inline-block rounded-sm bg-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
          >
            {t("Get in touch")}
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function FaqItem({ question, answer, id }: { question: string; answer: string; id?: string }) {
  const [open, setOpen] = useState(false);
  // Arriving from a link like /faq#payment opens that answer.
  useEffect(() => {
    if (id && window.location.hash === `#${id}`) setOpen(true);
  }, [id]);
  return (
    <div id={id} className="scroll-mt-32">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-base font-medium text-ink">{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gold transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="animate-fade pb-5 text-sm leading-relaxed text-ink/70">
          {answer}
        </p>
      )}
    </div>
  );
}

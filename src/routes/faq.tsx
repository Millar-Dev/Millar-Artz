import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Miller Artz" },
      {
        name: "description",
        content:
          "Commission process, pricing, timelines, delivery and payment — common questions about ordering original artwork from Miller Artz.",
      },
      { property: "og:title", content: "FAQ — Miller Artz" },
      {
        property: "og:description",
        content:
          "How commissions work at Miller Artz: process, pricing, timelines, delivery and payment.",
      },
    ],
  }),
  component: Faq,
});

const groups: { heading: string; items: { q: string; a: string }[] }[] = [
  {
    heading: "Commissions",
    items: [
      {
        q: "How do I commission a piece?",
        a: "Send your reference photos or describe the idea through the Contact page, along with the style, rough size and any deadline. A quotation and timeline follow within a few days. Nothing is committed until you approve that quotation.",
      },
      {
        q: "What can be commissioned?",
        a: "Anything across the nine disciplines in the gallery — hyperrealistic portraits, wildlife, traditional and cultural pieces, abstract, illusional, modern, cartoons, and murals. If you have an idea that doesn't fit those, ask anyway; the studio is actively opening up new disciplines.",
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
        q: "Why do some pieces say “on request” instead of a price?",
        a: "Availability changes, and some pieces are held for exhibitions or existing collectors. If a piece interests you, ask — you'll get a straight answer on whether it's available and what it costs.",
      },
      {
        q: "How is payment handled?",
        a: "Commissions are normally split: a deposit to begin, the balance on completion before delivery. Payment details are arranged directly when you approve the quotation.",
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
        q: "Do you deliver outside Tanzania?",
        a: "Yes. Local pieces can be collected from the studio or delivered by arrangement. International shipping is quoted per piece, since size and framing change the cost considerably.",
      },
      {
        q: "How is work packaged?",
        a: "Pieces are prepared for transit — framed, mounted or rolled depending on the medium and destination. Murals are painted on site, so delivery there means scheduling the work rather than shipping it.",
      },
    ],
  },
];

function Faq() {
  return (
    <Layout>
      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-3xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Questions
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ink md:text-6xl">
            Before you <span className="italic">commission</span>.
          </h1>
          <p className="mt-6 text-lg font-light text-ink/70">
            The things most people ask before ordering a piece. If your question
            isn't here, just ask — it's a short reply either way.
          </p>
        </div>
      </section>

      <section className="bg-gallery py-16">
        <div className="mx-auto max-w-3xl space-y-14 px-6">
          {groups.map((group) => (
            <div key={group.heading}>
              <h2 className="font-display text-2xl italic text-ink">
                {group.heading}
              </h2>
              <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
                {group.items.map((item) => (
                  <FaqItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-band py-20 text-band-foreground">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-3xl italic md:text-4xl">
            Still have a question?
          </h2>
          <p className="mt-4 text-band-foreground/70">
            Ask directly — no obligation, and no pressure to commit to anything.
          </p>
          <Link
            to="/contact"
            search={{ type: "commission" }}
            className="mt-8 inline-block rounded-sm bg-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
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

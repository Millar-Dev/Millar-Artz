import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import artistPortrait from "@/assets/me-portrait.jpg";
import brushMark from "@/assets/brand/miller-artz-logo-sign.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Miller Artz" },
      {
        name: "description",
        content:
          "Miller Artz is a Tanzania-based artist working across hyperrealism, wildlife, portraiture, traditional and cultural commissions, murals, and more.",
      },
      { property: "og:title", content: "About Miller Artz" },
      {
        property: "og:description",
        content: "The story, mission and vision behind Miller Artz.",
      },
    ],
  }),
  component: About,
});

const values = [
  { title: "Craft", body: "Every piece is finished only when the work itself is ready to be seen." },
  { title: "Originality", body: "No template, no shortcut — each artwork answers only to its subject." },
  { title: "Range", body: "One studio, many disciplines — from graphite portraits to wall-sized murals." },
  { title: "Respect", body: "For our subjects, for our patrons, and for the communities we paint for." },
];

const disciplinesWorked = [
  "Hyperrealism",
  "Portraiture",
  "Wildlife",
  "Traditional & Cultural",
  "Abstract",
  "Illusional",
  "Mural",
  "Modern",
  "Cartoons & Character Illustration",
];

function About() {
  return (
    <Layout>
      <section className="pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">About</span>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] text-ink md:text-7xl">
            About <span className="italic">Miller Artz</span>
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-12">
          <div className="md:col-span-7 space-y-6 text-lg font-light leading-relaxed text-ink/75">
            <p>
              Miller Artz is a Tanzania-based studio built around one artist's hand: hyperrealistic
              graphite and charcoal work developed over hundreds of hours of observation, acrylic and
              oil wildlife painting rooted in East Africa, and commissioned portraits and cultural
              scenes for clients and community organisations.
            </p>
            <p>
              The studio's range has grown deliberately — from tightly-observed pencil portraits and
              wildlife studies, into traditional and cultural commissions, bold abstract and illusional
              work, large-scale mural painting, and playful cartoon and character illustration. Every
              new discipline is added the same way: by doing the work, not claiming the label first.
            </p>
            <p>
              We believe art has the power to communicate beyond words. Whether it's a family portrait,
              a wildlife piece for a collector, a mural for a public wall, or a community commission like
              the piece created for the Embuan Children &amp; Youth Foundation, the goal is the same:
              work that means something to the person who asked for it.
            </p>
            <p>
              Drawing and painting remain the foundation, but Miller Artz is designed with a wider
              horizon in mind — the studio is already opening conversations around music, dance and
              performance, digital art, and sculpture, for collectors and collaborators who want to build
              something new together.
            </p>
            <p className="font-display text-2xl italic text-ink">
              At Miller Artz, every masterpiece begins with imagination.
            </p>
          </div>
          <div className="md:col-span-5">
            <img
              src={artistPortrait}
              alt="Miller S.K., founding artist of Miller Artz"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                Miller S.K. — Founder, Miller Artz
              </p>
              <img src={brushMark} alt="" aria-hidden="true" className="h-8 w-auto opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section className="border-y border-ink/5 bg-paper py-16">
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Disciplines
          </span>
          <div className="mt-6 flex flex-wrap gap-3">
            {disciplinesWorked.map((d) => (
              <span
                key={d}
                className="rounded-full border border-ink/10 bg-canvas px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink/70"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-paper py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Mission</span>
            <h2 className="mt-6 font-display text-3xl italic text-ink md:text-4xl">
              To translate feeling into form.
            </h2>
            <p className="mt-6 text-ink/70">
              To create original, deeply-observed work across every discipline the studio takes on —
              preserving moments, honouring subjects, and giving collectors something worth living with
              for generations.
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Vision</span>
            <h2 className="mt-6 font-display text-3xl italic text-ink md:text-4xl">
              An African art house with a global voice.
            </h2>
            <p className="mt-6 text-ink/70">
              To grow Miller Artz into a multidisciplinary studio — expanding into new mediums,
              exhibitions, and communities while never letting go of the discipline of the hand.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Core Values</span>
          <h2 className="mt-6 font-display text-4xl italic text-ink md:text-5xl">
            What guides the work.
          </h2>
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div key={v.title} className="border-t border-ink/10 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                  0{i + 1}
                </p>
                <h3 className="mt-4 font-display text-2xl italic text-ink">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future / Awards */}
      <section className="bg-ink py-24 text-canvas">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Future Projects
            </span>
            <h2 className="mt-6 font-display text-4xl italic md:text-5xl">
              The years ahead.
            </h2>
            <ul className="mt-10 space-y-6 text-canvas/80">
              <li>
                <p className="font-display text-xl italic">Wildlife Series II</p>
                <p className="mt-1 text-sm font-light">
                  A follow-up painted series on the birds and great cats of East Africa.
                </p>
              </li>
              <li>
                <p className="font-display text-xl italic">The Portrait Archive</p>
                <p className="mt-1 text-sm font-light">
                  An open commission window for community portraiture across Tanzania.
                </p>
              </li>
              <li>
                <p className="font-display text-xl italic">Beyond the Canvas</p>
                <p className="mt-1 text-sm font-light">
                  First collaborations in music, dance and sculpture — early conversations welcome.
                </p>
              </li>
            </ul>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Community &amp; Commissions
            </span>
            <h2 className="mt-6 font-display text-4xl italic md:text-5xl">
              A quiet record, growing.
            </h2>
            <p className="mt-8 text-canvas/70">
              Recent work includes a commissioned piece for the Embuan Children &amp; Youth Foundation
              and a commissioned exterior mural. As exhibitions, features and honours accumulate,
              they'll be added here.
            </p>
            <div className="mt-10 border-t border-canvas/10 pt-6 text-sm text-canvas/60">
              <p className="italic">Featured spaces &amp; press listings — coming soon.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl italic text-ink md:text-4xl">
            Interested in a piece — or a commission?
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/gallery"
              className="rounded-sm bg-ink px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas hover:bg-gold"
            >
              Browse gallery
            </Link>
            <Link
              to="/contact"
              search={{ type: "commission" }}
              className="rounded-sm border border-ink/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink hover:bg-ink/5"
            >
              Start a commission
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

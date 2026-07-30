import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import artistPortrait from "@/assets/artist-portrait.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Miller Artz" },
      {
        name: "description",
        content:
          "Miller Artz is a creative art company dedicated to hyper-realism, wildlife, and portrait commissions. Learn our story, mission and values.",
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
  { title: "Presence", body: "We draw and paint slowly, so the viewer feels the time inside the work." },
  { title: "Respect", body: "For our subjects, for our patrons, and for the tradition we inherit." },
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
              Miller Artz is a creative art company dedicated to transforming ideas, emotions, and memories
              into timeless works of art. Founded by a passionate artist whose love for drawing and painting
              continues to inspire every masterpiece, Miller Artz celebrates creativity through artistic
              excellence.
            </p>
            <p>
              Our specialty lies in producing highly detailed drawings and paintings — including hyper-realism,
              wildlife artworks, portraits, and custom commissions designed specifically for our clients.
              Every artwork is carefully crafted to reflect originality, beauty, and professional quality.
            </p>
            <p>
              We believe that art has the power to communicate beyond words. Through our creative journey,
              we seek to inspire, preserve memories, and connect people through meaningful artistic
              experiences.
            </p>
            <p>
              Although our primary focus is currently drawing and painting, Miller Artz is designed with a
              vision for the future. As we grow, we aim to expand into additional artistic disciplines while
              maintaining our commitment to creativity, quality, and innovation.
            </p>
            <p className="font-display text-2xl italic text-ink">
              At Miller Artz, every masterpiece begins with imagination.
            </p>
          </div>
          <div className="md:col-span-5">
            <img
              src={artistPortrait}
              alt="Portrait of the founding artist of Miller Artz"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover shadow-2xl"
            />
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
              The Founder — Miller Artz Studio
            </p>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="border-y border-ink/5 bg-paper py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Mission</span>
            <h2 className="mt-6 font-display text-3xl italic text-ink md:text-4xl">
              To translate feeling into form.
            </h2>
            <p className="mt-6 text-ink/70">
              To create original, deeply-observed drawings and paintings that preserve moments, honor
              subjects, and give collectors something worth living with for generations.
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Vision</span>
            <h2 className="mt-6 font-display text-3xl italic text-ink md:text-4xl">
              An African art house with a global voice.
            </h2>
            <p className="mt-6 text-ink/70">
              To grow Miller Artz into a multidisciplinary studio — expanding into new mediums, exhibitions,
              and communities while never letting go of the discipline of the hand.
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
                  A twelve-piece painted series on the great cats of East Africa.
                </p>
              </li>
              <li>
                <p className="font-display text-xl italic">The Portrait Archive</p>
                <p className="mt-1 text-sm font-light">
                  An open commission window for community portraiture across Tanzania.
                </p>
              </li>
              <li>
                <p className="font-display text-xl italic">Digital Editions</p>
                <p className="mt-1 text-sm font-light">
                  Limited archival prints — thoughtfully released, never mass produced.
                </p>
              </li>
            </ul>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Awards & Recognition
            </span>
            <h2 className="mt-6 font-display text-4xl italic md:text-5xl">
              A quiet record.
            </h2>
            <p className="mt-8 text-canvas/70">
              We're building a body of work first. As exhibitions, features and honors accumulate, they'll be
              added here.
            </p>
            <div className="mt-10 border-t border-canvas/10 pt-6 text-sm text-canvas/60">
              <p className="italic">Featured spaces & press listings — coming soon.</p>
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

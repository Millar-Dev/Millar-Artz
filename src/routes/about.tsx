import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import fallbackPortrait from "@/assets/me-portrait.jpg";
import brushMark from "@/assets/brand/miller-artz-logo-sign.jpg";
import { getSiteImage } from "@/lib/data/site-images";
import { getSiteSettings } from "@/lib/data/site-settings";
import { MapPin, Clock, Palette, Mail } from "lucide-react";

export const Route = createFileRoute("/about")({
  loader: async () => {
    const [portrait, studio, settings] = await Promise.all([
      getSiteImage({ data: "about_portrait" }),
      getSiteImage({ data: "studio_photo" }),
      getSiteSettings(),
    ]);
    return {
      portrait: portrait ?? {
        id: "about_portrait",
        image_path: fallbackPortrait,
        caption: "Miller S.K. — Founder, Miller Artz",
      },
      // Null until a studio photo is uploaded — the section renders without
      // an image rather than showing a stock placeholder.
      studio,
      settings,
    };
  },
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
  {
    title: "Craft",
    body: "Every piece is finished only when the work itself is ready to be seen.",
  },
  {
    title: "Originality",
    body: "No template, no shortcut — each artwork answers only to its subject.",
  },
  {
    title: "Range",
    body: "One studio, many disciplines — from graphite portraits to wall-sized murals.",
  },
  {
    title: "Respect",
    body: "For our subjects, for our patrons, and for the communities we paint for.",
  },
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
  const { portrait, studio, settings } = Route.useLoaderData();

  return (
    <Layout>
      <section className="grain relative pt-16 pb-8">
        <div className="glow-coral pointer-events-none absolute -left-40 top-0 h-[420px] w-[420px] rounded-full opacity-[0.12] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            About
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] text-ink md:text-7xl">
            About <span className="italic">Miller Artz</span>
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-12">
          <div className="md:col-span-7 space-y-6 text-lg font-light leading-relaxed text-ink/75">
            <p>
              Miller Artz is a Tanzania-based studio built around one artist's
              hand: hyperrealistic graphite and charcoal work developed over
              hundreds of hours of observation, acrylic and oil wildlife
              painting rooted in East Africa, and commissioned portraits and
              cultural scenes for clients and community organisations.
            </p>
            <p>
              The studio's range has grown deliberately — from tightly-observed
              pencil portraits and wildlife studies, into traditional and
              cultural commissions, bold abstract and illusional work,
              large-scale mural painting, and playful cartoon and character
              illustration. Every new discipline is added the same way: by doing
              the work, not claiming the label first.
            </p>
            <p>
              We believe art has the power to communicate beyond words. Whether
              it's a family portrait, a wildlife piece for a collector, a mural
              for a public wall, or a community commission like the piece
              created for the Embuan Children &amp; Youth Foundation, the goal
              is the same: work that means something to the person who asked for
              it.
            </p>
            <p>
              Drawing and painting remain the foundation, but Miller Artz is
              designed with a wider horizon in mind — the studio is already
              opening conversations around music, dance and performance, digital
              art, and sculpture, for collectors and collaborators who want to
              build something new together.
            </p>
            <p className="font-display text-2xl italic text-ink">
              At Miller Artz, every masterpiece begins with imagination.
            </p>
          </div>
          <div className="md:col-span-5">
            <img
              src={portrait.image_path}
              alt="Miller S.K., founding artist of Miller Artz"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-sm object-cover shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">
                {portrait.caption}
              </p>
              <img
                src={brushMark}
                alt=""
                aria-hidden="true"
                className="h-8 w-auto rounded bg-[#f8f4ec] p-1 opacity-90"
              />
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

      {/* The studio itself — where the work actually gets made */}
      <section className="grain relative overflow-hidden py-24">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                The Studio
              </span>
              <h2 className="mt-5 font-display text-4xl italic text-ink md:text-5xl">
                Where the work happens.
              </h2>
              <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-ink/70">
                <p>
                  Every piece on this site is made by hand in one room in
                  Tanzania — no assistants, no print reproductions passed off as
                  originals. Graphite and charcoal work happens at the desk;
                  canvases go up on the easel; murals leave the studio entirely
                  and get painted on site.
                </p>
                <p>
                  It doubles as the meeting room. If you're commissioning
                  something substantial, you're welcome to come and see work in
                  progress, look at finished pieces in person, and talk through
                  sizes and framing properly — photographs flatten things, and
                  scale is hard to judge on a screen.
                </p>
              </div>

              <dl className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-ink">
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-ink/65">
                      {settings.location}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={17} className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-ink">
                      Visits
                    </dt>
                    <dd className="mt-1 text-sm text-ink/65">
                      By appointment — message ahead and we'll find a time.
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Palette size={17} className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-ink">
                      Made here
                    </dt>
                    <dd className="mt-1 text-sm text-ink/65">
                      Graphite, charcoal, acrylic and oil — plus mural work on
                      location.
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-gold" />
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-ink">
                      Arrange a visit
                    </dt>
                    <dd className="mt-1 text-sm text-ink/65">
                      <Link
                        to="/contact"
                        search={{ type: "Studio visit" }}
                        className="text-gold hover:underline"
                      >
                        Send a message →
                      </Link>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="min-w-0 lg:col-span-6">
              {studio ? (
                <figure>
                  <div className="gradient-stroke overflow-hidden rounded-lg p-px shadow-2xl">
                    <img
                      src={studio.image_path}
                      alt={studio.caption || "Inside the Miller Artz studio"}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                    />
                  </div>
                  {studio.caption && (
                    <figcaption className="mt-3 text-xs uppercase tracking-[0.15em] text-ink/50">
                      {studio.caption}
                    </figcaption>
                  )}
                </figure>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-ink/20 bg-paper/50 p-8 text-center">
                  <p className="max-w-xs text-sm text-ink/45">
                    A photograph of the studio goes here — upload one in the
                    Studio under “Studio photo”.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-paper py-24">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Mission
            </span>
            <h2 className="mt-6 font-display text-3xl italic text-ink md:text-4xl">
              To translate feeling into form.
            </h2>
            <p className="mt-6 text-ink/70">
              To create original, deeply-observed work across every discipline
              the studio takes on — preserving moments, honouring subjects, and
              giving collectors something worth living with for generations.
            </p>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Vision
            </span>
            <h2 className="mt-6 font-display text-3xl italic text-ink md:text-4xl">
              An African art house with a global voice.
            </h2>
            <p className="mt-6 text-ink/70">
              To grow Miller Artz into a multidisciplinary studio — expanding
              into new mediums, exhibitions, and communities while never letting
              go of the discipline of the hand.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            Core Values
          </span>
          <h2 className="mt-6 font-display text-4xl italic text-ink md:text-5xl">
            What guides the work.
          </h2>
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div key={v.title} className="border-t border-ink/10 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                  0{i + 1}
                </p>
                <h3 className="mt-4 font-display text-2xl italic text-ink">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future / Awards */}
      <section className="grain relative bg-band py-24 text-band-foreground">
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              Future Projects
            </span>
            <h2 className="mt-6 font-display text-4xl italic md:text-5xl">
              The years ahead.
            </h2>
            <ul className="mt-10 space-y-6 text-band-foreground/80">
              <li>
                <p className="font-display text-xl italic">
                  Wildlife Series II
                </p>
                <p className="mt-1 text-sm font-light">
                  A follow-up painted series on the birds and great cats of East
                  Africa.
                </p>
              </li>
              <li>
                <p className="font-display text-xl italic">
                  The Portrait Archive
                </p>
                <p className="mt-1 text-sm font-light">
                  An open commission window for community portraiture across
                  Tanzania.
                </p>
              </li>
              <li>
                <p className="font-display text-xl italic">Beyond the Canvas</p>
                <p className="mt-1 text-sm font-light">
                  First collaborations in music, dance and sculpture — early
                  conversations welcome.
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
            <p className="mt-8 text-band-foreground/70">
              Recent work includes a commissioned piece for the Embuan Children
              &amp; Youth Foundation and a commissioned exterior mural. As
              exhibitions, features and honours accumulate, they'll be added
              here.
            </p>
            <div className="mt-10 border-t border-band-foreground/10 pt-6 text-sm text-band-foreground/60">
              <p className="italic">
                Featured spaces &amp; press listings — coming soon.
              </p>
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
              className="rounded-sm bg-gold px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
            >
              Browse gallery
            </Link>
            <Link
              to="/contact"
              search={{ type: "commission" }}
              className="rounded-sm border border-ink/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink hover:border-gold hover:text-gold"
            >
              Start a commission
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

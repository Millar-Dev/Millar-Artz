import { Link } from "@tanstack/react-router";
import { Layout } from "./Layout";
import { DisciplineMark } from "./BrandLogo";
import { disciplineIcons } from "./discipline-icons";
import { disciplines, type Discipline } from "@/lib/gallery-data";
import { ArrowRight, Check } from "lucide-react";

/**
 * The page every department shares.
 *
 * The five disciplines are siblings, not a main act and four sidelines, so
 * they get one layout driven by the data in `disciplines` rather than five
 * hand-built pages that would drift apart. Each takes its own accent through
 * a CSS custom property, so the department colours the page without any of it
 * being hard-coded per route.
 *
 * Painting passes `children` — it has an archive to show. The other four are
 * open for commission and say so plainly, rather than staging an empty
 * gallery grid to look busier than the department currently is.
 */
export function DepartmentPage({
  discipline,
  children,
}: {
  discipline: Discipline;
  children?: React.ReactNode;
}) {
  const Icon = disciplineIcons[discipline.id];
  const others = disciplines.filter((d) => d.id !== discipline.id);

  return (
    <Layout>
      <div style={{ ["--dept" as string]: discipline.accent }}>
        {/* ── Department hero ─────────────────────────────────────────── */}
        <section className="grain relative overflow-hidden pb-16 pt-14 md:pb-24 md:pt-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 -top-24 h-[460px] w-[460px] rounded-full opacity-[0.18] blur-3xl"
            style={{
              background:
                "radial-gradient(circle, var(--dept) 0%, transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="min-w-0 lg:col-span-7">
                <Link
                  to="/"
                  className="text-[11px] font-bold uppercase tracking-[0.3em] text-ink/45 transition-colors hover:text-ink/80"
                >
                  Artesque
                </Link>
                <span
                  className="ml-3 text-[11px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: "var(--dept)" }}
                >
                  {discipline.label}
                </span>

                <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ink md:text-6xl">
                  {discipline.tagline}
                </h1>
                <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-ink/70">
                  {discipline.intro}
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Link
                    to="/contact"
                    search={{ type: "commission" }}
                    className="inline-flex items-center gap-2 rounded-sm px-7 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                    style={{ backgroundColor: "var(--dept)" }}
                  >
                    Commission {discipline.label.toLowerCase()}
                    <ArrowRight size={16} />
                  </Link>
                  {discipline.status === "live" && (
                    <Link
                      to="/gallery"
                      className="glass rounded-sm px-7 py-3.5 text-sm font-medium text-band-foreground transition-colors hover:text-gold"
                    >
                      Browse the archive
                    </Link>
                  )}
                </div>
              </div>

              {/* The department mark at full size — the arch it shares with
                  the other four, its own object standing in the doorway. */}
              <div className="lg:col-span-5">
                <div className="mx-auto w-44 md:w-56 lg:ml-auto lg:mr-0">
                  <DisciplineMark
                    icon={Icon}
                    accent={discipline.accent}
                    className="h-auto w-full text-ink/90"
                    title={`${discipline.label} — Artesque`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── What the department takes on ────────────────────────────── */}
        <section className="border-t border-ink/5 bg-paper py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-3xl italic text-ink">
              What we take on
            </h2>
            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {discipline.offerings.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-ink/5 pb-4 text-ink/75"
                >
                  <Check
                    size={16}
                    className="mt-1 shrink-0"
                    style={{ color: "var(--dept)" }}
                  />
                  <span className="font-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Painting's archive, or an honest note for the departments that
            don't have one on the site yet. */}
        {children ?? <NotYetArchived discipline={discipline} />}

        {/* ── The other four ──────────────────────────────────────────── */}
        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-3xl italic text-ink">
              The other four
            </h2>
            <p className="mt-2 max-w-xl text-sm font-light text-ink/60">
              One threshold, five disciplines. A commission can cross between
              them — a score for a film, a sculpture for a stage.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((d) => {
                const OtherIcon = disciplineIcons[d.id];
                return (
                  <Link
                    key={d.id}
                    to={d.slug}
                    className="group flex items-center gap-4 border border-ink/10 bg-paper/60 p-5 transition-colors hover:border-ink/25"
                  >
                    <DisciplineMark
                      icon={OtherIcon}
                      accent={d.accent}
                      className="h-12 w-auto shrink-0 text-ink/80"
                      title=""
                    />
                    <span className="min-w-0">
                      <span className="block font-display text-lg text-ink">
                        {d.label}
                      </span>
                      <span className="block truncate text-xs font-light text-ink/55">
                        {d.tagline}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

/** Shown by the four departments that take commissions but have no archive on
 *  the site yet. Saying so is better than a grid of placeholders. */
function NotYetArchived({ discipline }: { discipline: Discipline }) {
  return (
    <section className="grain relative bg-band py-14 text-band-foreground md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: "var(--dept)" }}
        >
          Open for commission
        </p>
        <h2 className="mt-5 font-display text-3xl italic md:text-4xl">
          The work is happening. The archive isn't online yet.
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-light leading-relaxed text-band-foreground/70">
          {discipline.label} commissions are open now and briefs are answered
          the same way as any other department — a conversation first, then a
          quotation. Recordings, footage and photographs of past work are shared
          on request while this page fills out.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            search={{ type: "commission" }}
            className="rounded-sm px-7 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--dept)" }}
          >
            Start a conversation
          </Link>
          <Link
            to="/subscription"
            className="glass rounded-sm px-7 py-3.5 text-sm font-medium text-band-foreground transition-colors hover:text-gold"
          >
            Get told when it lands
          </Link>
        </div>
      </div>
    </section>
  );
}

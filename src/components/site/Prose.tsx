/**
 * A lesson's body, written in the Studio as plain text.
 *
 * Deliberately not Markdown or HTML: the body is typed by the artist, and
 * rendering HTML from it would mean one bad paste could break — or hijack —
 * the page. Only three shapes are understood:
 *   "## " at the start of a line  → a heading
 *   "- " at the start of a line   → a bullet
 *   a blank line                  → a new paragraph
 */
export function Prose({ body, className = "" }: { body: string; className?: string }) {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <div className={`space-y-5 ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim());
        if (lines.length === 0) return null;

        if (lines[0].startsWith("## ")) {
          const [heading, ...rest] = lines;
          return (
            <div key={i}>
              <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
                {heading.slice(3).trim()}
              </h2>
              {rest.length > 0 && (
                <p className="mt-3 text-base font-light leading-relaxed text-ink/75">
                  {rest.join(" ")}
                </p>
              )}
            </div>
          );
        }

        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="ml-1 space-y-2">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3 text-base font-light leading-relaxed text-ink/75">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {l.trim().slice(2)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="text-base font-light leading-relaxed text-ink/75">
            {lines.join(" ")}
          </p>
        );
      })}
    </div>
  );
}

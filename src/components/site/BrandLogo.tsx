/**
 * The MILLERPIX wordmark, drawn as vector geometry rather than shipped as a
 * bitmap.
 *
 * The supplied logo is flat black on white, which is unusable here: the nav
 * and footer sit on a near-black band, so a JPEG of it needs a light box
 * behind it and ends up looking pasted on. Redrawing it means the letterforms
 * can take `currentColor` — near-white on the dark band, ink on paper — while
 * the red accents ride a single `--brand-accent` custom property that each
 * surface can retune for contrast.
 *
 * Geometry lives on a 100-unit cap height with the baseline at y=100. The
 * brushes reach above the cap line, hence the negative viewBox origin.
 */

/** Circle expressed as a path subpath, so holes can share one `evenodd` path. */
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0Z`;

/** A brush standing in for a letter: hair, two ferrule bands, tapered handle. */
function Brush() {
  return (
    <>
      <path d="M15,-24 C3,-12 0,1 5,13 L25,13 C30,1 27,-12 15,-24 Z" />
      <path d="M5,17 H25 V24 H5 Z" />
      <path d="M5,28 H25 V35 H5 Z" />
      <path d="M6,39 H24 L17,100 H13 Z" />
    </>
  );
}

/** The palette that carries the P: bowl, thumb hole, five knocked-out dabs. */
function Palette() {
  const bowl = "M0,50a56,50 0 1,0 112,0a56,50 0 1,0 -112,0Z";
  const holes = [
    circle(32, 68, 12), // thumb
    circle(40, 26, 9),
    circle(64, 18, 8),
    circle(86, 32, 8),
    circle(93, 56, 7),
    circle(74, 74, 7),
  ].join("");
  return <path fillRule="evenodd" d={bowl + holes} />;
}

interface BrandProps {
  className?: string;
  /** Overrides the inherited `--brand-accent`; useful on fixed-dark surfaces. */
  accent?: string;
  title?: string;
}

/** The full lockup. Sized by height — set one on `className`. */
export function BrandWordmark({
  className,
  accent,
  title = "MILLERPIX",
}: BrandProps) {
  const red = accent ?? "var(--brand-accent, #e0243c)";
  return (
    <svg
      viewBox="0 -26 707 130"
      role="img"
      aria-label={title}
      className={className}
      fill="currentColor"
    >
      {/* M — with the accent wedge seated in its left counter. */}
      <path d="M0,100 V0 H28 L46,44 L64,0 H92 V100 H68 V38 L54,74 H38 L24,38 V100 Z" />
      <path fill={red} d="M24,100 V46 L41,64 V100 Z" />

      <g transform="translate(102,0)">
        <Brush />
      </g>

      <path transform="translate(142,0)" d="M0,0 H25 V76 H58 V100 H0 Z" />
      <path transform="translate(208,0)" d="M0,0 H25 V76 H58 V100 H0 Z" />

      {/* E — the middle arm is the accent, as in the original mark. */}
      <path
        transform="translate(274,0)"
        d="M0,0 H60 V24 H25 V76 H60 V100 H0 Z"
      />
      <path
        transform="translate(274,0)"
        fill={red}
        d="M27,40 H56 L52,60 H23 Z"
      />

      {/* R */}
      <path
        transform="translate(342,0)"
        fillRule="evenodd"
        d="M0,0 H42 C59,0 69,11 69,29 C69,42 62,50 52,54 L70,100 H42 L28,58 H25 V100 H0 Z M25,18 V42 H40 C47,42 50,37 50,30 C50,23 47,18 40,18 Z"
      />

      <g transform="translate(422,0)">
        <Brush />
      </g>
      <g transform="translate(456,0)">
        <Palette />
      </g>

      <path transform="translate(580,0)" d="M0,0 H25 V100 H0 Z" />

      {/* X — black chevron meeting an accent chevron at the crossing. */}
      <path
        transform="translate(615,0)"
        d="M0,0 H27 L46,50 L27,100 H0 L19,50 Z"
      />
      <path
        transform="translate(615,0)"
        fill={red}
        d="M92,0 H65 L46,50 L65,100 H92 L73,50 Z"
      />
    </svg>
  );
}

/** Brush + palette alone, for favicons, stamps and anywhere too tight for the
 *  full name. */
export function BrandMark({
  className,
  title = "MILLERPIX",
}: Omit<BrandProps, "accent">) {
  return (
    <svg
      viewBox="0 -26 146 130"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="currentColor"
    >
      <Brush />
      <g transform="translate(34,0)">
        <Palette />
      </g>
    </svg>
  );
}

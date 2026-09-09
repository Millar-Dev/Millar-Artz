/**
 * The Artesque mark, wordmark and department marks.
 *
 * THE MARK is an archway — a threshold, the point of passing from one place
 * into another. Its geometry is reconstructed from the brand artwork rather
 * than eyeballed: the outer and inner curves are superellipses (exponent 1.8,
 * which is what gives the brand's "squared curves" rather than a plain
 * semicircle), fitted numerically against the guidelines board to within 1% of
 * its ink. All of it lives on a 100 x 130 grid.
 *
 * A single oversized KEYSTONE block sits at the crown, carrying the accent
 * colour, with a thin ivory ring separating the dot from its own block so the
 * accent always reads as a distinct dot. The block is wide enough that the
 * accent never straddles the arch's edge onto whatever the mark is placed on.
 *
 * THE WORDMARK is set type, not a logotype — Space Grotesk Bold, with ART in
 * berry at the front of the word — so it is composed here in HTML rather than
 * traced, and always matches the loaded webfont.
 */

import type { ReactNode } from "react";

/** Outer silhouette with the doorway as an evenodd hole. */
const ARCH_BODY =
  "M0 57.2L1.56 47.77L3.13 43.43L4.69 40.08L6.25 37.26L7.81 34.8L9.38 32.6L10.94 30.61L12.5 28.79L14.06 27.11L15.63 25.56L17.19 24.12L18.75 22.78L20.31 21.53L21.88 20.36L23.44 19.27L25 18.26L26.56 17.31L28.13 16.43L29.69 15.61L31.25 14.85L32.81 14.15L34.38 13.51L35.94 12.93L37.5 12.39L39.06 11.92L40.63 11.5L42.19 11.13L43.75 10.82L45.31 10.57L46.88 10.38L48.44 10.25L50 10.2L51.56 10.25L53.13 10.38L54.69 10.57L56.25 10.82L57.81 11.13L59.38 11.5L60.94 11.92L62.5 12.39L64.06 12.93L65.63 13.51L67.19 14.15L68.75 14.85L70.31 15.61L71.88 16.43L73.44 17.31L75 18.26L76.56 19.27L78.13 20.36L79.69 21.53L81.25 22.78L82.81 24.12L84.38 25.56L85.94 27.11L87.5 28.79L89.06 30.61L90.63 32.6L92.19 34.8L93.75 37.26L95.31 40.08L96.88 43.43L98.44 47.77L100 57.2L100 130L0 130Z M23 50L23.84 42.97L24.69 39.75L25.53 37.25L26.38 35.15L27.22 33.32L28.06 31.68L28.91 30.2L29.75 28.84L30.59 27.59L31.44 26.44L32.28 25.36L33.13 24.37L33.97 23.44L34.81 22.57L35.66 21.76L36.5 21L37.34 20.3L38.19 19.64L39.03 19.03L39.88 18.47L40.72 17.94L41.56 17.47L42.41 17.03L43.25 16.63L44.09 16.28L44.94 15.97L45.78 15.69L46.63 15.46L47.47 15.28L48.31 15.13L49.16 15.04L50 15L50.84 15.04L51.69 15.13L52.53 15.28L53.38 15.46L54.22 15.69L55.06 15.97L55.91 16.28L56.75 16.63L57.59 17.03L58.44 17.47L59.28 17.94L60.13 18.47L60.97 19.03L61.81 19.64L62.66 20.3L63.5 21L64.34 21.76L65.19 22.57L66.03 23.44L66.88 24.37L67.72 25.36L68.56 26.44L69.41 27.59L70.25 28.84L71.09 30.2L71.94 31.68L72.78 33.32L73.63 35.15L74.47 37.25L75.31 39.75L76.16 42.97L77 50L77.00 121.9L23.00 121.9Z";

/** Keystone block, its ring, and the accent dot. Ring colour matches whatever
 *  the doorway shows, so the dot never bleeds into the block. */
const KEYSTONE = { x: 30.5, w: 39, h: 25.5, r: 9, dotY: 12.44, dotR: 7.46, ringR: 9.2 };

interface MarkProps {
  className?: string;
  /** Keystone dot colour. Defaults to the brand accent; department marks pass
   *  their own discipline colour. */
  accent?: string;
  /** Colour showing through the doorway and the keystone ring — set this to
   *  the surface the mark sits on. */
  ground?: string;
  title?: string;
  children?: ReactNode;
}

/**
 * The arch alone. Body takes `currentColor`, so it inverts correctly between
 * the ivory page and the plum-ink band without a second asset.
 */
export function BrandMark({
  className,
  accent = "var(--brand-accent, #8A3350)",
  ground = "var(--brand-ground, #F7F3EA)",
  title = "Artesque",
  children,
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="currentColor"
    >
      <path fillRule="evenodd" d={ARCH_BODY} />
      {children}
      <rect
        x={KEYSTONE.x}
        y={0}
        width={KEYSTONE.w}
        height={KEYSTONE.h}
        rx={KEYSTONE.r}
        fill="currentColor"
      />
      <circle cx={50} cy={KEYSTONE.dotY} r={KEYSTONE.ringR} fill={ground} />
      <circle cx={50} cy={KEYSTONE.dotY} r={KEYSTONE.dotR} fill={accent} />
    </svg>
  );
}

/**
 * A department mark: the same arch, its own accent on the keystone, and a
 * representative object standing in the open doorway. Never just a colour
 * swap — the icon is what identifies the discipline at a glance.
 */
export function DisciplineMark({
  icon: Icon,
  accent,
  className,
  ground,
  title,
}: MarkProps & { icon: DisciplineIcon; accent: string }) {
  return (
    <BrandMark className={className} accent={accent} ground={ground} title={title}>
      {/* Standing in the doorway, which spans x 23-77 and clears y 40 down. */}
      <Icon x={33} y={52} width={34} height={34} color={accent} />
    </BrandMark>
  );
}

/**
 * A pair of hanging gymnastic rings, for the acrobatics department. Drawn from
 * plain interlocking-circle geometry rather than pulled from an icon set —
 * nothing in the usual sets reads as rings at this size, and this keeps the
 * department marks free of any icon-licence attribution.
 */
export function Rings({
  x,
  y,
  width,
  height,
  color,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}) {
  return (
    <svg x={x} y={y} width={width} height={height} viewBox="0 0 24 24">
      <g
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path d="M7.5 1.5v6M16.5 1.5v6" />
        <circle cx="7.5" cy="13" r="5" />
        <circle cx="16.5" cy="13" r="5" />
      </g>
    </svg>
  );
}

/** Lucide's components accept the SVG placement props we need to nest them. */
export type DisciplineIcon = (props: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}) => ReactNode;

/**
 * Mark plus name plus tagline. The wordmark is Space Grotesk Bold with ART set
 * in the accent, so the name announces its subject before it has finished
 * being read.
 */
export function BrandLockup({
  className = "",
  markClassName = "h-9 w-auto",
  showTagline = true,
  accentClassName = "text-brand-accent",
}: {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
  accentClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <BrandMark className={markClassName} title="" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35em] font-bold uppercase leading-none tracking-[-0.01em]">
          <span className={accentClassName}>ART</span>ESQUE
        </span>
        {showTagline && (
          <span className="mt-1.5 font-sans text-[0.42em] font-bold uppercase leading-none tracking-[0.28em] opacity-80">
            The threshold to what's possible
          </span>
        )}
      </span>
    </span>
  );
}

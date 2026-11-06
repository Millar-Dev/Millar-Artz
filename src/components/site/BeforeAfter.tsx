import { useId, useState } from "react";
import { sized, srcSetFor } from "@/lib/images";
import { useT } from "@/lib/i18n";

/**
 * The wall before, and the wall after.
 *
 * A mural is judged by what it replaced, and a photograph of the finished
 * wall alone doesn't carry that. The two photographs are stacked and the
 * finished one is revealed by a handle the visitor drags.
 *
 * The handle is a range input rather than a mouse-only drag: it works with a
 * finger, a mouse and the arrow keys, and a screen reader announces it. Both
 * images are in the page from the start, so there is nothing to see fail if
 * JavaScript never arrives — the visitor simply sees the finished wall.
 */
export function BeforeAfter({
  before,
  after,
  alt,
  aspectRatio,
  className = "",
}: {
  before: string;
  after: string;
  alt: string;
  /** Width ÷ height of the finished photo, so the frame reserves its space. */
  aspectRatio?: number;
  className?: string;
}) {
  const t = useT();
  const id = useId();
  const [reveal, setReveal] = useState(50);

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative select-none overflow-hidden rounded-sm bg-paper ring-1 ring-ink/10"
        style={{ aspectRatio: aspectRatio && aspectRatio > 0 ? aspectRatio : 3 / 2 }}
      >
        {/* The finished wall sits underneath and is uncovered from the left. */}
        <img
          src={sized(after, 1280)}
          srcSet={srcSetFor(after, [480, 720, 960, 1280], 80)}
          sizes="(min-width: 1024px) 70vw, 100vw"
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Clipped rather than put in a narrowing box: the photograph keeps
            the frame's full width, so the two stay in register as the handle
            moves instead of the top one squeezing. */}
        <img
          src={sized(before, 1280)}
          srcSet={srcSetFor(before, [480, 720, 960, 1280], 80)}
          sizes="(min-width: 1024px) 70vw, 100vw"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
        />

        {/* The seam. */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-white/80 shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          style={{ left: `${reveal}%` }}
          aria-hidden="true"
        >
          <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-band/80 text-[10px] font-bold text-white">
            ↔
          </span>
        </div>

        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-band/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
          {t("Before")}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-band/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
          {t("After")}
        </span>

        <label htmlFor={id} className="sr-only">
          {t("Drag to compare the wall before and after")}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={reveal}
          onChange={(e) => setReveal(Number(e.target.value))}
          aria-valuetext={t("{percent}% of the finished wall shown", { percent: 100 - reveal })}
          className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0"
        />
      </div>
    </div>
  );
}

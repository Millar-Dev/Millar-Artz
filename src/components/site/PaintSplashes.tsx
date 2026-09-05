/**
 * Decorative paint-splash blobs that fade in and out on a slow loop across
 * the page. Positioned absolute (scrolls with the page) rather than fixed —
 * stacking multiple independent fixed, viewport-sized layers produced a
 * stale gray compositing glitch on scroll in testing, and "some plane
 * space" reads better as several spots down the page than one viewport-
 * locked corner anyway. Pure opacity/transform animation only, no
 * backdrop-filter or mix-blend-mode.
 */
const BLOB_A =
  "M45.2,-59.3C58.6,-49.6,69.5,-35.4,73.6,-19.5C77.7,-3.6,75,14,66.8,27.9C58.6,41.8,44.9,51.9,29.9,58.9C14.9,65.9,-1.4,69.7,-17.6,67.3C-33.8,64.8,-49.9,56,-59.9,42.5C-69.9,29,-73.8,10.8,-71.4,-6.2C-69,-23.2,-60.3,-39,-47.4,-49C-34.5,-59,-17.3,-63.2,-0.4,-62.7C16.5,-62.1,33,-69,45.2,-59.3Z";
const BLOB_B =
  "M39.6,-51.2C52.5,-42.6,64.5,-31.2,68.9,-17.1C73.3,-3,70,13.8,61.8,27.5C53.6,41.2,40.5,51.8,25.9,58.1C11.3,64.4,-4.8,66.4,-19.9,62.5C-35,58.6,-49.1,48.8,-58.4,35.2C-67.7,21.6,-72.2,4.2,-69.2,-11.6C-66.2,-27.4,-55.7,-41.6,-42.5,-50.2C-29.3,-58.8,-14.6,-61.8,-0.2,-61.5C14.3,-61.2,28.6,-57.6,39.6,-51.2Z";
const BLOB_C =
  "M44.7,-55.4C56.9,-46.9,64.7,-31.6,67.6,-15.6C70.5,0.5,68.5,17.3,60.6,30.8C52.7,44.3,38.9,54.5,23.5,60.2C8.1,65.9,-8.9,67.1,-24.4,62.2C-39.9,57.3,-53.9,46.3,-61.9,31.9C-69.9,17.5,-71.9,-0.3,-67.1,-15.7C-62.3,-31.1,-50.7,-44.1,-37.1,-52.4C-23.5,-60.7,-11.7,-64.3,2.9,-68.1C17.6,-71.9,32.5,-63.9,44.7,-55.4Z";

// Spread down the full height of the page (percentages, not vh) so splashes
// keep appearing the whole way through a scroll rather than clustering in the
// first screen. Staggered delays keep them from pulsing in unison.
const splashes = [
  { className: "-left-16 top-[4%] h-56 w-56 md:h-72 md:w-72", color: "var(--grad-vermilion)", delay: "0s", duration: "15s", path: BLOB_A },
  { className: "left-[36%] top-[11%] h-40 w-40 md:h-52 md:w-52", color: "var(--grad-burnt)", delay: "7s", duration: "13s", path: BLOB_C },
  { className: "-right-20 top-[22%] h-64 w-64 md:h-80 md:w-80", color: "var(--grad-sienna)", delay: "3s", duration: "17s", path: BLOB_B },
  { className: "-left-24 top-[38%] h-60 w-60 md:h-80 md:w-80", color: "var(--grad-sienna)", delay: "11s", duration: "16s", path: BLOB_C },
  { className: "right-[12%] top-[50%] h-44 w-44 md:h-60 md:w-60", color: "var(--grad-vermilion)", delay: "5s", duration: "14s", path: BLOB_A },
  { className: "left-[8%] top-[63%] h-52 w-52 md:h-72 md:w-72", color: "var(--grad-burnt)", delay: "9s", duration: "18s", path: BLOB_B },
  { className: "-right-16 top-[76%] h-56 w-56 md:h-72 md:w-72", color: "var(--grad-vermilion)", delay: "2s", duration: "15s", path: BLOB_C },
  { className: "left-[30%] top-[89%] h-48 w-48 md:h-64 md:w-64", color: "var(--grad-sienna)", delay: "13s", duration: "16s", path: BLOB_A },
];

export function PaintSplashes() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {splashes.map((s, i) => (
        <svg
          key={i}
          viewBox="-100 -100 200 200"
          className={`animate-splash absolute opacity-0 blur-2xl ${s.className}`}
          style={{
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        >
          <path d={s.path} fill={s.color} />
        </svg>
      ))}
    </div>
  );
}

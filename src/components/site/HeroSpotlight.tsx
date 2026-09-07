/**
 * A stage spotlight thrown down over the hero bouquet.
 *
 * The hard-won lesson from the previous attempt: light only reads as light
 * when it has darkness to cut through. Three soft ellipses over a mid-tone
 * warm background produced haze, not a beam. So this layers, back to front:
 *
 *   1. a dark vignette that sinks the area behind the artwork
 *   2. radiating shafts (repeating-conic) fanning out of a point above
 *   3. a hot core at that point, where the lamp itself sits
 *   4. a pool of light where the beam lands on the bouquet
 *   5. glowing motes drifting down inside the cone
 *
 * Everything is pointer-events-none and sits at z-0, beneath every card.
 */

/** Motes are spread across the cone's width and staggered in time so the
 *  fall never pulses in unison. Positions are percentages of the beam box. */
const MOTES = [
  { left: 26, size: 3, delay: 0, duration: 11, drift: 14 },
  { left: 34, size: 2, delay: 3.5, duration: 9, drift: -10 },
  { left: 41, size: 4, delay: 1.2, duration: 13, drift: 18 },
  { left: 47, size: 2, delay: 6.1, duration: 10, drift: -6 },
  { left: 52, size: 5, delay: 2.4, duration: 14, drift: 8 },
  { left: 57, size: 2, delay: 8.3, duration: 9.5, drift: -14 },
  { left: 62, size: 3, delay: 4.7, duration: 12, drift: 12 },
  { left: 68, size: 2, delay: 0.8, duration: 10.5, drift: -8 },
  { left: 73, size: 4, delay: 5.6, duration: 13.5, drift: 16 },
  { left: 44, size: 2, delay: 7.4, duration: 11.5, drift: -12 },
  { left: 55, size: 3, delay: 9.6, duration: 12.5, drift: 6 },
  { left: 65, size: 2, delay: 10.8, duration: 10, drift: -16 },
  { left: 38, size: 3, delay: 12.2, duration: 13, drift: 10 },
  { left: 70, size: 2, delay: 2.9, duration: 9.8, drift: -5 },
];

export function HeroSpotlight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[-95%] z-0 h-[215%] w-[165%] -translate-x-1/2 overflow-hidden"
    >
      {/* 1 — Darkness for the light to cut through. Without this the beam has
          nothing to read against on the warm hero ground. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 52% 46% at 50% 62%, rgba(28,10,4,0.62) 0%, rgba(28,10,4,0.34) 45%, transparent 76%)",
        }}
      />

      {/* 2 — The shafts. A repeating conic from a point just above the frame
          gives real rays rather than a smooth wash; the mask fades them out
          before they reach any edge so the cone never ends in a hard line. */}
      <div
        className="animate-beam-sway absolute inset-0 mix-blend-screen"
        style={{
          background:
            "repeating-conic-gradient(from 168deg at 50% 4%, rgba(255,241,214,0) 0deg, rgba(255,241,214,0.10) 1.1deg, rgba(255,241,214,0.02) 2.2deg, rgba(255,241,214,0) 3.6deg)",
          maskImage:
            "radial-gradient(ellipse 40% 62% at 50% 6%, #000 0%, rgba(0,0,0,0.72) 40%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 40% 62% at 50% 6%, #000 0%, rgba(0,0,0,0.72) 40%, transparent 82%)",
          filter: "blur(6px)",
        }}
      />

      {/* 3 — The lamp itself: a small, genuinely bright core at the apex. */}
      <div
        className="animate-spotlight absolute left-1/2 top-[1%] h-[26%] w-[34%] -translate-x-1/2 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 30%, rgba(255,247,228,0.85) 0%, rgba(255,226,170,0.42) 32%, rgba(255,214,150,0.12) 58%, transparent 78%)",
          filter: "blur(18px)",
        }}
      />

      {/* 4 — Where the beam lands, over the bouquet. */}
      <div
        className="animate-spotlight absolute left-1/2 top-[52%] h-[34%] w-[74%] -translate-x-1/2 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 50% 46% at 50% 50%, rgba(255,238,205,0.34) 0%, rgba(255,224,175,0.14) 44%, transparent 74%)",
          filter: "blur(26px)",
        }}
      />

      {/* 5 — Dust inside the cone. Each mote carries its own glow so it reads
          as a lit speck rather than a flat dot. */}
      <div className="absolute inset-x-0 top-[6%] bottom-[8%] mix-blend-screen">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="animate-mote absolute top-0 rounded-full bg-[rgb(255,243,220)]"
            style={{
              left: `${m.left}%`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.duration}s`,
              boxShadow: `0 0 ${m.size * 3}px ${m.size}px rgba(255,232,190,0.55)`,
              ["--mote-drift" as string]: `${m.drift}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

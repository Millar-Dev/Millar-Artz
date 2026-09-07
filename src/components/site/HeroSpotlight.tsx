/**
 * A stage spotlight thrown over the hero bouquet, in two halves.
 *
 * `HeroSpotlightBack` renders beneath the artwork: the darkness the beam
 * cuts through, the shafts, the lamp core and the pool where it lands.
 * `HeroSpotlightFront` renders above it: the volumetric haze and the falling
 * snow. Splitting them is what makes the light legible — a beam entirely
 * behind the work reads as a background gradient, because in reality light
 * scatters in the air *in front of* what it illuminates too.
 *
 * Colour is deliberately not the background's warm brown: the light is a
 * saturated gold-yellow and the snow is pure white, so both separate from
 * the terracotta ground instead of blending into it.
 */

/** Saturated gold — distinctly yellower than the hero's brown. */
const GOLD = "255,205,70";
/** Snow stays pure white so it reads at any size. */
const SNOW = "255,255,255";

/** Spread across the cone and staggered in time so the fall never pulses in
 *  unison. `left` is a percentage of the beam box. */
const MOTES = [
  { left: 24, size: 3, delay: 0, duration: 11, drift: 16 },
  { left: 31, size: 2, delay: 3.5, duration: 9, drift: -12 },
  { left: 38, size: 4, delay: 1.2, duration: 13, drift: 20 },
  { left: 44, size: 2, delay: 6.1, duration: 10, drift: -7 },
  { left: 49, size: 5, delay: 2.4, duration: 14, drift: 9 },
  { left: 54, size: 2, delay: 8.3, duration: 9.5, drift: -16 },
  { left: 59, size: 3, delay: 4.7, duration: 12, drift: 13 },
  { left: 64, size: 2, delay: 0.8, duration: 10.5, drift: -9 },
  { left: 70, size: 4, delay: 5.6, duration: 13.5, drift: 18 },
  { left: 41, size: 2, delay: 7.4, duration: 11.5, drift: -13 },
  { left: 56, size: 3, delay: 9.6, duration: 12.5, drift: 7 },
  { left: 66, size: 2, delay: 10.8, duration: 10, drift: -18 },
  { left: 35, size: 3, delay: 12.2, duration: 13, drift: 11 },
  { left: 72, size: 2, delay: 2.9, duration: 9.8, drift: -6 },
  { left: 47, size: 3, delay: 14.1, duration: 11.8, drift: 15 },
  { left: 61, size: 4, delay: 6.8, duration: 12.8, drift: -10 },
];

const BEAM_BOX =
  "pointer-events-none absolute left-1/2 top-[-95%] h-[215%] w-[165%] -translate-x-1/2 overflow-hidden";

/** Everything behind the artwork. */
export function HeroSpotlightBack() {
  return (
    <div aria-hidden="true" className={`${BEAM_BOX} z-0`}>
      {/* The darkness the beam cuts through. Without this there is no
          contrast for light to register against on a warm ground. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 54% 48% at 50% 60%, rgba(22,7,2,0.74) 0%, rgba(22,7,2,0.42) 46%, transparent 78%)",
        }}
      />

      {/* Shafts. A repeating conic from a point above the frame gives real
          rays; the mask keeps the cone from ending on a hard edge. */}
      <div
        className="animate-beam-sway absolute inset-0 mix-blend-screen"
        style={{
          background: `repeating-conic-gradient(from 168deg at 50% 4%, rgba(${GOLD},0) 0deg, rgba(${GOLD},0.30) 1.1deg, rgba(${GOLD},0.07) 2.2deg, rgba(${GOLD},0) 3.6deg)`,
          maskImage:
            "radial-gradient(ellipse 42% 64% at 50% 6%, #000 0%, rgba(0,0,0,0.74) 42%, transparent 84%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 42% 64% at 50% 6%, #000 0%, rgba(0,0,0,0.74) 42%, transparent 84%)",
          filter: "blur(5px)",
        }}
      />

      {/* The lamp itself — blown out at the centre. */}
      <div
        className="animate-spotlight absolute left-1/2 top-[1%] h-[28%] w-[36%] -translate-x-1/2 mix-blend-screen"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 30%, rgba(255,252,238,1) 0%, rgba(${GOLD},0.82) 26%, rgba(${GOLD},0.34) 52%, transparent 76%)`,
          filter: "blur(16px)",
        }}
      />

      {/* Where the beam lands on the bouquet. */}
      <div
        className="animate-spotlight absolute left-1/2 top-[52%] h-[36%] w-[76%] -translate-x-1/2 mix-blend-screen"
        style={{
          background: `radial-gradient(ellipse 50% 46% at 50% 50%, rgba(${GOLD},0.60) 0%, rgba(${GOLD},0.26) 44%, transparent 74%)`,
          filter: "blur(24px)",
        }}
      />
    </div>
  );
}

/** Everything in front of the artwork — kept below z-50 so hovering a card
 *  still lifts it clear of the haze. */
export function HeroSpotlightFront() {
  return (
    <div aria-hidden="true" className={`${BEAM_BOX} z-[45]`}>
      {/* Airborne haze in front of the work. Low alpha: enough to sell the
          beam as volumetric without veiling the paintings. */}
      <div
        className="animate-beam-sway absolute inset-0 mix-blend-screen"
        style={{
          background: `repeating-conic-gradient(from 168deg at 50% 4%, rgba(${GOLD},0) 0deg, rgba(${GOLD},0.13) 1.3deg, rgba(${GOLD},0.03) 2.6deg, rgba(${GOLD},0) 4deg)`,
          maskImage:
            "radial-gradient(ellipse 40% 70% at 50% 8%, #000 0%, rgba(0,0,0,0.55) 46%, transparent 86%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 40% 70% at 50% 8%, #000 0%, rgba(0,0,0,0.55) 46%, transparent 86%)",
          filter: "blur(7px)",
        }}
      />

      {/* Snow, in front so it's actually visible against the artwork. Each
          fleck carries its own halo so it reads as lit, not as a flat dot. */}
      <div className="absolute inset-x-0 bottom-[6%] top-[6%] mix-blend-screen">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="animate-mote absolute top-0 rounded-full"
            style={{
              left: `${m.left}%`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              background: `rgb(${SNOW})`,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.duration}s`,
              boxShadow: `0 0 ${m.size * 4}px ${m.size * 1.5}px rgba(${SNOW},0.75)`,
              ["--mote-drift" as string]: `${m.drift}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Artwork sizes: stored as numbers in centimetres (width × height), shown
 * with the unit and an inches equivalent for buyers outside metric countries.
 *
 * Pure module — shared by the pages, the Studio and the structured data.
 */

const CM_PER_INCH = 2.54;

/** 13.8, 20, 29.5 — one decimal, trailing ".0" dropped. */
const tidy = (n: number) => String(Math.round(n * 10) / 10);

/** "35 × 50 cm (13.8 × 19.7 in)", or "" when either side is unknown. */
export function formatSize(
  width: number | null | undefined,
  height: number | null | undefined,
  units: { cm: string; in: string } = { cm: "cm", in: "in" },
) {
  if (!width || !height) return "";
  return `${tidy(width)} × ${tidy(height)} ${units.cm} (${tidy(width / CM_PER_INCH)} × ${tidy(height / CM_PER_INCH)} ${units.in})`;
}

/** Just the centimetres, for tight spots like gallery cards. */
export function formatSizeShort(
  width: number | null | undefined,
  height: number | null | undefined,
  cm = "cm",
) {
  if (!width || !height) return "";
  return `${tidy(width)} × ${tidy(height)} ${cm}`;
}

/**
 * The old free-text field ("35 x 65") read as width × height in cm. Only used
 * for records the size migration hasn't reached; anything that isn't exactly
 * two numbers gives up rather than guessing.
 */
export function parseLegacyDimensions(text: string | null | undefined) {
  const m = (text ?? "").trim().match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm)?$/i);
  if (!m) return { width: null, height: null };
  return { width: Number(m[1]), height: Number(m[2]) };
}

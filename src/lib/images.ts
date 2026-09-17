/**
 * Right-sized artwork images.
 *
 * Artwork photos are stored full size in Supabase Storage (around 200 KB each).
 * A phone showing a 400px-wide card doesn't need that: Supabase can resize on
 * the fly and serves WebP to browsers that accept it, which takes a typical
 * card from ~200 KB to ~25 KB. Resized copies are cached on Supabase's CDN.
 *
 * Two details that are easy to get wrong, both found by testing:
 * - Always pass `resize=contain` for width-only sizing. Without it Supabase
 *   crops to the original height and the painting comes out squashed.
 * - Supabase never enlarges past the original width, so a "1200px" request on
 *   a 1078px photo returns 1078px. Don't advertise exact dimensions for
 *   resized images.
 *
 * Resized URLs carry `X-Robots-Tag: none`, so they are for display only. The
 * sitemap, structured data and the painting pages' main image keep the
 * original URL — that is the one search engines should index.
 */

const OBJECT = "/storage/v1/object/public/";
const RENDER = "/storage/v1/render/image/public/";

/** Only Supabase-hosted images can be resized; anything else passes through. */
const resizable = (url: string) => url.includes(OBJECT);

/** A copy of the image at `width` pixels wide, proportions kept. */
export function sized(url: string, width: number, quality = 72) {
  if (!url || !resizable(url)) return url;
  return `${url.replace(OBJECT, RENDER)}?width=${Math.round(width)}&quality=${quality}&resize=contain`;
}

/** The widths offered to the browser; it picks the smallest that looks sharp. */
export const CARD_WIDTHS = [320, 480, 640, 960];

/** `srcset` for a resizable image, or undefined so the plain `src` is used. */
export function srcSetFor(url: string, widths = CARD_WIDTHS, quality = 72) {
  if (!url || !resizable(url)) return undefined;
  return widths.map((w) => `${sized(url, w, quality)} ${w}w`).join(", ");
}

/**
 * A 1200x630 crop for link previews (WhatsApp, Facebook, X), centred on the
 * painting. Portrait works lose some top and bottom, which is how those
 * platforms crop anyway.
 */
export function shareImage(url: string) {
  if (!url || !resizable(url)) return url;
  return `${url.replace(OBJECT, RENDER)}?width=1200&height=630&resize=cover&quality=80`;
}

/**
 * The studio's map location.
 *
 * The owner pastes an ordinary Google Maps share link into the Studio. Share
 * links are short redirects (maps.app.goo.gl/…) that carry no coordinates
 * themselves, so the server follows the redirect once, on save, and stores the
 * coordinates it finds. Pages then build the embed and directions links from
 * those stored coordinates — no redirect is followed on a page view.
 *
 * Pure module: the parsing and URL-building here are shared by the server
 * save, the Contact and About pages, and the structured data.
 */

export interface Coords {
  lat: number;
  lng: number;
}

const inRange = ({ lat, lng }: Coords) =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

/**
 * Pulls coordinates out of a full Google Maps URL. Checks the forms Google
 * uses, most precise first: the pin's own !3d…!4d… data, then /place/lat,lng,
 * then the @lat,lng viewport centre, then a ?q= or ?ll= query.
 */
export function coordsFromMapsUrl(url: string): Coords | null {
  const decoded = (() => {
    try {
      return decodeURIComponent(url);
    } catch {
      return url;
    }
  })();
  const num = "(-?\\d{1,3}(?:\\.\\d+)?)";
  const patterns = [
    new RegExp(`!3d${num}!4d${num}`),
    new RegExp(`/place/${num},\\s*${num}`),
    new RegExp(`@${num},${num}`),
    new RegExp(`[?&](?:q|query|ll|destination)=${num},\\s*${num}`),
  ];
  for (const re of patterns) {
    const m = decoded.match(re);
    if (m) {
      const c = { lat: Number(m[1]), lng: Number(m[2]) };
      if (inRange(c)) return c;
    }
  }
  return null;
}

/** Only Google Maps links are followed — the save must not fetch arbitrary URLs. */
export function isGoogleMapsUrl(raw: string) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    return (
      host === "maps.app.goo.gl" ||
      (host === "goo.gl" && u.pathname.startsWith("/maps")) ||
      host === "maps.google.com" ||
      ((host === "google.com" || host.endsWith(".google.com")) && u.pathname.startsWith("/maps"))
    );
  } catch {
    return false;
  }
}

/** Stored as "lat,lng" in site settings. */
export const formatCoords = ({ lat, lng }: Coords) => `${lat.toFixed(6)},${lng.toFixed(6)}`;

export function parseCoords(raw: string | undefined | null): Coords | null {
  const m = (raw ?? "").match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!m) return null;
  const c = { lat: Number(m[1]), lng: Number(m[2]) };
  return inRange(c) ? c : null;
}

/** Google's keyless embed, zoomed to street level around the pin. */
export const mapEmbedUrl = ({ lat, lng }: Coords) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

/** Opens turn-by-turn directions from wherever the visitor is. */
export const directionsUrl = ({ lat, lng }: Coords) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

/** A plain link to the pin, for when the owner's saved link is unusable. */
export const pinUrl = ({ lat, lng }: Coords) => `https://www.google.com/maps?q=${lat},${lng}`;

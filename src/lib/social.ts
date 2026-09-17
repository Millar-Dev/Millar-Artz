/**
 * The social profiles the studio can list, in display order.
 *
 * One list drives the footer, the Contact page, the Studio's settings form and
 * the structured data, so adding a platform is a change here rather than four
 * edits that can drift apart.
 */
export const SOCIAL_PROFILES = [
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
  { key: "facebook_url", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { key: "tiktok_url", label: "TikTok", placeholder: "https://tiktok.com/@yourhandle" },
  { key: "youtube_url", label: "YouTube", placeholder: "https://youtube.com/@yourchannel" },
] as const;

export type SocialKey = (typeof SOCIAL_PROFILES)[number]["key"];

/**
 * Turns whatever was typed into the Studio into a safe, absolute link, or
 * nothing.
 *
 * "tiktok.com/@miller" without a scheme would otherwise become a relative link
 * to millerartz.com/tiktok.com/@miller, and only http(s) is allowed through so
 * a pasted `javascript:` address can never end up in an href.
 */
export function normalizeProfileUrl(raw: string | undefined | null) {
  const value = (raw ?? "").trim();
  if (!value) return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

/** The saved profiles that are actually usable, in display order. */
export function savedProfiles(settings: Partial<Record<SocialKey, string>> | undefined) {
  return SOCIAL_PROFILES.map((p) => ({
    ...p,
    href: normalizeProfileUrl(settings?.[p.key]),
  })).filter((p) => p.href);
}

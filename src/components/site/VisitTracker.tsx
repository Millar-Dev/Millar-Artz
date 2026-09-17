import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/data/analytics";

/**
 * Reports page views and the handful of taps that mean someone is reaching out.
 *
 * Renders nothing. Page views fire on every client-side navigation, not just
 * the first load. The referrer and campaign tags are only sent with the first
 * page of a visit: `document.referrer` keeps pointing at Google for the whole
 * session, so sending it on every page would make each internal click look
 * like a fresh arrival from search.
 *
 * Interactions are caught with one delegated listener that reads the link's
 * address, rather than wiring every button: any WhatsApp, phone, email,
 * Instagram, Facebook, TikTok or YouTube link anywhere on the site — including ones added
 * later in the Studio — is counted without touching the component it's in.
 */
export function VisitTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firstView = useRef(true);

  useEffect(() => {
    if (!shouldTrack()) return;
    const entry = firstView.current;
    firstView.current = false;
    const params = new URLSearchParams(window.location.search);
    send({
      kind: "pageview",
      name: "pageview",
      path: pathname,
      entry,
      referrer: entry ? document.referrer : undefined,
      utmSource: entry ? params.get("utm_source") ?? undefined : undefined,
    });
  }, [pathname]);

  useEffect(() => {
    if (!shouldTrack()) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      const name = interactionFor(link.getAttribute("href") ?? "");
      if (!name) return;
      send({
        kind: "interaction",
        name,
        path: window.location.pathname,
      });
    };
    // Capture phase, so it still sees clicks a component stops propagating.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

/** Which interaction a link represents, if any. */
function interactionFor(href: string) {
  const h = href.toLowerCase();
  if (h.startsWith("tel:")) return "call_click";
  if (h.startsWith("mailto:")) return "email_click";
  // A WhatsApp link with no number is someone sharing a painting, not
  // messaging the studio — count it separately.
  if (/wa\.me\/\?text=|whatsapp\.com\/send\/?\?text=/.test(h)) return "share_click";
  if (/wa\.me|whatsapp\.com|^whatsapp:/.test(h)) return "whatsapp_click";
  if (h.includes("instagram.com")) return "instagram_click";
  if (/facebook\.com|fb\.com|fb\.me/.test(h)) return "facebook_click";
  if (h.includes("tiktok.com")) return "tiktok_click";
  if (/youtube\.com|youtu\.be/.test(h)) return "youtube_click";
  if (h.includes("/contact") && h.includes("commission")) return "commission_click";
  return null;
}

/** Set on a browser that should never be counted — the owner's own phone and
 *  laptop. Signing into the Studio sets it; the Visitors panel can clear it. */
export const EXCLUDE_DEVICE_KEY = "millerartz:exclude-device";

/** Skip local development, the owner's dashboard and devices, and browsers
 *  that have asked not to be tracked. */
function shouldTrack() {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(EXCLUDE_DEVICE_KEY) === "1") return false;
  } catch {
    /* storage blocked — carry on */
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  if (window.location.pathname.startsWith("/studio")) return false;
  if (navigator.doNotTrack === "1") return false;
  return true;
}

function send(data: Parameters<typeof trackEvent>[0]["data"]) {
  // Fire and forget. A failed analytics call must never surface to a visitor.
  trackEvent({ data }).catch(() => {});
}

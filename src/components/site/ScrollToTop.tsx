import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Starts every new page at the top.
 *
 * Opening a link from the foot of a long page used to leave the next page
 * scrolled just as far down — on a phone that meant landing in the middle of
 * it with the menu bar thousands of pixels above. Going back, by contrast,
 * should return to where you were, so only forward navigations are reset, and
 * a link to an anchor (/faq#payment) is left alone so the browser can find it.
 */
export function ScrollToTop() {
  const router = useRouter();

  useEffect(() => {
    return router.history.subscribe(({ action, location }) => {
      if (action.type !== "PUSH" && action.type !== "REPLACE") return;
      if (location.hash) return;
      // After the new page has been laid out, or the browser may scroll back
      // while the old page's height is still in effect.
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
    });
  }, [router]);

  return null;
}

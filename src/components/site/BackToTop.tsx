import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useT } from "@/lib/i18n";

/**
 * A way back to the menu from deep in a long page.
 *
 * The gallery runs to several screens on a phone, and the navigation only
 * sits at the top, so returning meant a long scroll. Appears once the visitor
 * is two screens down, and keeps clear of the corner where phone browsers put
 * their own controls.
 */
export function BackToTop() {
  const t = useT();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("Back to top")}
      className="animate-fade fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-band text-band-foreground shadow-2xl shadow-black/30 transition-colors hover:text-gold print:hidden"
    >
      <ArrowUp size={18} />
    </button>
  );
}

import { Star } from "lucide-react";
import { normalizeProfileUrl } from "@/lib/social";
import { useT } from "@/lib/i18n";

/**
 * "Leave a review on Google".
 *
 * Reviews are the one thing a new client checks that the studio can't write
 * itself, and they carry more weight for local search than anything on this
 * site. Renders nothing until a review link is saved in the Studio, so it can
 * never send anyone to a broken page.
 */
export function ReviewLink({
  settings,
  className = "",
  variant = "button",
}: {
  settings: { google_review_url?: string };
  className?: string;
  /** "link" is the quiet footer form; "button" is the Contact page card. */
  variant?: "button" | "link";
}) {
  const t = useT();
  const href = normalizeProfileUrl(settings.google_review_url);
  if (!href) return null;

  if (variant === "link") {
    return (
      <a href={href} target="_blank" rel="noopener" className={className}>
        {t("Review us on Google")}
      </a>
    );
  }

  return (
    <div className={`border border-ink/10 bg-paper/60 p-5 ${className}`}>
      <p className="font-display font-bold text-sm text-ink">
        {t("Have we worked together?")}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink/60">
        {t("A few words on Google help other people in Arusha — and further afield — find the studio.")}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="mt-4 inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
      >
        <Star size={13} /> {t("Leave a review")}
      </a>
    </div>
  );
}

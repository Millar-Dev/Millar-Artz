import { useT } from "@/lib/i18n";
import { STATUS_LABEL, type ArtworkStatus } from "@/lib/gallery-data";

/** Availability badge for a painting, shared by the gallery and painting pages. */
export function StatusPill({ status }: { status: ArtworkStatus }) {
  const t = useT();
  const map: Record<ArtworkStatus, string> = {
    available: "bg-green-500/15 text-green-600 dark:text-green-400",
    sold: "bg-ink/10 text-ink/50",
    not_for_sale: "border border-ink/10 text-ink/60",
  };
  return (
    <span
      className={`shrink-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? ""}`}
    >
      {t(STATUS_LABEL[status] ?? status)}
    </span>
  );
}

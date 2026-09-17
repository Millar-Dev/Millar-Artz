import { useT } from "@/lib/i18n";
/** Availability badge for a painting, shared by the gallery and painting pages. */
export function StatusPill({ status }: { status: string }) {
  const t = useT();
  const map: Record<string, string> = {
    available: "bg-green-500/15 text-green-600 dark:text-green-400",
    sold: "bg-ink/10 text-ink/50",
    featured: "bg-band text-band-foreground",
    commission: "border border-ink/10 text-ink/60",
  };
  const label: Record<string, string> = {
    available: "Available",
    sold: "Sold",
    featured: "Featured",
    commission: "Commissioned",
  };
  return (
    <span
      className={`shrink-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${map[status] ?? ""}`}
    >
      {t(label[status] ?? status)}
    </span>
  );
}

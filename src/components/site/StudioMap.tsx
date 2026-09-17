import { Navigation, ExternalLink } from "lucide-react";
import { directionsUrl, mapEmbedUrl, parseCoords, pinUrl } from "@/lib/map";
import { useT } from "@/lib/i18n";

/**
 * The studio's location, with a live map and a one-tap route there.
 *
 * Renders nothing until a map link has been saved in the Studio. The map
 * frame loads lazily, so Google's map is only fetched once a visitor scrolls
 * down to it rather than on every page load.
 */
export function StudioMap({
  settings,
  className = "",
  compact = false,
}: {
  settings: { map_coords?: string; map_url?: string; location?: string };
  className?: string;
  /** Links only, no embedded map — for places that just need directions. */
  compact?: boolean;
}) {
  const t = useT();
  const coords = parseCoords(settings.map_coords);
  if (!coords) return null;
  const openHref = settings.map_url?.trim() || pinUrl(coords);

  const actions = (
    <div className="flex flex-wrap gap-2">
      <a
        href={directionsUrl(coords)}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft"
      >
        <Navigation size={13} /> {t("Get directions")}
      </a>
      <a
        href={openHref}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 rounded-sm border border-ink/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/75 hover:text-ink"
      >
        <ExternalLink size={13} /> {t("Open in Google Maps")}
      </a>
    </div>
  );

  if (compact) return <div className={className}>{actions}</div>;

  return (
    // Raised above the decorative paint splashes, which are drawn after the
    // page content and would otherwise wash colour over the map itself.
    <div id="map" className={`relative z-10 overflow-hidden border border-ink/10 bg-paper ${className}`}>
      <div className="relative aspect-[4/3] w-full bg-ink/5">
        <iframe
          src={mapEmbedUrl(coords)}
          title={t("Map showing the MillerArtz studio in Arusha, Tanzania")}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
        />
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="font-display font-bold text-sm text-ink">{t("The studio")}</p>
          {settings.location && (
            <p className="mt-1 text-xs text-ink/60">{settings.location}</p>
          )}
        </div>
        {actions}
      </div>
    </div>
  );
}

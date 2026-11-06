import { useState } from "react";
import { PlayCircle, X } from "lucide-react";
import { sized, srcSetFor } from "@/lib/images";
import { youtubeEmbedUrl, youtubeId } from "@/lib/youtube";
import { useT } from "@/lib/i18n";
import type { MediaItemRow } from "@/lib/data/content";

/**
 * What a department has to show: photographs of the work, and video where
 * there is video.
 *
 * Music, dance and acrobatics can't be hung on a wall — a recording or a
 * clip is the work. So a video sits in the grid as its own tile and opens in
 * place, and nothing loads from YouTube until someone asks for it.
 */
export function DepartmentMedia({ items, accent }: { items: MediaItemRow[]; accent: string }) {
  const t = useT();
  const [playing, setPlaying] = useState<string | null>(null);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-ink/5 bg-gallery py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-display text-3xl italic text-ink">{t("From the department")}</h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const video = youtubeId(item.youtube_url);
            const poster = item.image_path;
            return (
              <figure key={item.id} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-paper ring-1 ring-ink/10">
                  {poster ? (
                    <img
                      src={sized(poster, 640)}
                      srcSet={srcSetFor(poster)}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      alt={item.title || ""}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center"
                      style={{ backgroundColor: `${accent}22` }}
                    >
                      <PlayCircle size={48} className="text-ink/30" />
                    </span>
                  )}

                  {video && (
                    <button
                      type="button"
                      onClick={() => setPlaying(video)}
                      aria-label={t("Play {title}", { title: item.title || t("video") })}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 text-white transition-colors hover:bg-black/40"
                    >
                      <PlayCircle size={52} />
                    </button>
                  )}
                </div>
                {(item.title || item.caption) && (
                  <figcaption className="mt-3">
                    {item.title && (
                      <p className="font-display text-lg font-bold text-ink">{item.title}</p>
                    )}
                    {item.caption && (
                      <p className="mt-1 text-sm font-light leading-relaxed text-ink/65">
                        {item.caption}
                      </p>
                    )}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>

      {playing && (
        <div
          className="animate-fade fixed inset-0 z-[90] flex items-center justify-center bg-band/95 p-4"
          onClick={() => setPlaying(null)}
        >
          <button
            onClick={() => setPlaying(null)}
            aria-label={t("Close")}
            className="absolute right-5 top-5 text-band-foreground/70 hover:text-band-foreground"
          >
            <X size={22} />
          </button>
          <div
            className="aspect-video w-full max-w-4xl overflow-hidden rounded-sm bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`${youtubeEmbedUrl(playing)}?autoplay=1`}
              title={t("Video")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        </div>
      )}
    </section>
  );
}

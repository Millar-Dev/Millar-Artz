import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { disciplines } from "@/lib/gallery-data";
import { listArtworks } from "@/lib/data/artworks";
import { artworkPath, SITE_URL } from "@/lib/seo";

const escapeXml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Sitemaps require fully-qualified absolute URLs — relative <loc> values are
 *  rejected by search engines. Built from SITE_URL rather than the request so
 *  every <loc> matches the canonical tag on the page it names: a sitemap that
 *  lists one host while the pages declare another sends search engines two
 *  conflicting answers about which address is real. */
interface SitemapEntry {
  path: string;
  /** Image URLs on the page, so the work can surface in Google Images. */
  images?: string[];
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const BASE_URL = SITE_URL;
        // The archive's images, attached to the pages that show them. People
        // searching for "Tanzanian painting" often start in image search.
        const artworks = await listArtworks();
        const artworkImages = artworks
          .map((a) => a.image_path)
          .filter((u): u is string => Boolean(u))
          .slice(0, 1000);
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          ...disciplines.map((d) => ({
            path: d.slug,
            images: d.status === "live" ? artworkImages : undefined,
            changefreq: "weekly" as const,
            priority: d.status === "live" ? "0.9" : "0.8",
          })),
          { path: "/gallery", changefreq: "weekly", priority: "0.8", images: artworkImages },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/subscription", changefreq: "monthly", priority: "0.6" },
          // One page per painting, each carrying its own image.
          ...artworks.map((a) => ({
            path: artworkPath(a.id),
            changefreq: "monthly" as const,
            priority: "0.7",
            images: a.image_path ? [a.image_path] : undefined,
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            ...(e.images ?? []).map(
              (src) => `    <image:image><image:loc>${escapeXml(src)}</image:loc></image:image>`,
            ),
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

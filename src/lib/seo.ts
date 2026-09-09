/**
 * Canonical URL + structured-data helpers.
 *
 * SITE_URL is deliberately a constant rather than being derived from the
 * request: a canonical tag must always point at the production domain, even
 * when the page is served from a preview deployment. Change this one value
 * when a custom domain is connected.
 */
export const SITE_URL = "https://artesque.vercel.app";

export const absoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Route `head()` link entry pointing search engines at the canonical page. */
export const canonical = (path: string) => ({
  rel: "canonical",
  href: absoluteUrl(path),
});

/** Route `head()` script entry carrying a JSON-LD graph. */
export const jsonLd = (data: unknown) => ({
  type: "application/ld+json",
  children: JSON.stringify(data),
});

const STUDIO_NAME = "Artesque";
const TAGLINE = "The threshold to what's possible";

/** The artist and the studio, described once and reused across pages. */
export function artistGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Person", "Artist"],
        "@id": `${SITE_URL}/#artist`,
        name: "Miller S.K.",
        alternateName: STUDIO_NAME,
        url: SITE_URL,
        jobTitle: "Founder & Creative Director",
        description:
          "Founder of Artesque, a Tanzania-based studio working across five disciplines: painting, music, dance, sculpture and acrobatics.",
        knowsAbout: [
          "Painting",
          "Music",
          "Dance",
          "Sculpture",
          "Acrobatics",
          "Hyperrealism",
          "Portraiture",
          "Wildlife painting",
          "Mural painting",
        ],
        address: {
          "@type": "PostalAddress",
          addressCountry: "TZ",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: STUDIO_NAME,
        alternateName: `${STUDIO_NAME} — ${TAGLINE}`,
        description: TAGLINE,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#artist` },
      },
    ],
  };
}

/** FAQ markup — Google can render these as expandable answers in results. */
export function faqGraph(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/faq#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

interface ArtworkLike {
  id: string;
  title: string;
  description: string;
  medium: string;
  image: string;
  year: number;
  categoryLabel: string;
}

/** A gallery listing, so individual pieces can surface in image search. */
export function artworkListGraph(artworks: ArtworkLike[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/gallery#collection`,
    name: `${STUDIO_NAME} — Gallery`,
    url: absoluteUrl("/gallery"),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: artworks.length,
      itemListElement: artworks.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "VisualArtwork",
          name: a.title,
          description: a.description,
          artMedium: a.medium,
          artform: a.categoryLabel,
          image: a.image,
          dateCreated: String(a.year),
          creator: { "@id": `${SITE_URL}/#artist` },
        },
      })),
    },
  };
}

/**
 * Canonical URL + structured-data helpers.
 *
 * SITE_URL is deliberately a constant rather than being derived from the
 * request: a canonical tag must always point at the production domain, even
 * when the page is served from a preview deployment.
 *
 * It is the www host because that is the one that answers: Vercel is set to
 * 308 the bare millerartz.com across to www. A canonical must name the final
 * URL, not one that redirects, or search engines get two conflicting signals
 * about which address is the real one. If the primary domain is ever flipped
 * to the bare host in Vercel, flip this with it.
 */
export const SITE_URL = "https://www.millerartz.com";

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

const STUDIO_NAME = "MillerArtz";
const ARTIST_NAME = "Miller S.K.";

/** 1200x630, the size every major platform crops link previews to. */
export const OG_IMAGE = {
  url: absoluteUrl("/og-image.png"),
  width: 1200,
  height: 630,
  alt: "MillerArtz — the Tanzanian art studio of Miller S.K.",
};

/**
 * Terms the studio wants to be found by. Google has ignored the keywords meta
 * tag since 2009 and Bing gives it next to no weight, so this list is not what
 * gets the site ranked — the titles, descriptions, headings and structured
 * data below are. It is kept because a few smaller engines still read it and
 * it documents the intended search terms in one place.
 */
export const SEARCH_TERMS = [
  "MillerArtz",
  "Miller Artz",
  "Miller S.K.",
  "Miller",
  "Tanzanian artist",
  "Tanzanian art",
  "Tanzania",
  "art",
  "paintings",
  "African art",
  "East African artist",
  "hyperrealism",
  "portrait commissions",
  "wildlife paintings",
  "murals",
];

/**
 * Title, description and their social-card twins for one page.
 *
 * Titles stay under about 60 characters and descriptions under about 155,
 * which is roughly where Google truncates them. Each carries the studio name
 * and, where it reads naturally, "Tanzania" or the artist's name: those are
 * the terms people will actually type.
 */
export function seoMeta(title: string, description: string, path: string) {
  const url = absoluteUrl(path);
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}

interface SiteContact {
  instagram_url?: string;
  facebook_url?: string;
  email?: string;
  phone_primary?: string;
}

/**
 * Who the studio is, on every page.
 *
 * Three linked entities: the artist, the studio he founded, and the website.
 * This is what lets a search engine understand that "MillerArtz", "Miller
 * Artz" and "Miller S.K." all point at the same place, and it is what Google
 * draws on for a knowledge panel. `sameAs` ties the site to the Instagram and
 * Facebook profiles saved in the Studio — the strongest signal that they are
 * all one identity — so it is built from live settings, not hard-coded.
 */
export function siteGraph(contact?: SiteContact) {
  const sameAs = [contact?.instagram_url, contact?.facebook_url].filter(
    (u): u is string => Boolean(u && u.trim()),
  );
  const country = { "@type": "Country", name: "Tanzania" };
  const disciplines = [
    "Painting",
    "Hyperrealism",
    "Portraiture",
    "Wildlife painting",
    "Mural painting",
    "Music",
    "Dance",
    "Sculpture",
    "Acrobatics",
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#artist`,
        name: ARTIST_NAME,
        alternateName: ["Miller", "Miller SK"],
        url: absoluteUrl("/about"),
        jobTitle: "Visual Artist",
        description: `${ARTIST_NAME} is a Tanzanian visual artist and the founder of ${STUDIO_NAME}.`,
        nationality: country,
        homeLocation: country,
        worksFor: { "@id": `${SITE_URL}/#studio` },
        knowsAbout: disciplines,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#studio`,
        name: STUDIO_NAME,
        alternateName: "Miller Artz",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo-512.png"),
          width: 512,
          height: 512,
        },
        image: OG_IMAGE.url,
        description: `The Tanzanian art studio of ${ARTIST_NAME}, working across painting, music, dance, sculpture and acrobatics.`,
        founder: { "@id": `${SITE_URL}/#artist` },
        address: { "@type": "PostalAddress", addressCountry: "TZ" },
        areaServed: country,
        knowsAbout: disciplines,
        ...(contact?.email ? { email: contact.email } : {}),
        ...(contact?.phone_primary ? { telephone: contact.phone_primary } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        // Google uses these for the site name shown above a result.
        name: STUDIO_NAME,
        alternateName: ["Miller Artz", `${STUDIO_NAME} Tanzania`],
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#studio` },
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

/** A department, as its own service offered by the studio. Lets each
 *  discipline surface on its own terms in search rather than every page
 *  competing as "MillerArtz". */
export function departmentGraph(d: {
  label: string;
  slug: string;
  tagline: string;
  intro: string;
  offerings: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${d.slug}#service`,
    name: `${d.label} — ${STUDIO_NAME}`,
    serviceType: d.label,
    description: d.intro,
    url: absoluteUrl(d.slug),
    provider: { "@id": `${SITE_URL}/#studio` },
    areaServed: { "@type": "Country", name: "Tanzania" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${d.label} commissions`,
      itemListElement: d.offerings.map((o) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: o },
      })),
    },
  };
}

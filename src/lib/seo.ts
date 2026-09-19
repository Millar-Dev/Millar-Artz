import { normalizeProfileUrl, savedProfiles } from "./social";
import { parseCoords, pinUrl } from "./map";
import { LANGS, localizePath, type Lang } from "./i18n";

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

/** Route `head()` link entry pointing search engines at the canonical page.
 *  A Swahili page is its own canonical — not a duplicate of the English one —
 *  and the two are tied together by the hreflang links in the root route. */
export const canonical = (path: string, lang: Lang = "en") => ({
  rel: "canonical",
  href: absoluteUrl(localizePath(path, lang)),
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
  alt: "MillerArtz — the Arusha, Tanzania art studio of Miller S.K.",
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
  "Miller Sunday Kitumi",
  "Miller Kitumi",
  "Millar Kitumi",
  "Miller",
  "Arusha artist",
  "artist in Arusha",
  "Arusha",
  "Tanzanian artist",
  "Tanzanian painter",
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
 *
 * The share image is set here, per page, rather than once site-wide: a page
 * can't remove a tag its parent route set, so a painting page would otherwise
 * inherit the default image's 1200x630 dimensions for a photo of a different
 * size. Dimensions are only stated when they're known to be exact.
 */
export function seoMeta(
  title: string,
  description: string,
  path: string,
  image: { url: string; alt: string; width?: number; height?: number } = OG_IMAGE,
  lang: Lang = "en",
) {
  const url = absoluteUrl(localizePath(path, lang));
  return [
    { property: "og:locale", content: LANGS.find((l) => l.code === lang)!.locale },
    ...LANGS.filter((l) => l.code !== lang).map((l) => ({
      property: "og:locale:alternate",
      content: l.locale,
    })),
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image.url },
    { property: "og:image:alt", content: image.alt },
    ...(image.width && image.height
      ? [
          { property: "og:image:width", content: String(image.width) },
          { property: "og:image:height", content: String(image.height) },
        ]
      : []),
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image.url },
  ];
}

interface SiteContact {
  google_profile_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  map_url?: string;
  map_coords?: string;
  email?: string;
  phone_primary?: string;
}

/**
 * Who the studio is, on every page.
 *
 * Three linked entities: the artist, the studio he founded, and the website.
 * This is what lets a search engine understand that "MillerArtz", "Miller
 * Artz" and "Miller S.K." all point at the same place, and it is what Google
 * draws on for a knowledge panel. `sameAs` ties the site to the Instagram,
 * Facebook, TikTok and YouTube profiles saved in the Studio — the strongest signal that they are
 * all one identity — so it is built from live settings, not hard-coded.
 */
export function siteGraph(contact?: SiteContact) {
  // The Google Business Profile belongs in sameAs with the social accounts:
  // it is the strongest signal that the website and the business Google
  // already knows about are one and the same studio.
  const sameAs = [
    ...savedProfiles(contact).map((p) => p.href),
    normalizeProfileUrl(contact?.google_profile_url),
  ].filter(Boolean);
  const country = { "@type": "Country", name: "Tanzania" };
  // City-level address. The exact pin is added below only when the owner has
  // saved a map link — publishing it is their choice, made in the Studio.
  const pin = parseCoords(contact?.map_coords);
  const arusha = {
    "@type": "Place",
    name: "Arusha, Tanzania",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Arusha",
      addressRegion: "Arusha",
      addressCountry: "TZ",
    },
  };
  // Based in Arusha, working for collectors anywhere: the FAQ already offers
  // international shipping, quoted per piece.
  const served = [country, { "@type": "Place", name: "Worldwide" }];
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
        // The full name and the spellings people search by. "Millar" is how
        // the artist's own Instagram handle spells it.
        givenName: "Miller",
        additionalName: "Sunday",
        familyName: "Kitumi",
        alternateName: [
          "Miller Sunday Kitumi",
          "Miller Kitumi",
          "Millar Kitumi",
          "Miller SK",
          "Miller",
        ],
        url: absoluteUrl("/about"),
        jobTitle: "Visual Artist",
        description: `${ARTIST_NAME} (Miller Sunday Kitumi) is a Tanzanian visual artist based in Arusha and the founder of ${STUDIO_NAME}.`,
        nationality: country,
        homeLocation: arusha,
        workLocation: arusha,
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
        description: `The Arusha, Tanzania art studio of ${ARTIST_NAME}, working across painting, music, dance, sculpture and acrobatics for collectors in Tanzania and worldwide.`,
        founder: { "@id": `${SITE_URL}/#artist` },
        address: arusha.address,
        location: arusha,
        ...(pin
          ? {
              geo: { "@type": "GeoCoordinates", latitude: pin.lat, longitude: pin.lng },
              hasMap: contact?.map_url?.trim() || pinUrl(pin),
            }
          : {}),
        areaServed: served,
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
        alternateName: ["Miller Artz", `${STUDIO_NAME} Arusha`, `${STUDIO_NAME} Tanzania`],
        inLanguage: ["en", "sw"],
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

/** A painting's own address. */
export const artworkPath = (id: string) => `/gallery/${encodeURIComponent(id)}`;

/**
 * One painting, for its own page: the artwork, who made it, where it sits in
 * the site, and — only when it is actually for sale at a stated price — an
 * offer. "On request" and sold pieces carry no offer rather than a made-up one.
 */
export function artworkGraph(
  a: ArtworkLike & {
    price: number | null;
    currency: string;
    status: string;
    widthCm?: number | null;
    heightCm?: number | null;
  },
) {
  const url = absoluteUrl(artworkPath(a.id));
  const forSale = a.price != null && a.status === "available";
  const cm = (value: number) => ({ "@type": "QuantitativeValue", value, unitCode: "CMT" });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VisualArtwork",
        "@id": `${url}#artwork`,
        name: a.title,
        url,
        image: a.image,
        description: a.description,
        artMedium: a.medium,
        artform: a.categoryLabel,
        dateCreated: String(a.year),
        ...(a.widthCm && a.heightCm ? { width: cm(a.widthCm), height: cm(a.heightCm) } : {}),
        creator: { "@id": `${SITE_URL}/#artist` },
        ...(forSale
          ? {
              offers: {
                "@type": "Offer",
                price: a.price,
                priceCurrency: a.currency || "TZS",
                availability: "https://schema.org/InStock",
                url,
                seller: { "@id": `${SITE_URL}/#studio` },
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Gallery", item: absoluteUrl("/gallery") },
          { "@type": "ListItem", position: 3, name: a.title, item: url },
        ],
      },
    ],
  };
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
          "@id": `${absoluteUrl(artworkPath(a.id))}#artwork`,
          url: absoluteUrl(artworkPath(a.id)),
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
    areaServed: [
      { "@type": "Country", name: "Tanzania" },
      { "@type": "Place", name: "Worldwide" },
    ],
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

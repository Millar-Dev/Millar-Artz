import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { getSiteSettings } from "@/lib/data/site-settings";
import { absoluteUrl, jsonLd, SEARCH_TERMS, siteGraph } from "@/lib/seo";
import { langFromPath, localizePath, useLang, useT } from "@/lib/i18n";
import { VisitTracker } from "@/components/site/VisitTracker";
import { CurrencyProvider } from "@/components/site/CurrencyProvider";

function NotFoundComponent() {
  const t = useT();
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      {/* Without this the browser tab is blank on any mistyped link. */}
      <title>{t("Page not found — MillerArtz")}</title>
      <div className="max-w-md text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
          MillerArtz
        </p>
        <h1 className="mt-6 font-display font-bold text-7xl text-ink">404</h1>
        <h2 className="mt-4 font-display font-bold text-2xl text-ink">
          {t("Page not found")}
        </h2>
        <p className="mt-3 text-sm text-ink/60">
          {t("This canvas is blank. The page you're looking for isn't part of the collection.")}
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-band transition-colors hover:bg-gold-soft"
          >
            {t("Return home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const lang = useLang();
  const t = useT();

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display font-bold text-2xl text-ink">
          {t("This page didn't load")}
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          {t("Something went wrong. You can try again or return to the studio.")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-band transition-colors hover:bg-gold-soft"
          >
            {t("Try again")}
          </button>
          <a
            href={localizePath("/", lang)}
            className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-canvas px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink/5"
          >
            {t("Go home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    // Which language this address is in, for every route's head() below.
    beforeLoad: ({ location }) => ({ lang: langFromPath(location.publicHref) }),
    head: ({ loaderData, matches }) => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "author", content: "Miller S.K." },
        { name: "keywords", content: SEARCH_TERMS.join(", ") },
        { name: "theme-color", content: "#2E1620" },
        // Explicitly allow large image previews — the work is the point, and
        // Google otherwise defaults to a small thumbnail in results.
        {
          name: "robots",
          content: "index, follow, max-image-preview:large",
        },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "MillerArtz" },
        // The share image itself is set per page by seoMeta().
        { name: "twitter:card", content: "summary_large_image" },
        // ISO 3166-2 code for Arusha region.
        { name: "geo.region", content: "TZ-01" },
        { name: "geo.placename", content: "Arusha, Tanzania" },
      ],
      // Who the studio is, once, on every page. Built from the saved settings
      // so the social profiles count as the same identity.
      scripts: [jsonLd(siteGraph(loaderData))],
      links: [
        { rel: "stylesheet", href: appCss },
        // The same page in each language, so search engines show Swahili
        // speakers the Swahili page. The Studio is English-only.
        ...alternates(matches[matches.length - 1]?.pathname ?? "/"),
        /* SVG first for browsers that take it, PNG as the fallback. */
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        {
          rel: "icon",
          href: "/favicon-32.png",
          type: "image/png",
          sizes: "32x32",
        },
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap",
        },
      ],
    }),
    // Loaded once here rather than per-route, since the Footer (on every
    // page) needs the artist's contact details and social links.
    loader: () => getSiteSettings(),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

// Warm ivory is the brand's primary background, so light is the default state
// and the plum-ink night mode is opt-in. This runs before first paint so a
// saved "dark" preference never flashes the light theme first.
const themeBootScript = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

function alternates(path: string) {
  if (/^\/studio(\/|$)/.test(path)) return [];
  return [
    { rel: "alternate", hrefLang: "en", href: absoluteUrl(localizePath(path, "en")) },
    { rel: "alternate", hrefLang: "sw", href: absoluteUrl(localizePath(path, "sw")) },
    { rel: "alternate", hrefLang: "x-default", href: absoluteUrl(localizePath(path, "en")) },
  ];
}

function RootShell({ children }: { children: ReactNode }) {
  const lang = useLang();
  return (
    <html lang={lang}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const settings = Route.useLoaderData();

  return (
    <QueryClientProvider client={queryClient}>
      {/* One set of exchange rates and one currency choice for every page. */}
      <CurrencyProvider settings={settings}>
        <Outlet />
      </CurrencyProvider>
      <VisitTracker />
    </QueryClientProvider>
  );
}

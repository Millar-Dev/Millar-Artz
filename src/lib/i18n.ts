import { useRouterState } from "@tanstack/react-router";
import { sw } from "./i18n-sw";

/**
 * English and Kiswahili.
 *
 * Each language has its own addresses — /gallery and /sw/gallery — rather
 * than a toggle that swaps the text in place, because search engines index
 * URLs, not toggles: a Swahili search can only find a Swahili page that has
 * an address of its own.
 *
 * The routes themselves don't know about languages. The router strips `/sw`
 * off an incoming address and puts it back on every link it builds (see
 * `langRewrite`), so every existing <Link to="/gallery"> stays correct in both
 * languages without being touched.
 *
 * Copy is translated by its English wording: `t("Full archive")`. Anything
 * without a Swahili entry falls back to English, so a sentence edited later
 * shows in English until its translation catches up — never as a blank.
 */

export type Lang = "en" | "sw";

export const LANGS: { code: Lang; label: string; short: string; locale: string }[] = [
  { code: "en", label: "English", short: "EN", locale: "en_GB" },
  { code: "sw", label: "Kiswahili", short: "SW", locale: "sw_TZ" },
];

/** Pages that stay English-only and never take the prefix. */
const UNPREFIXED = [/^\/studio(\/|$)/, /^\/sitemap\.xml$/, /^\/robots\.txt$/];

const SW_PREFIX = /^\/sw(?=\/|$|\?|#)/i;

/** The language a public address is in. */
export function langFromPath(href: string | undefined): Lang {
  return href && SW_PREFIX.test(href) ? "sw" : "en";
}

/** A router path, as it's addressed in the given language. */
export function localizePath(path: string, lang: Lang) {
  const clean = path.replace(SW_PREFIX, "") || "/";
  if (lang === "en" || UNPREFIXED.some((r) => r.test(clean))) return clean;
  return clean === "/" ? "/sw" : `/sw${clean}`;
}

/**
 * The router's URL rewrite. One per router instance — and the server builds a
 * router per request — so the remembered language never leaks between
 * visitors. It can be remembered rather than recomputed because switching
 * language is a full page load: a router only ever serves one language.
 */
export function langRewrite() {
  let lang: Lang = "en";
  return {
    input: ({ url }: { url: URL }) => {
      if (SW_PREFIX.test(url.pathname)) {
        lang = "sw";
        url.pathname = url.pathname.replace(SW_PREFIX, "") || "/";
      }
      return url;
    },
    output: ({ url }: { url: URL }) => {
      if (lang === "sw") url.pathname = localizePath(url.pathname, "sw");
      return url;
    },
  };
}

type Vars = Record<string, string | number>;

/** Translate one piece of English copy. `{name}` placeholders are filled from
 *  `vars` after translation, so the Swahili can put them where its grammar
 *  wants them. */
export function translate(lang: Lang, text: string, vars?: Vars) {
  // Trimmed as a fallback: values typed into the Studio (a medium, a
  // category) often carry a stray trailing space.
  let out = lang === "sw" ? (sw[text] ?? sw[text.trim()] ?? text) : text;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

export const translator = (lang: Lang) => (text: string, vars?: Vars) =>
  translate(lang, text, vars);

/** The language of the page being shown. */
export function useLang(): Lang {
  return useRouterState({ select: (s) => langFromPath(s.location.publicHref) });
}

/** `const t = useT()` then `t("Full archive")`. */
export function useT() {
  return translator(useLang());
}

/** The router's current internal path (no language prefix), for building the
 *  link to the same page in the other language. */
export function useInternalPath() {
  return useRouterState({ select: (s) => s.location.pathname + s.location.searchStr });
}

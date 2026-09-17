import { LANGS, localizePath, useInternalPath, useLang } from "@/lib/i18n";

/**
 * EN · SW. A plain link rather than a router navigation: the other language is
 * a different address, and a full load lets the router start fresh in it.
 * The visitor stays on the same page, with the same filters.
 */
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const lang = useLang();
  const path = useInternalPath();

  return (
    <div className={`flex items-center text-[10px] font-bold tracking-[0.12em] ${className}`}>
      {LANGS.map((l, i) => (
        <span key={l.code} className="flex items-center">
          {i > 0 && <span aria-hidden="true" className="px-1 opacity-40">·</span>}
          {l.code === lang ? (
            <span aria-current="true" className="text-gold">
              {l.short}
            </span>
          ) : (
            <a
              href={localizePath(path, l.code)}
              hrefLang={l.code}
              lang={l.code}
              title={l.label}
              aria-label={l.label}
              className="opacity-70 transition-opacity hover:opacity-100 hover:text-gold"
            >
              {l.short}
            </a>
          )}
        </span>
      ))}
    </div>
  );
}

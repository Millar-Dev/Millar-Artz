import { Link, useLoaderData } from "@tanstack/react-router";
import { disciplines } from "@/lib/gallery-data";
import { MessageCircle, Mail } from "lucide-react";
import { savedProfiles } from "@/lib/social";
import { SocialIcon } from "./SocialIcon";
import { BrandLockup } from "./BrandLogo";
import { SETTING_DEFAULTS } from "@/lib/data/site-settings";
import { useT } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  // Contact details and social links come from the root loader so they're
  // editable in the Studio without a deploy.
  const settings =
    useLoaderData({ from: "__root__", structuralSharing: false }) ??
    SETTING_DEFAULTS;

  return (
    <footer className="grain relative border-t border-white/5 bg-band py-20 text-band-foreground">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <BrandLockup
              className="mb-6 text-[15px] text-band-foreground"
              markClassName="h-10 w-auto"
            />
            <p className="text-sm leading-relaxed text-band-foreground/50">
              {t("One threshold, five disciplines — painting, music, dance, sculpture and acrobatics, under one roof in Arusha, Tanzania.")}
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
              {t("Connect")}
            </h4>
            <div className="space-y-3 text-sm text-band-foreground/70">
              {settings.phone_primary && (
                <a
                  href={`tel:${settings.phone_primary.replace(/\s/g, "")}`}
                  className="block hover:text-gold"
                >
                  {settings.phone_primary}
                </a>
              )}
              {settings.phone_secondary && (
                <a
                  href={`tel:${settings.phone_secondary.replace(/\s/g, "")}`}
                  className="block hover:text-gold"
                >
                  {settings.phone_secondary}
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="block hover:text-gold"
                >
                  {settings.email}
                </a>
              )}
              <p>Arusha, Tanzania</p>
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
              {t("Departments")}
            </h4>
            <div className="space-y-3 text-sm text-band-foreground/70">
              {disciplines.map((d) => (
                <Link key={d.id} to={d.slug} className="block hover:text-gold">
                  {t(d.label)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
              {t("Explore")}
            </h4>
            <div className="space-y-3 text-sm text-band-foreground/70">
              <Link to="/gallery" className="block hover:text-gold">
                {t("Full archive")}
              </Link>
              <Link to="/about" className="block hover:text-gold">
                {t("About Us")}
              </Link>
              <Link
                to="/contact"
                search={{ type: "commission" }}
                className="block hover:text-gold"
              >
                {t("Commission a Piece")}
              </Link>
              <Link to="/faq" className="block hover:text-gold">
                {t("FAQ")}
              </Link>
              <Link to="/subscription" className="block hover:text-gold">
                {t("Subscription")}
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
              {t("Newsletter")}
            </h4>
            <Link
              to="/subscription"
              className="inline-flex items-center gap-2 border-b border-band-foreground/20 pb-2 text-sm text-band-foreground transition-colors hover:border-gold hover:text-gold"
            >
              {t("Join the Collector's Circle →")}
            </Link>
            <div className="mt-6 flex gap-4">
              {/* Only rendered once a real profile URL is saved in the Studio —
                  an icon linking to instagram.com's homepage is worse than none. */}
              {savedProfiles(settings).map((p) => (
                <a
                  key={p.key}
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  aria-label={p.label}
                  className="text-band-foreground/60 hover:text-gold"
                >
                  <SocialIcon platform={p.key} size={18} />
                </a>
              ))}
              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener"
                  aria-label="WhatsApp"
                  className="text-band-foreground/60 hover:text-gold"
                >
                  <MessageCircle size={18} />
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  aria-label="Email"
                  className="text-band-foreground/60 hover:text-gold"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-band-foreground/5 pt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-band-foreground/30 sm:flex-row sm:items-center">
          <p>
            {t("© {year} MillerArtz Studio. All rights reserved.", { year: new Date().getFullYear() })}
          </p>
          <p>{t("Where imagination meets creativity.")}</p>
        </div>
      </div>
    </footer>
  );
}

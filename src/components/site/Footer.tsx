import { Link, useLoaderData } from "@tanstack/react-router";
import { Instagram, MessageCircle, Facebook, Mail } from "lucide-react";
import brandLogo from "@/assets/brand/miller-artz-logo-full.jpg";
import { SETTING_DEFAULTS } from "@/lib/data/site-settings";

export function Footer() {
  // Contact details and social links come from the root loader so they're
  // editable in the Studio without a deploy.
  const settings =
    useLoaderData({ from: "__root__", structuralSharing: false }) ??
    SETTING_DEFAULTS;

  return (
    <footer className="grain relative border-t border-white/5 bg-band py-20 text-band-foreground">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-12 md:grid-cols-4">
          <div>
            <div className="mb-6 inline-block rounded-md bg-[#f8f4ec] p-2 shadow-lg">
              <img src={brandLogo} alt="Miller Artz" className="h-14 w-auto" />
            </div>
            <p className="text-sm leading-relaxed text-band-foreground/50">
              Transforming ideas and memories into timeless works of art through
              creative excellence — across nine disciplines, and counting.
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
              Connect
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
              <p>Tanzania</p>
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
              Explore
            </h4>
            <div className="space-y-3 text-sm text-band-foreground/70">
              <Link to="/gallery" className="block hover:text-gold">
                Gallery
              </Link>
              <Link to="/about" className="block hover:text-gold">
                About Us
              </Link>
              <Link
                to="/contact"
                search={{ type: "commission" }}
                className="block hover:text-gold"
              >
                Commission a Piece
              </Link>
              <Link to="/faq" className="block hover:text-gold">
                FAQ
              </Link>
              <Link to="/subscription" className="block hover:text-gold">
                Subscription
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-band-foreground">
              Newsletter
            </h4>
            <Link
              to="/subscription"
              className="inline-flex items-center gap-2 border-b border-band-foreground/20 pb-2 text-sm text-band-foreground transition-colors hover:border-gold hover:text-gold"
            >
              Join the Collector's Circle →
            </Link>
            <div className="mt-6 flex gap-4">
              {/* Only rendered once a real profile URL is saved in the Studio —
                  an icon linking to instagram.com's homepage is worse than none. */}
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  className="text-band-foreground/60 hover:text-gold"
                >
                  <Instagram size={18} />
                </a>
              )}
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener"
                  aria-label="Facebook"
                  className="text-band-foreground/60 hover:text-gold"
                >
                  <Facebook size={18} />
                </a>
              )}
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
            © {new Date().getFullYear()} Miller Artz Studio. All rights
            reserved.
          </p>
          <p>Where imagination meets creativity.</p>
        </div>
      </div>
    </footer>
  );
}

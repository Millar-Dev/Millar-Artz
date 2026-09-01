import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, Facebook, Mail } from "lucide-react";
import brandLogo from "@/assets/brand/miller-artz-logo-full.jpg";

export function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-canvas py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid gap-12 md:grid-cols-4">
          <div>
            <img src={brandLogo} alt="Miller Artz" className="mb-6 h-16 w-auto rounded-sm" />
            <p className="text-sm leading-relaxed text-ink/50">
              Transforming ideas and memories into timeless works of art through creative excellence —
              across nine disciplines, and counting.
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink">Connect</h4>
            <div className="space-y-3 text-sm text-ink/70">
              <a href="tel:+255616110100" className="block hover:text-gold">+255 616 110 100</a>
              <a href="tel:+255754300543" className="block hover:text-gold">+255 754 300 543</a>
              <a href="mailto:studio@millerartz.com" className="block hover:text-gold">studio@millerartz.com</a>
              <p>Tanzania</p>
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink">Explore</h4>
            <div className="space-y-3 text-sm text-ink/70">
              <Link to="/gallery" className="block hover:text-gold">Gallery</Link>
              <Link to="/about" className="block hover:text-gold">About Us</Link>
              <Link to="/contact" search={{ type: "commission" }} className="block hover:text-gold">
                Commission a Piece
              </Link>
              <Link to="/subscription" className="block hover:text-gold">Subscription</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink">Newsletter</h4>
            <Link
              to="/subscription"
              className="inline-flex items-center gap-2 border-b border-ink/20 pb-2 text-sm text-ink transition-colors hover:border-gold hover:text-gold"
            >
              Join the Collector's Circle →
            </Link>
            <div className="mt-6 flex gap-4">
              <a href="https://instagram.com" aria-label="Instagram" className="text-ink/60 hover:text-gold"><Instagram size={18} /></a>
              <a href="https://facebook.com" aria-label="Facebook" className="text-ink/60 hover:text-gold"><Facebook size={18} /></a>
              <a href="https://wa.me/255616110100" aria-label="WhatsApp" className="text-ink/60 hover:text-gold"><MessageCircle size={18} /></a>
              <a href="mailto:studio@millerartz.com" aria-label="Email" className="text-ink/60 hover:text-gold"><Mail size={18} /></a>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-ink/5 pt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/30 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Miller Artz Studio. All rights reserved.</p>
          <p>Where imagination meets creativity.</p>
        </div>
      </div>
    </footer>
  );
}

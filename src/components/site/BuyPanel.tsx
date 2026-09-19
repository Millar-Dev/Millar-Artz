import { Link, useLoaderData } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useCurrency } from "./CurrencyProvider";
import { formatSizeShort } from "@/lib/artwork-size";
import { localizePath, useLang, useT } from "@/lib/i18n";
import { absoluteUrl, artworkPath } from "@/lib/seo";
import { SETTING_DEFAULTS } from "@/lib/data/site-settings";
import type { Artwork } from "@/lib/gallery-data";

function useSettings() {
  return useLoaderData({ from: "__root__", structuralSharing: false }) ?? SETTING_DEFAULTS;
}

/**
 * "Buy this piece": a WhatsApp message to the studio with the piece, its size
 * and the price the visitor was looking at already written.
 *
 * An available painting used to lead only to the contact form — a lead
 * capture, not a purchase. WhatsApp is how most buyers here already reach the
 * studio, and a prefilled message means the first reply can be about payment
 * rather than "which one?".
 */
export function BuyButton({ artwork: a, className = "" }: { artwork: Artwork; className?: string }) {
  const t = useT();
  const lang = useLang();
  const settings = useSettings();
  const { price } = useCurrency();
  if (a.status !== "available" || a.price == null || !settings.whatsapp_number) return null;

  const view = price(a.price, a.currency);
  const shown = view.approximate ? `${view.display} (${view.original})` : view.display;
  const details = [t(a.medium).trim(), formatSizeShort(a.widthCm, a.heightCm, t("cm"))]
    .filter(Boolean)
    .join(", ");
  const message = t('Hi Miller, I\'d like to buy "{title}" ({details}) listed at {price}. {url}', {
    title: a.title,
    details,
    price: shown,
    url: absoluteUrl(localizePath(artworkPath(a.id), lang)),
  });

  return (
    <a
      href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener"
      data-track="buy_click"
      className={`inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-band hover:bg-gold-soft ${className}`}
    >
      <MessageCircle size={14} /> {t("Buy this piece")}
    </a>
  );
}

/**
 * How to pay and how it gets delivered, under the buy button. The numbers
 * come from the Studio settings, so a new phone number or account is one edit
 * there rather than a code change. Each line shows only once it's filled in.
 */
export function PaymentNote({ className = "" }: { className?: string }) {
  const t = useT();
  const s = useSettings();
  const rows: [string, React.ReactNode][] = [];
  if (s.payment_mobile) rows.push([t("M-Pesa & other mobile money"), s.payment_mobile]);
  if (s.payment_lipa_namba)
    rows.push([
      t("{bank} Lipa Namba", { bank: s.payment_lipa_bank || "Bank" }),
      [s.payment_lipa_namba, s.payment_lipa_name].filter(Boolean).join(" · "),
    ]);
  // PayPal the way most independent sellers take it: an invoice sent once the
  // buyer has confirmed, payable by card or PayPal, with buyer and seller
  // protection — and no email address published on the page. A PayPal.me link,
  // if one is ever saved in the Studio, is offered as well.
  if (s.paypal_name || s.paypal_link)
    rows.push([
      t("PayPal (international)"),
      <>
        {t("Invoice from {name}, sent after you confirm", { name: s.paypal_name || "PayPal" })}
        {s.paypal_link && (
          <>
            {" · "}
            <a href={s.paypal_link} target="_blank" rel="noopener" className="underline hover:text-ink">
              {t("or pay by link")}
            </a>
          </>
        )}
      </>,
    ]);

  return (
    <div className={`border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/65 ${className}`}>
      {rows.length > 0 && (
        <dl className="space-y-1.5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-x-4">
              <dt className="text-[10px] uppercase tracking-widest text-ink/50">{label}</dt>
              <dd className="font-medium text-ink/80">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-3">
        {t("Confirm the piece is still available on WhatsApp, then pay in full before delivery. Packing and worldwide delivery are arranged per piece.")}{" "}
        <Link to="/faq" hash="payment" className="underline hover:text-ink">
          {t("How payment works")}
        </Link>
        {" · "}
        <Link to="/faq" hash="delivery" className="underline hover:text-ink">
          {t("Delivery")}
        </Link>
      </p>
    </div>
  );
}

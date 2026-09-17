import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BASE_CURRENCY,
  budgetOptions,
  CURRENCIES,
  describeRate,
  isCurrency,
  parseBands,
  parseRates,
  viewPrice,
  type CurrencyCode,
  type Rates,
} from "@/lib/currency";
import { translator, useLang, useT } from "@/lib/i18n";

/**
 * One currency choice for the whole visit.
 *
 * The owner's rates arrive with the site settings the root route already
 * loads, so every page converts from the same numbers. The visitor's choice is
 * remembered in this browser only — a convenience, not an account setting.
 * Server rendering always uses the owner's default; a remembered choice is
 * applied once the page is live, so the two never disagree mid-hydration.
 */

const STORAGE_KEY = "millerartz:currency";

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Rates;
  ratesUpdated: string;
  price: (amount: number, from: string) => ReturnType<typeof viewPrice>;
  budgets: () => ReturnType<typeof budgetOptions>;
}

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({
  settings,
  children,
}: {
  settings?: {
    display_currency?: string;
    currency_rates?: string;
    rates_updated?: string;
    budget_bands?: string;
  };
  children: ReactNode;
}) {
  const fallback: CurrencyCode = isCurrency(settings?.display_currency)
    ? settings.display_currency
    : BASE_CURRENCY;
  const [currency, setCurrencyState] = useState<CurrencyCode>(fallback);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isCurrency(saved)) setCurrencyState(saved);
    } catch {
      /* storage blocked — keep the default */
    }
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* storage blocked — the choice lasts this page only */
    }
  }, []);

  const rates = useMemo(() => parseRates(settings?.currency_rates), [settings?.currency_rates]);
  const bands = useMemo(() => parseBands(settings?.budget_bands), [settings?.budget_bands]);

  const value = useMemo<CurrencyState>(
    () => ({
      currency,
      setCurrency,
      rates,
      ratesUpdated: settings?.rates_updated ?? "",
      price: (amount, from) => viewPrice(amount, from, currency, rates),
      budgets: () => budgetOptions(bands, currency, rates),
    }),
    [currency, setCurrency, rates, bands, settings?.rates_updated],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}

/** Regions in list order, for grouping the switch. */
export const REGIONS = [...new Set(CURRENCIES.map((c) => c.region))];

/** The visitor's switch. Labelled with the code and a name, since "KSh" alone
 *  means nothing to someone outside East Africa. */
export function CurrencySelect({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const t = useT();
  return (
    <label className={`inline-flex items-center gap-2 text-xs text-ink/60 ${className}`}>
      <span>{t("Show prices in")}</span>
      <select
        value={currency}
        onChange={(e) => isCurrency(e.target.value) && setCurrency(e.target.value)}
        className="rounded-sm border border-ink/15 bg-paper px-2 py-1.5 text-xs font-medium text-ink focus:border-gold focus:outline-none"
      >
        {REGIONS.map((region) => (
          <optgroup key={region} label={t(region)}>
            {CURRENCIES.filter((c) => c.region === region).map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {t(c.name)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

/** "1 USD = TSh 2,646 (set 17 Sep 2026)" — or per 1,000 for small units. */
export function RateNote({ className = "text-ink/50" }: { className?: string }) {
  const { currency, rates, ratesUpdated } = useCurrency();
  const lang = useLang();
  const t = translator(lang);
  if (currency === BASE_CURRENCY) return null;
  const when = ratesUpdated
    ? new Date(`${ratesUpdated}T12:00:00`).toLocaleDateString(lang === "sw" ? "sw-TZ" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  return (
    <p className={`text-[11px] leading-snug ${className}`}>
      {t(
        "Prices are set in Tanzanian shillings and converted at the studio's rate of {rate}{when}. Converted figures are a guide — your quotation confirms the exact amount.",
        { rate: describeRate(currency, rates), when: when ? t(" (set {date})", { date: when }) : "" },
      )}
    </p>
  );
}

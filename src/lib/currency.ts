/**
 * Prices, currencies and the studio's exchange rates.
 *
 * The Tanzanian shilling is the base: it is what the artist prices in (20 of
 * the first 24 pieces were already set in TZS) and what every rate is
 * expressed against. A visitor can view prices in any currency below, but a
 * converted figure is always shown as approximate and the shilling price stays
 * the authoritative one — the quotation confirms what is actually paid.
 *
 * Rates are set by the owner in the Studio, not fetched live on every page.
 * That keeps every page agreeing with every other page and with what the
 * artist quotes, rather than drifting a little with each market tick.
 *
 * Pure module — no React, no server imports — so pages, the Studio and
 * structured data can all share it.
 */

export const BASE_CURRENCY = "TZS";

export const CURRENCIES = [
  { code: "TZS", name: "Tanzanian shilling", symbol: "TSh" },
  { code: "USD", name: "US dollar", symbol: "US$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British pound", symbol: "£" },
  { code: "KES", name: "Kenyan shilling", symbol: "KSh" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

/** Shillings per one unit of each foreign currency. */
export type Rates = Record<Exclude<CurrencyCode, "TZS">, number>;

/**
 * Starting rates, taken from market rates on 17 September 2026. The owner is
 * expected to replace these from the Studio; they exist so conversion works
 * from the first deploy rather than showing nothing.
 */
export const DEFAULT_RATES: Rates = {
  USD: 2645.5,
  EUR: 3048.78,
  GBP: 3558.72,
  KES: 20.41,
};

/**
 * Budget bands on the enquiry form, as upper bounds in shillings. Set to the
 * studio's actual price level — most pieces sit between TSh 50,000 and
 * 400,000, the largest at 3,000,000 — rather than the dollar bands the form
 * used to carry, which put nearly the whole catalogue under the first option.
 */
export const DEFAULT_BUDGET_BANDS = [150_000, 400_000, 1_000_000, 3_000_000];

export const isCurrency = (v: unknown): v is CurrencyCode =>
  CURRENCIES.some((c) => c.code === v);

export const currencyInfo = (code: CurrencyCode) =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

/** Saved settings JSON → rates, falling back per currency on anything bad. */
export function parseRates(raw: string | undefined | null): Rates {
  const out: Rates = { ...DEFAULT_RATES };
  try {
    const parsed = JSON.parse(raw || "{}") as Record<string, unknown>;
    for (const code of Object.keys(out) as (keyof Rates)[]) {
      const n = Number(parsed[code]);
      if (Number.isFinite(n) && n > 0) out[code] = n;
    }
  } catch {
    /* keep defaults */
  }
  return out;
}

/**
 * "150,000, 400,000, …" → ascending positive thresholds, or the defaults.
 *
 * Commas do two jobs here — separating the list and grouping thousands — so
 * the input is read as numbers rather than split on commas: "150,000, 400000"
 * and "150000,400000" both give [150000, 400000].
 */
export function parseBands(raw: string | undefined | null): number[] {
  const bands = ((raw ?? "").match(/\d{1,3}(?:,\d{3})+|\d+/g) ?? [])
    .map((token) => Number(token.replace(/,/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  return bands.length ? [...new Set(bands)] : DEFAULT_BUDGET_BANDS;
}

const perUnit = (code: CurrencyCode, rates: Rates) =>
  code === BASE_CURRENCY ? 1 : rates[code as keyof Rates];

/** Convert between any two supported currencies via the shilling. */
export function convert(amount: number, from: CurrencyCode, to: CurrencyCode, rates: Rates) {
  if (from === to) return amount;
  return (amount * perUnit(from, rates)) / perUnit(to, rates);
}

/**
 * Rounds a converted figure to something a person would actually say. An
 * exact conversion like US$94.51 implies a precision the rate doesn't have.
 */
export function roundForDisplay(amount: number, code: CurrencyCode) {
  const step =
    code === "TZS"
      ? amount >= 1_000_000
        ? 10_000
        : 1_000
      : code === "KES"
        ? amount >= 10_000
          ? 100
          : 50
        : amount >= 1_000
          ? 10
          : amount >= 100
            ? 5
            : 1;
  return Math.max(step, Math.round(amount / step) * step);
}

/** "TSh 250,000", "US$95", "€80". */
export function formatMoney(amount: number, code: CurrencyCode) {
  const { symbol } = currencyInfo(code);
  const n = Math.round(amount).toLocaleString("en-US");
  // Shilling symbols read with a space; single-glyph symbols sit tight.
  return /^[A-Za-z]/.test(symbol) && !symbol.endsWith("$") ? `${symbol} ${n}` : `${symbol}${n}`;
}

export interface PriceView {
  /** What to show first, in the visitor's chosen currency. */
  display: string;
  /** True when `display` is a conversion rather than the set price. */
  approximate: boolean;
  /** The price as set, in its own currency — shown alongside a conversion. */
  original: string;
}

export function viewPrice(
  amount: number,
  from: string,
  to: CurrencyCode,
  rates: Rates,
): PriceView {
  const source: CurrencyCode = isCurrency(from) ? from : BASE_CURRENCY;
  const original = formatMoney(amount, source);
  if (source === to) return { display: original, approximate: false, original };
  const converted = roundForDisplay(convert(amount, source, to, rates), to);
  return { display: `≈ ${formatMoney(converted, to)}`, approximate: true, original };
}

/**
 * The enquiry form's budget options. Each carries a shilling label — what is
 * stored and what the artist reads — and a label in the visitor's currency.
 */
export function budgetOptions(bands: number[], to: CurrencyCode, rates: Rates) {
  const num = (n: number) => Math.round(n).toLocaleString("en-US");
  const inCurrency = (n: number) => roundForDisplay(convert(n, "TZS", to, rates), to);
  const foreign = to !== "TZS";

  const options: { value: string; label: string }[] = [];
  bands.forEach((upper, i) => {
    const lower = bands[i - 1];
    if (lower == null) {
      const value = `Under ${formatMoney(upper, "TZS")}`;
      options.push({
        value,
        label: foreign ? `Under ≈ ${formatMoney(inCurrency(upper), to)}  (TSh ${num(upper)})` : value,
      });
    } else {
      const value = `TSh ${num(lower)} – ${num(upper)}`;
      options.push({
        value,
        label: foreign
          ? `≈ ${formatMoney(inCurrency(lower), to)} – ${num(inCurrency(upper))}  (${value})`
          : value,
      });
    }
  });
  const top = bands[bands.length - 1];
  const topValue = `Over ${formatMoney(top, "TZS")}`;
  options.push({
    value: topValue,
    label: foreign ? `Over ≈ ${formatMoney(inCurrency(top), to)}  (TSh ${num(top)})` : topValue,
  });
  options.push({ value: "Let's discuss", label: "Let's discuss" });
  return options;
}

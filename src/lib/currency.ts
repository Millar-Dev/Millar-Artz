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

/**
 * Grouped by region so a long list stays scannable in the visitor's switch.
 * East Africa first: neighbouring buyers are the most frequent after local
 * ones. Symbols are the ones readers in each place actually use; the yuan and
 * yen are prefixed so their shared ¥ can't be confused.
 */
export const CURRENCIES = [
  { code: "TZS", name: "Tanzanian shilling", symbol: "TSh", region: "East Africa" },
  { code: "KES", name: "Kenyan shilling", symbol: "KSh", region: "East Africa" },
  { code: "UGX", name: "Ugandan shilling", symbol: "USh", region: "East Africa" },
  { code: "RWF", name: "Rwandan franc", symbol: "FRw", region: "East Africa" },
  { code: "BIF", name: "Burundian franc", symbol: "FBu", region: "East Africa" },
  { code: "USD", name: "US dollar", symbol: "US$", region: "Americas, Europe & Oceania" },
  { code: "EUR", name: "Euro", symbol: "€", region: "Americas, Europe & Oceania" },
  { code: "GBP", name: "British pound", symbol: "£", region: "Americas, Europe & Oceania" },
  { code: "CHF", name: "Swiss franc", symbol: "CHF", region: "Americas, Europe & Oceania" },
  { code: "CAD", name: "Canadian dollar", symbol: "CA$", region: "Americas, Europe & Oceania" },
  { code: "AUD", name: "Australian dollar", symbol: "A$", region: "Americas, Europe & Oceania" },
  { code: "CNY", name: "Chinese yuan", symbol: "CN¥", region: "Asia" },
  { code: "JPY", name: "Japanese yen", symbol: "JP¥", region: "Asia" },
  { code: "KRW", name: "South Korean won", symbol: "₩", region: "Asia" },
  { code: "INR", name: "Indian rupee", symbol: "₹", region: "Asia" },
  { code: "PKR", name: "Pakistani rupee", symbol: "Rs", region: "Asia" },
  { code: "AED", name: "UAE dirham", symbol: "AED", region: "Middle East" },
  { code: "SAR", name: "Saudi riyal", symbol: "SAR", region: "Middle East" },
  { code: "QAR", name: "Qatari riyal", symbol: "QAR", region: "Middle East" },
  { code: "ZAR", name: "South African rand", symbol: "R", region: "Southern Africa" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

/** Shillings per one unit of each foreign currency. */
export type Rates = Record<Exclude<CurrencyCode, "TZS">, number>;

/**
 * Starting rates, taken from market rates on 17 September 2026. The owner is
 * expected to replace these from the Studio; they exist so conversion works
 * from the first deploy rather than showing nothing. A saved rate set that
 * predates a currency falls back to its entry here.
 */
export const DEFAULT_RATES: Rates = {
  KES: 20.41,
  UGX: 0.6951,
  RWF: 1.789,
  BIF: 0.8859,
  USD: 2645.5,
  EUR: 3048.78,
  GBP: 3558.72,
  CHF: 3236.25,
  CAD: 1930.5,
  AUD: 1908.4,
  CNY: 393.7,
  JPY: 16.83,
  KRW: 1.964,
  INR: 27.94,
  PKR: 9.55,
  AED: 720.98,
  SAR: 705.72,
  QAR: 727.27,
  ZAR: 163.48,
};

/**
 * Budget bands on the enquiry form, as upper bounds in shillings. Set to the
 * studio's actual price level — most pieces sit between TSh 50,000 and
 * 400,000, the largest at 3,000,000 — rather than the dollar bands the form
 * used to carry, which put nearly the whole catalogue under the first option.
 */
export const DEFAULT_BUDGET_BANDS = [150_000, 400_000, 1_000_000, 3_000_000];

/**
 * How a rate reads in a sentence. A unit worth less than a shilling reads
 * badly as "1 UGX = TSh 0.70", so small currencies are quoted per 100 or
 * 1,000: "1,000 UGX = TSh 695", "100 KRW = TSh 196".
 */
export function describeRate(code: CurrencyCode, rates: Rates) {
  if (code === BASE_CURRENCY) return "";
  const rate = rates[code as keyof Rates];
  const per = rate < 1 ? 1000 : rate < 10 ? 100 : 1;
  const tsh = rate * per;
  const shown = tsh.toLocaleString("en-US", { maximumFractionDigits: tsh < 100 ? 2 : 0 });
  return `${per.toLocaleString("en-US")} ${code} = TSh ${shown}`;
}

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
 * Rounds a converted figure to something a person would actually say — three
 * significant figures, never below a whole unit. An exact conversion like
 * US$94.51 implies a precision the rate doesn't have. Magnitude-based rather
 * than per currency, so it holds for yen and won as well as dollars:
 * US$95, US$151, KSh 12,200, ₩127,000, TSh 1,190,000.
 */
export function roundForDisplay(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const step = Math.max(1, 10 ** (Math.floor(Math.log10(amount)) - 2));
  return Math.max(step, Math.round(amount / step) * step);
}

/** "TSh 250,000", "US$95", "€80", "AED 350". */
export function formatMoney(amount: number, code: CurrencyCode) {
  const { symbol } = currencyInfo(code);
  const n = Math.round(amount).toLocaleString("en-US");
  // Symbols ending in a letter read with a space (TSh 250,000, AED 350);
  // ones ending in a sign sit tight (US$95, ₹2,700, CN¥640).
  return /[A-Za-z]$/.test(symbol) ? `${symbol} ${n}` : `${symbol}${n}`;
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
  const converted = roundForDisplay(convert(amount, source, to, rates));
  return { display: `≈ ${formatMoney(converted, to)}`, approximate: true, original };
}

/**
 * The enquiry form's budget options. Each carries a shilling label — what is
 * stored and what the artist reads — and a label in the visitor's currency.
 */
export function budgetOptions(bands: number[], to: CurrencyCode, rates: Rates) {
  const num = (n: number) => Math.round(n).toLocaleString("en-US");
  const inCurrency = (n: number) => roundForDisplay(convert(n, "TZS", to, rates));
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

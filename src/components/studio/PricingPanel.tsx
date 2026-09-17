import { useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { updateSiteSettings, type SiteSettings } from "@/lib/data/site-settings";
import { fetchMarketRates } from "@/lib/data/currency-rates";
import {
  BASE_CURRENCY,
  budgetOptions,
  CURRENCIES,
  isCurrency,
  parseBands,
  parseRates,
  viewPrice,
  type CurrencyCode,
  type Rates,
} from "@/lib/currency";

/**
 * Where the studio's money settings live: the currency visitors see first,
 * the exchange rates every page converts with, and the budget bands on the
 * enquiry form. Saving here changes prices across the whole site at once.
 */

const FOREIGN = CURRENCIES.filter((c) => c.code !== BASE_CURRENCY);
const REGIONS = [...new Set(CURRENCIES.map((c) => c.region))];
/** A live example beside each rate, so its effect shows before saving. */
const example = 250_000;

/** Today in Tanzania, as YYYY-MM-DD. */
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Dar_es_Salaam" }).format(new Date());

export function PricingPanel({ initial }: { initial: SiteSettings }) {
  const savedRates = useMemo(() => parseRates(initial.currency_rates), [initial.currency_rates]);
  const [display, setDisplay] = useState<CurrencyCode>(
    isCurrency(initial.display_currency) ? initial.display_currency : BASE_CURRENCY,
  );
  const [rates, setRates] = useState<Record<string, string>>(() =>
    Object.fromEntries(FOREIGN.map((c) => [c.code, String(savedRates[c.code as keyof Rates])])),
  );
  const [bandsText, setBandsText] = useState(
    parseBands(initial.budget_bands).map((n) => n.toLocaleString("en-US")).join(", "),
  );
  const [ratesUpdated, setRatesUpdated] = useState(initial.rates_updated);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const parsedRates = useMemo<Rates | null>(() => {
    const out = {} as Rates;
    for (const { code } of FOREIGN) {
      const n = Number(String(rates[code]).replace(/,/g, ""));
      if (!Number.isFinite(n) || n <= 0) return null;
      out[code as keyof Rates] = n;
    }
    return out;
  }, [rates]);
  const bands = useMemo(() => parseBands(bandsText), [bandsText]);

  async function fillMarket() {
    setFetching(true);
    setError("");
    setNote("");
    try {
      const { rates: market, asOf } = await fetchMarketRates();
      setRates(Object.fromEntries(FOREIGN.map((c) => [c.code, String(market[c.code as keyof Rates])])));
      setNote(
        `Filled with market rates${asOf ? ` from ${new Date(asOf).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}. Check them, then save — nothing changes on the site until you do.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't fetch market rates.");
    } finally {
      setFetching(false);
    }
  }

  async function save() {
    if (!parsedRates) {
      setError("Every rate needs to be a number above zero.");
      return;
    }
    setBusy(true);
    setError("");
    setNote("");
    try {
      const changed = FOREIGN.some(
        (c) => parsedRates[c.code as keyof Rates] !== savedRates[c.code as keyof Rates],
      );
      const stamp = changed || !ratesUpdated ? today() : ratesUpdated;
      await updateSiteSettings({
        data: {
          display_currency: display,
          currency_rates: JSON.stringify(parsedRates),
          rates_updated: stamp,
          budget_bands: bands.join(","),
        },
      });
      setRatesUpdated(stamp);
      setNote("Saved. Prices across the site now use these rates.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <h2 className="font-display font-bold text-2xl text-ink">Prices &amp; currency</h2>
      <p className="mt-1 max-w-2xl text-xs text-ink/50">
        Enter artwork prices in Tanzanian shillings. Visitors can switch to another
        currency on the Gallery and Contact pages, and conversions use the rates below —
        shown as approximate, with the shilling price alongside.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
              Visitors first see prices in
            </span>
            <select
              value={display}
              onChange={(e) => isCurrency(e.target.value) && setDisplay(e.target.value)}
              className="mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-sm text-ink focus:border-gold focus:outline-none"
            >
              {REGIONS.map((region) => (
                <optgroup key={region} label={region}>
                  {CURRENCIES.filter((c) => c.region === region).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
                Exchange rates
              </span>
              <span className="text-[11px] text-ink/45">
                {ratesUpdated
                  ? `Last set ${new Date(`${ratesUpdated}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                  : "Not set yet"}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-ink/45">
              How many shillings one unit of each currency is worth. The grey figure
              is what a TSh 250,000 painting would show as.
            </p>
            <div className="mt-3 max-h-[26rem] space-y-5 overflow-y-auto pr-1">
              {REGIONS.filter((r) => FOREIGN.some((c) => c.region === r)).map((region) => (
                <div key={region}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/40">
                    {region}
                  </p>
                  <div className="mt-2 space-y-2.5">
                    {FOREIGN.filter((c) => c.region === region).map((c) => (
                      <label key={c.code} className="flex items-center gap-2 text-sm text-ink/75">
                        <span className="w-14 shrink-0 tabular-nums" title={c.name}>
                          1 {c.code}
                        </span>
                        <span className="text-ink/40">= TSh</span>
                        <input
                          inputMode="decimal"
                          value={rates[c.code]}
                          onChange={(e) => setRates((r) => ({ ...r, [c.code]: e.target.value }))}
                          className="w-24 border-b border-ink/20 bg-transparent py-1 text-right tabular-nums text-ink focus:border-gold focus:outline-none"
                          aria-label={`Shillings per ${c.name}`}
                        />
                        <span className="min-w-0 truncate text-xs tabular-nums text-ink/40">
                          {parsedRates ? viewPrice(example, "TZS", c.code, parsedRates).display : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={fillMarket}
              disabled={fetching}
              className="mt-4 inline-flex items-center gap-2 rounded-sm border border-ink/15 px-3 py-2 text-xs font-medium text-ink/75 hover:text-ink disabled:opacity-50"
            >
              {fetching ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Fill in today's market rates
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
              Enquiry budget bands (TSh, upper limits)
            </span>
            <input
              value={bandsText}
              onChange={(e) => setBandsText(e.target.value)}
              className="mt-2 w-full border-b border-ink/20 bg-transparent py-2 text-sm tabular-nums text-ink focus:border-gold focus:outline-none"
            />
          </label>
          <div className="border border-ink/10 bg-paper p-4 text-xs text-ink/65">
            <p className="font-medium text-ink/75">Clients will choose from:</p>
            <ul className="mt-2 space-y-1">
              {budgetOptions(bands, "TZS", parsedRates ?? savedRates).map((o) => (
                <li key={o.value}>{o.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-sm bg-gold px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-band disabled:opacity-50"
        >
          {busy && <Loader2 size={14} className="animate-spin" />} Save prices &amp; rates
        </button>
        {note && <span className="text-sm italic text-gold">{note}</span>}
        {error && <span className="text-sm text-red-700">{error}</span>}
      </div>
    </section>
  );
}

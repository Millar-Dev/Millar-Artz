import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { CURRENCIES, type Rates } from "../currency";

/**
 * Owner-only helper for the Studio's "fill in today's rates" button.
 *
 * It only suggests: the numbers land in the form and nothing changes on the
 * site until the owner saves. Pages never call this — they always use the
 * saved rates, so prices don't move under a visitor between page loads.
 */
export const fetchMarketRates = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ rates: Rates; asOf: string }> => {
    await requireAdmin();
    const res = await fetch("https://open.er-api.com/v6/latest/TZS", {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error("The rate service didn't respond. Try again, or enter rates by hand.");
    const body = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (body.result !== "success" || !body.rates) {
      throw new Error("The rate service returned no rates. Enter them by hand for now.");
    }

    // The service quotes foreign units per shilling; the Studio works in
    // shillings per foreign unit, which is how the rate is usually spoken.
    const rates = {} as Rates;
    for (const { code } of CURRENCIES) {
      if (code === "TZS") continue;
      const perShilling = body.rates[code];
      if (!perShilling || perShilling <= 0) {
        throw new Error(`No rate available for ${code}. Enter it by hand.`);
      }
      // Four significant figures: 2645.5 for the dollar, but 0.6951 for the
      // Ugandan shilling, where rounding to cents would lose 1%.
      rates[code] = Number((1 / perShilling).toPrecision(4));
    }
    return { rates, asOf: body.time_last_update_utc ?? "" };
  },
);

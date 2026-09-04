import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./admin-session";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface SubscriberRow {
  email: string;
  tier: string;
  created_at: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Public — called from the Subscription page. Idempotent: signing up twice
 *  with the same address updates the tier rather than erroring, so a repeat
 *  submission never shows the visitor a failure. */
export const subscribe = createServerFn({ method: "POST" })
  .validator((input: { email: string; tier?: string }) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (!isSupabaseConfigured()) {
      throw new Error("Subscriptions aren't available right now. Please try again later.");
    }
    const { error } = await getSupabaseAdmin()
      .from("subscribers")
      .upsert(
        { email, tier: data.tier === "premium" ? "premium" : "free" },
        { onConflict: "email" },
      );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listSubscribers = createServerFn({ method: "GET" }).handler(
  async (): Promise<SubscriberRow[]> => {
    await requireAdmin();
    const { data, error } = await getSupabaseAdmin()
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as SubscriberRow[];
  },
);

export const deleteSubscriber = createServerFn({ method: "POST" })
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin()
      .from("subscribers")
      .delete()
      .eq("email", email);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

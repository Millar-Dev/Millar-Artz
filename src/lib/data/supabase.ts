import { createClient } from "@supabase/supabase-js";

// Server-only: uses the service role key, which bypasses Row Level Security.
// Never import this file from client code — the importProtection config in
// vite.config.ts (files under src/lib/data/** that touch it end up inside a
// createServerFn handler, which the build strips from the client bundle).
let client: ReturnType<typeof createClient> | undefined;

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase isn't configured yet — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const ARTWORK_BUCKET = "site-images";

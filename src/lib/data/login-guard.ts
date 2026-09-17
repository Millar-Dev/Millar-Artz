// Called only from inside createServerFn handlers in admin-auth.ts. Takes the
// client address as an argument rather than reading the request itself, so
// nothing here needs a server-only import.
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

/**
 * Limits guesses at the Studio password.
 *
 * Before this, anyone could try passwords as fast and as often as they liked.
 * Now each connection gets five wrong tries within fifteen minutes, then is
 * locked out for fifteen minutes, and every wrong answer also costs a second,
 * which slows guessing even from many addresses at once.
 *
 * Attempts are kept in `site_settings` under a private `login_guard:` prefix,
 * so protection works without a database change. Those rows are never read
 * back out: the public settings loader and the Studio's save both accept only
 * known setting keys. Addresses are stored as salted hashes, not as IPs.
 */

export const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60_000;
const LOCK_MS = 15 * 60_000;
const PREFIX = "login_guard:";

interface GuardState {
  failures: number;
  /** When the current run of failures began. */
  since: number;
  /** Locked until this time, if set. */
  lockedUntil?: number;
}

async function sha256Hex(input: string) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compares two secrets in time that doesn't depend on where they differ, so
 * response timing can't be used to guess the password a character at a time.
 * Both sides are hashed first, which also makes their lengths equal.
 */
export async function secretsMatch(given: string, expected: string) {
  const [a, b] = await Promise.all([sha256Hex(given), sha256Hex(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const keyFor = async (ip: string) =>
  PREFIX + (await sha256Hex(`${process.env.ADMIN_SESSION_SECRET ?? "millerartz"}|${ip || "unknown"}`)).slice(0, 32);

async function read(key: string): Promise<GuardState | null> {
  const { data } = await getSupabaseAdmin()
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (!data?.value) return null;
  try {
    return JSON.parse(data.value) as GuardState;
  } catch {
    return null;
  }
}

async function save(key: string, state: GuardState) {
  await getSupabaseAdmin()
    .from("site_settings")
    .upsert({ key, value: JSON.stringify(state), updated_at: new Date().toISOString() }, { onConflict: "key" });
}

/** Minutes left on a lock, or 0 if this address may try. */
export async function lockedMinutes(ip: string) {
  if (!isSupabaseConfigured()) return 0;
  const state = await read(await keyFor(ip));
  const left = (state?.lockedUntil ?? 0) - Date.now();
  return left > 0 ? Math.ceil(left / 60_000) : 0;
}

/** Records a wrong password. Returns how the next attempt stands. */
export async function recordFailure(ip: string) {
  // A fixed pause on every wrong answer.
  await new Promise((r) => setTimeout(r, 1000));
  if (!isSupabaseConfigured()) return { lockedMinutes: 0, remaining: MAX_FAILURES };

  const key = await keyFor(ip);
  const now = Date.now();
  const previous = await read(key);
  const fresh = !previous || now - previous.since > WINDOW_MS;
  const state: GuardState = fresh
    ? { failures: 1, since: now }
    : { ...previous, failures: previous.failures + 1 };

  const justLocked = state.failures >= MAX_FAILURES && !(state.lockedUntil && state.lockedUntil > now);
  if (state.failures >= MAX_FAILURES) state.lockedUntil = now + LOCK_MS;
  await save(key, state);

  // Opportunistic tidy-up of long-finished lockouts, so rows don't pile up.
  await getSupabaseAdmin()
    .from("site_settings")
    .delete()
    .like("key", `${PREFIX}%`)
    .lt("updated_at", new Date(now - 24 * 60 * 60_000).toISOString());

  return {
    lockedMinutes: state.lockedUntil && state.lockedUntil > now ? Math.ceil(LOCK_MS / 60_000) : 0,
    remaining: Math.max(0, MAX_FAILURES - state.failures),
    justLocked,
  };
}

/** A correct password clears that address's record. */
export async function clearFailures(ip: string) {
  if (!isSupabaseConfigured()) return;
  await getSupabaseAdmin().from("site_settings").delete().eq("key", await keyFor(ip));
}

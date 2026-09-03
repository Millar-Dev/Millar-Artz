// Only ever import this from other src/lib/data/*.ts server-function files
// (used inside a createServerFn handler, whose body is stripped from the
// client bundle) — never from a route or component file directly. That
// direct-import path is what the import-protection build check catches.
import { getSession } from "@tanstack/react-start/server";

export interface AdminSessionData {
  isAdmin?: boolean;
}

export function adminSessionConfig() {
  const password = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to a random string of at least 32 characters.",
    );
  }
  return {
    password,
    name: "miller_admin",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

/** Throws if the current request isn't an authenticated admin session. Call this at the top of every write server function. */
export async function requireAdmin() {
  const session = await getSession<AdminSessionData>(adminSessionConfig());
  if (!session.data.isAdmin) {
    throw new Error("Not authorized.");
  }
}

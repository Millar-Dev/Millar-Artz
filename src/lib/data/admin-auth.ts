import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeader,
  getRequestIP,
  getSession,
  useSession,
} from "@tanstack/react-start/server";
import { adminSessionConfig, type AdminSessionData } from "./admin-session";
import {
  clearFailures,
  lockedMinutes,
  MAX_FAILURES,
  recordFailure,
  secretsMatch,
} from "./login-guard";
import { sendOwnerNotice } from "./enquiry-alerts";

export const adminLogin = createServerFn({ method: "POST" })
  .validator((password: string) => password)
  .handler(async ({ data: password }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      throw new Error("ADMIN_PASSWORD isn't configured on the server yet.");
    }
    // Vercel sets x-real-ip itself, so a client can't spoof it the way it
    // could prepend addresses to x-forwarded-for.
    const ip = getRequestHeader("x-real-ip") || getRequestIP({ xForwardedFor: true }) || "";

    const locked = await lockedMinutes(ip);
    if (locked) {
      return { ok: false as const, lockedMinutes: locked, remaining: 0 };
    }
    if (!(await secretsMatch(String(password ?? ""), expected))) {
      const result = await recordFailure(ip);
      if (result.justLocked) {
        const decode = (v?: string) => {
          try {
            return v ? decodeURIComponent(v) : "";
          } catch {
            return v ?? "";
          }
        };
        const where = [decode(getRequestHeader("x-vercel-ip-city")), getRequestHeader("x-vercel-ip-country")]
          .filter(Boolean)
          .join(", ");
        await sendOwnerNotice("MillerArtz Studio login locked after wrong passwords", [
          `Someone entered the wrong Studio password ${MAX_FAILURES} times in a row${where ? ` (connection located near ${where})` : ""}.`,
          "That connection is locked out for 15 minutes.",
          "If this was you, there's nothing to do. If it wasn't, change ADMIN_PASSWORD in Vercel to something long and unique.",
        ]);
      }
      return { ok: false as const, lockedMinutes: result.lockedMinutes, remaining: result.remaining };
    }
    await clearFailures(ip);
    // useSession() (not getSession()) is the one that returns a manager with
    // .update()/.clear() — getSession() gives back a read-only snapshot.
    const session = await useSession<AdminSessionData>(adminSessionConfig());
    await session.update({ isAdmin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSessionData>(adminSessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const checkAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  // Not configured yet → treat as logged out rather than crashing the
  // /studio route; the login form itself explains what's missing.
  if (!process.env.ADMIN_SESSION_SECRET) return { isAdmin: false as const };
  const session = await getSession<AdminSessionData>(adminSessionConfig());
  return { isAdmin: session.data.isAdmin === true };
});

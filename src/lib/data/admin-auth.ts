import { createServerFn } from "@tanstack/react-start";
import { getSession, useSession } from "@tanstack/react-start/server";
import { adminSessionConfig, type AdminSessionData } from "./admin-session";

export const adminLogin = createServerFn({ method: "POST" })
  .validator((password: string) => password)
  .handler(async ({ data: password }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      throw new Error("ADMIN_PASSWORD isn't configured on the server yet.");
    }
    if (password !== expected) {
      return { ok: false as const };
    }
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

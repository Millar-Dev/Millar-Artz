// Server-only in practice: reads secrets from process.env and sends mail.
// Import it only from src/lib/data/*.ts and call it only inside a
// createServerFn handler, whose body the build strips from the browser.
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

/**
 * Tells the owner, by email, the moment an enquiry arrives.
 *
 * Enquiries were saved to the Studio and nothing else, so a client could wait
 * days before anyone looked. Email is the channel because it needs no
 * business account: it lands in the Gmail app and the phone buzzes.
 *
 * Sent through Resend's HTTP API with a plain fetch — no SDK dependency.
 * Configured entirely by environment variables on Vercel:
 *   RESEND_API_KEY  required; without it alerts are simply off
 *   NOTIFY_EMAIL    optional; defaults to the email saved in the Studio
 *   RESEND_FROM     optional; defaults to Resend's shared test sender, which
 *                   can only deliver to the Resend account's own address
 */

export interface EnquiryForAlert {
  fullName: string;
  email: string;
  phone?: string;
  style?: string;
  budget?: string;
  timeline?: string;
  subject?: string;
  message: string;
}

const SITE = "https://www.millerartz.com";
const DEFAULT_FROM = "MillerArtz <onboarding@resend.dev>";

/** Where alerts go: an explicit override, else the contact email in settings. */
async function recipient() {
  const override = process.env.NOTIFY_EMAIL?.trim();
  if (override) return override;
  if (isSupabaseConfigured()) {
    const { data } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", "email")
      .maybeSingle();
    if (data?.value?.trim()) return data.value.trim();
  }
  return "millarkitumi04@gmail.com";
}

export function alertsConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Everything here came from a stranger's form — never trust it as markup. */
const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function send(payload: {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, reason: "Email alerts aren't switched on yet (RESEND_API_KEY is missing)." };
  const to = await recipient();
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM?.trim() || DEFAULT_FROM,
        to: [to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      return { ok: false, reason: body.message || `Resend refused the email (HTTP ${res.status}).` };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Couldn't reach the email service." };
  }
}

/**
 * Never throws: a failed alert must not turn a saved enquiry into an error
 * for the client. Reply-to is the client, so answering the alert answers them.
 */
export async function alertNewEnquiry(e: EnquiryForAlert) {
  const rows: [string, string | undefined][] = [
    ["Name", e.fullName],
    ["Email", e.email],
    ["Phone", e.phone],
    ["Discipline", e.style],
    ["Budget", e.budget],
    ["Timeline", e.timeline],
  ];
  const filled = rows.filter(([, v]) => v && v.trim());
  const subject = `New enquiry from ${e.fullName}${e.style ? ` — ${e.style}` : ""}`.slice(0, 150);

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#2e1620">
  <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a3350;margin:0 0 8px">MillerArtz · New enquiry</p>
  <h1 style="font-size:20px;margin:0 0 16px">${esc(e.subject || "Commission enquiry")}</h1>
  <table style="border-collapse:collapse;font-size:14px;margin-bottom:16px">
    ${filled
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#7a6570">${k}</td><td style="padding:4px 0">${esc(v!)}</td></tr>`,
      )
      .join("")}
  </table>
  <div style="white-space:pre-wrap;font-size:14px;line-height:1.55;background:#f7f3ea;padding:14px 16px;border-radius:4px">${esc(e.message)}</div>
  <p style="font-size:13px;margin:20px 0 0">Reply to this email to answer ${esc(e.fullName)} directly, or open <a href="${SITE}/studio" style="color:#8a3350">the Studio</a>.</p>
</div>`;
  const text = [
    `New enquiry — ${e.subject || "Commission enquiry"}`,
    "",
    ...filled.map(([k, v]) => `${k}: ${v}`),
    "",
    e.message,
    "",
    `Reply to this email to answer ${e.fullName}, or open ${SITE}/studio`,
  ].join("\n");

  const result = await send({ subject, html, text, replyTo: e.email });
  if (!result.ok && alertsConfigured()) console.error("enquiry alert failed:", result.reason);
  return result;
}

/** From the Studio's "send a test alert" button, so setup can be confirmed
 *  without inventing an enquiry. */
export async function sendTestAlert() {
  return send({
    subject: "MillerArtz test alert — enquiry emails are working",
    html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#2e1620"><p>This is a test from your Studio.</p><p>When someone sends an enquiry on <a href="${SITE}/contact" style="color:#8a3350">millerartz.com</a>, you'll get an email like this straight away.</p></div>`,
    text: `This is a test from your Studio. When someone sends an enquiry on ${SITE}/contact, you'll get an email like this straight away.`,
  });
}

/** Masked, so the Studio can confirm where alerts go without printing it whole. */
export async function alertRecipientMasked() {
  const to = await recipient();
  const [user, domain] = to.split("@");
  return user && domain ? `${user.slice(0, 3)}…@${domain}` : "";
}

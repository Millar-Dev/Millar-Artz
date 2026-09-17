import { createServerFn } from "@tanstack/react-start";
import { recordServerInteraction } from "./analytics-record";
import {
  alertNewEnquiry,
  alertRecipientMasked,
  alertsConfigured,
  sendTestAlert,
} from "./enquiry-alerts";
import { requireAdmin } from "./admin-session";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface InquiryRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  style: string;
  budget: string;
  timeline: string;
  subject: string;
  message: string;
  handled: boolean;
  created_at: string;
}

export interface InquiryInput {
  fullName: string;
  email: string;
  phone?: string;
  style?: string;
  budget?: string;
  timeline?: string;
  subject?: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 120, email: 255, phone: 40, short: 160, message: 4000 };

/** Public — called from the Contact page. Saving is best-effort from the
 *  visitor's point of view: they still get the WhatsApp/email handoff even if
 *  this fails, so a storage outage never blocks someone reaching the studio. */
export const submitInquiry = createServerFn({ method: "POST" })
  .validator((input: InquiryInput) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!data.fullName.trim()) throw new Error("Please enter your name.");
    if (!EMAIL_RE.test(email)) throw new Error("Please enter a valid email address.");
    if (!data.message.trim()) throw new Error("Please include a message.");
    if (!isSupabaseConfigured()) {
      throw new Error("Couldn't reach the studio inbox — please use WhatsApp or email.");
    }

    const { error } = await getSupabaseAdmin().from("inquiries").insert({
      full_name: data.fullName.trim().slice(0, MAX.name),
      email: email.slice(0, MAX.email),
      phone: (data.phone ?? "").trim().slice(0, MAX.phone),
      style: (data.style ?? "").trim().slice(0, MAX.short),
      budget: (data.budget ?? "").trim().slice(0, MAX.short),
      timeline: (data.timeline ?? "").trim().slice(0, MAX.short),
      subject: (data.subject ?? "").trim().slice(0, MAX.short),
      message: data.message.trim().slice(0, MAX.message),
    });
    if (error) throw new Error(error.message);
    await recordServerInteraction("enquiry_sent", "/contact");
    // Awaited, not fired-and-forgotten: a serverless function can be frozen
    // the moment it responds, which would drop an unsent alert. It never
    // throws and times out after a few seconds.
    await alertNewEnquiry({
      fullName: data.fullName.trim(),
      email,
      phone: data.phone?.trim(),
      style: data.style?.trim(),
      budget: data.budget?.trim(),
      timeline: data.timeline?.trim(),
      subject: data.subject?.trim(),
      message: data.message.trim(),
    });
    return { ok: true as const };
  });

export const listInquiries = createServerFn({ method: "GET" }).handler(
  async (): Promise<InquiryRow[]> => {
    await requireAdmin();
    const { data, error } = await getSupabaseAdmin()
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as InquiryRow[];
  },
);

export const setInquiryHandled = createServerFn({ method: "POST" })
  .validator((input: { id: string; handled: boolean }) => input)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin()
      .from("inquiries")
      .update({ handled: data.handled })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteInquiry = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireAdmin();
    const { error } = await getSupabaseAdmin().from("inquiries").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Owner-only: whether enquiry emails are switched on, and where they go. */
export const getAlertStatus = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return {
    configured: alertsConfigured(),
    to: alertsConfigured() ? await alertRecipientMasked() : "",
  };
});

/** Owner-only: send a test alert to confirm the setup works. */
export const triggerTestAlert = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return sendTestAlert();
});

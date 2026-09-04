import { createServerFn } from "@tanstack/react-start";
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

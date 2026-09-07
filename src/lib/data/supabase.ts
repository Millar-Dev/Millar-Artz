import { createClient } from "@supabase/supabase-js";

/**
 * Schema for the tables in supabase/schema.sql.
 *
 * Without this generic, supabase-js infers every table row as `never`, so
 * inserts and updates fail to typecheck and — worse — genuine mistakes in
 * column names go unnoticed. Keep this in sync with schema.sql.
 */
interface TableConfig<Row, Insert = Row, Update = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  /** Required by supabase-js's GenericTable constraint. Without it the whole
   *  Database type silently fails the constraint and every row falls back to
   *  `never`, which is what hid a broken insert from the compiler before. */
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      artworks: TableConfig<{
        id: string;
        title: string;
        category: string;
        category_label: string;
        medium: string;
        dimensions: string | null;
        status: string;
        description: string;
        year: number;
        image_path: string;
        sort_order: number;
        price: number | null;
        currency: string | null;
        created_at?: string;
        updated_at?: string;
      }>;
      site_images: TableConfig<{
        id: string;
        image_path: string;
        caption: string;
        updated_at?: string;
      }>;
      subscribers: TableConfig<{
        email: string;
        tier: string;
        created_at?: string;
      }>;
      // `handled` and `id` are defaulted by Postgres, so they're optional on
      // insert even though every row that comes back has them.
      inquiries: TableConfig<
        {
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
        },
        {
          id?: string;
          full_name: string;
          email: string;
          phone?: string;
          style?: string;
          budget?: string;
          timeline?: string;
          subject?: string;
          message?: string;
          handled?: boolean;
          created_at?: string;
        }
      >;
      site_settings: TableConfig<{
        key: string;
        value: string;
        updated_at?: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Server-only: uses the service role key, which bypasses Row Level Security.
// Never import this file from client code — the importProtection config in
// vite.config.ts (files under src/lib/data/** that touch it end up inside a
// createServerFn handler, which the build strips from the client bundle).
let client: ReturnType<typeof createClient<Database>> | undefined;

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

  client = createClient<Database>(url, key, { auth: { persistSession: false } });
  return client;
}

export const ARTWORK_BUCKET = "site-images";

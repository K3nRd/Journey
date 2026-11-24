import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Deja solo el origen del proyecto (https://xxxx.supabase.co), aunque se haya
 * pegado con /rest/v1, barras al final, comillas o espacios.
 */
export function normalizeSupabaseUrl(raw: string): string | null {
  let v = raw.trim().replace(/^["']|["']$/g, "");
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  try {
    return new URL(v).origin;
  } catch {
    return null;
  }
}

export function getSupabase(): SupabaseClient | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL ?? "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const notConfigured = () =>
  Response.json(
    { error: "Supabase no está configurado. Revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel." },
    { status: 503 },
  );

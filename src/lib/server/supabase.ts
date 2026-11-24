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

/** Usuario dueño del token "Authorization: Bearer …" o null. */
export async function userFromRequest(req: Request): Promise<{ id: string; email?: string } | null> {
  const db = getSupabase();
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!db || !token || token.length > 4000) return null;
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
}

export const unauthorized = () => Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });

/** El login está activo cuando existe la clave publicable de Supabase. */
export const authEnabled = () => Boolean((process.env.SUPABASE_PUBLISHABLE_KEY ?? "").trim());

/**
 * Exige sesión solo si el login está activo. Devuelve { userId } (null si el login aún no está activo)
 * o { response } con el error 401.
 */
export async function requireUser(req: Request): Promise<{ userId: string | null; response?: Response }> {
  if (!authEnabled()) return { userId: null };
  const user = await userFromRequest(req);
  return user ? { userId: user.id } : { userId: null, response: unauthorized() };
}

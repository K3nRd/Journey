import { connection } from "next/server";
import { normalizeSupabaseUrl } from "@/lib/server/supabase";

// Datos públicos para que el navegador se conecte a Supabase (la clave publicable es segura de exponer).
export async function GET() {
  await connection();
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL ?? "");
  const key = (process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  return Response.json(
    { supabaseUrl: url, publishableKey: key || null },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}

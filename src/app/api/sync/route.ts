import { createHmac } from "node:crypto";
import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { bad, clientIp, rateLimit } from "@/lib/server/guard";

// Copia de seguridad protegida por un código que solo conoce el usuario.
// El código se guarda como HMAC con un secreto del servidor: si alguien viera la base de datos, no podría probar códigos.
const MIN_LEN = 12;
const MAX_BYTES = 2_000_000;

function hash(code: string) {
  const secret = process.env.SYNC_SECRET || process.env.CRON_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(code).digest("hex");
}

function codeFrom(req: Request) {
  const code = req.headers.get("x-sync-code") ?? "";
  return code.length >= MIN_LEN && code.length <= 128 ? code : null;
}

export async function GET(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  // Pocos intentos por IP para evitar que adivinen códigos
  const limited = await rateLimit("sync-get", clientIp(req), 10, 3600);
  if (limited) return limited;
  const code = codeFrom(req);
  if (!code) return bad(`Código inválido (mínimo ${MIN_LEN} caracteres)`);
  const h = hash(code);
  if (!h) return bad("Servidor sin configurar", 503);
  const { data } = await db.from("backups").select("data, updated_at").eq("code_hash", h).maybeSingle();
  if (!data) return bad("No hay copia con ese código", 404);
  return Response.json(data);
}

export async function PUT(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const limited = await rateLimit("sync-put", clientIp(req), 60, 3600);
  if (limited) return limited;
  const code = codeFrom(req);
  if (!code) return bad(`Código inválido (mínimo ${MIN_LEN} caracteres)`);
  const h = hash(code);
  if (!h) return bad("Servidor sin configurar", 503);
  const body = await req.text();
  if (body.length > MAX_BYTES) return bad("Copia demasiado grande", 413);
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return bad("Copia no válida");
  }
  if (!data || typeof data !== "object" || !("profile" in data)) return bad("Copia no válida");
  const { error } = await db.from("backups").upsert({ code_hash: h, data, updated_at: new Date().toISOString() });
  if (error) return bad("No se pudo guardar", 500);
  return Response.json({ ok: true });
}

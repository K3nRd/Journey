import { createHash } from "node:crypto";
import { getSupabase, notConfigured } from "@/lib/server/supabase";

// Copia de seguridad en la nube protegida por un código que solo tú conoces.
const hash = (code: string) => createHash("sha256").update(`journey:${code}`).digest("hex");

function codeFrom(req: Request) {
  const code = req.headers.get("x-sync-code") ?? "";
  return code.length >= 8 ? code : null;
}

export async function GET(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const code = codeFrom(req);
  if (!code) return Response.json({ error: "Código inválido (mínimo 8 caracteres)" }, { status: 400 });
  const { data } = await db.from("backups").select("data, updated_at").eq("code_hash", hash(code)).maybeSingle();
  if (!data) return Response.json({ error: "No hay copia con ese código" }, { status: 404 });
  return Response.json(data);
}

export async function PUT(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const code = codeFrom(req);
  if (!code) return Response.json({ error: "Código inválido (mínimo 8 caracteres)" }, { status: 400 });
  const body = await req.text();
  if (body.length > 4_000_000) return Response.json({ error: "Copia demasiado grande" }, { status: 413 });
  const { error } = await db
    .from("backups")
    .upsert({ code_hash: hash(code), data: JSON.parse(body), updated_at: new Date().toISOString() });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

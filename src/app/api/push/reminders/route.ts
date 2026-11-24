import { getSupabase, notConfigured, requireUser } from "@/lib/server/supabase";
import { bad, cleanReminders, isId, rateLimit, readJson } from "@/lib/server/guard";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const body = await readJson<{ deviceId?: unknown; timezone?: unknown; reminders?: unknown }>(req);
  if (!body || !isId(body.deviceId)) return bad("Datos incompletos");
  const limited = await rateLimit("reminders", body.deviceId, 60, 3600);
  if (limited) return limited;
  const auth = await requireUser(req);
  if (auth.response) return auth.response;
  const userId = auth.userId;
  const reminders = cleanReminders(body.reminders);
  if (!reminders) return bad("Recordatorios no válidos");
  const timezone = typeof body.timezone === "string" && body.timezone.length < 60 ? body.timezone : undefined;
  // Teléfonos registrados antes de existir las cuentas pasan a ser de quien inicia sesión
  const { data: dev } = await db.from("devices").select("*").eq("id", body.deviceId).maybeSingle();
  if (!dev) return Response.json({ ok: true, registered: false });
  if (userId && dev.user_id && dev.user_id !== userId) return bad("Este teléfono pertenece a otra cuenta.", 403);
  const { error } = await db
    .from("devices")
    .update({ reminders, ...(userId ? { user_id: userId } : {}), ...(timezone ? { timezone } : {}), updated_at: new Date().toISOString() })
    .eq("id", body.deviceId);
  if (error) return bad("No se pudo guardar", 500);
  return Response.json({ ok: true, registered: true });
}

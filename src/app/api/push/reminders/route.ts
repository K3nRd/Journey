import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { bad, cleanReminders, isId, rateLimit, readJson } from "@/lib/server/guard";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const body = await readJson<{ deviceId?: unknown; timezone?: unknown; reminders?: unknown }>(req);
  if (!body || !isId(body.deviceId)) return bad("Datos incompletos");
  const limited = await rateLimit("reminders", body.deviceId, 60, 3600);
  if (limited) return limited;
  const reminders = cleanReminders(body.reminders);
  if (!reminders) return bad("Recordatorios no válidos");
  const timezone = typeof body.timezone === "string" && body.timezone.length < 60 ? body.timezone : undefined;
  const { data, error } = await db
    .from("devices")
    .update({ reminders, ...(timezone ? { timezone } : {}), updated_at: new Date().toISOString() })
    .eq("id", body.deviceId)
    .select("id");
  if (error) return bad("No se pudo guardar", 500);
  return Response.json({ ok: true, registered: (data?.length ?? 0) > 0 });
}

import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { bad, cleanReminders, clientIp, isId, MAX_DEVICES, rateLimit, readJson, validSubscription } from "@/lib/server/guard";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const limited = await rateLimit("subscribe", clientIp(req), 10, 3600);
  if (limited) return limited;

  const body = await readJson<{ deviceId?: unknown; subscription?: unknown; timezone?: unknown; reminders?: unknown }>(req);
  if (!body || !isId(body.deviceId)) return bad("Datos incompletos");
  if (!validSubscription(body.subscription)) return bad("Suscripción no válida");
  const reminders = cleanReminders(body.reminders ?? []);
  if (!reminders) return bad("Recordatorios no válidos");
  const timezone = typeof body.timezone === "string" && body.timezone.length < 60 ? body.timezone : "America/Santo_Domingo";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    return bad("Zona horaria no válida");
  }

  // Tope de dispositivos para no agotar el plan gratuito
  const { data: existing } = await db.from("devices").select("id").eq("id", body.deviceId).maybeSingle();
  if (!existing) {
    const { count } = await db.from("devices").select("id", { count: "exact", head: true });
    if ((count ?? 0) >= MAX_DEVICES) return bad("La beta alcanzó el máximo de usuarios con recordatorios. Inténtalo más tarde.", 503);
  }

  const { error } = await db.from("devices").upsert({
    id: body.deviceId,
    subscription: body.subscription,
    timezone,
    reminders,
    updated_at: new Date().toISOString(),
  });
  if (error) return bad("No se pudo guardar", 500);
  return Response.json({ ok: true });
}

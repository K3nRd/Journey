import { getSupabase, notConfigured, requireUser } from "@/lib/server/supabase";
import { pushConfigured, sendPush, localNow } from "@/lib/server/push";
import { bad, isId, rateLimit, readJson } from "@/lib/server/guard";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  if (!pushConfigured()) return bad("Faltan las claves VAPID", 503);
  const body = await readJson<{ deviceId?: unknown }>(req);
  if (!body || !isId(body.deviceId)) return bad("Datos incompletos");
  const limited = await rateLimit("test", body.deviceId, 5, 600);
  if (limited) return limited;
  const auth = await requireUser(req);
  if (auth.response) return auth.response;
  const userId = auth.userId;
  const { data } = await db.from("devices").select("*").eq("id", body.deviceId).maybeSingle();
  if (!data || (userId && data.user_id && data.user_id !== userId)) return bad("Este teléfono no está registrado", 404);
  const now = localNow(data.timezone);
  const r = await sendPush(data.subscription, {
    title: "🔔 ¡Funciona!",
    body: "Así te llegarán los recordatorios, incluso con el teléfono bloqueado.",
    url: "/",
    tag: "test",
    itemId: "test",
    date: now.date,
    deviceId: body.deviceId,
  });
  if (r === "gone") await db.from("devices").delete().eq("id", body.deviceId);
  return Response.json({ ok: r === "ok", result: r });
}

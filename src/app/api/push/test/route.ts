import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { pushConfigured, sendPush, localNow } from "@/lib/server/push";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  if (!pushConfigured()) return Response.json({ error: "Faltan las claves VAPID" }, { status: 503 });
  const { deviceId } = await req.json();
  const { data } = await db.from("devices").select("subscription, timezone").eq("id", deviceId).maybeSingle();
  if (!data) return Response.json({ error: "Este teléfono no está registrado" }, { status: 404 });
  const now = localNow(data.timezone);
  const r = await sendPush(data.subscription, {
    title: "🔔 ¡Funciona!",
    body: "Así te llegarán los recordatorios, incluso con el teléfono bloqueado.",
    url: "/",
    tag: "test",
    itemId: "test",
    date: now.date,
    deviceId,
  });
  if (r === "gone") await db.from("devices").delete().eq("id", deviceId);
  return Response.json({ ok: r === "ok", result: r });
}

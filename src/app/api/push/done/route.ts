import { getSupabase, notConfigured } from "@/lib/server/supabase";

// Marca un recordatorio como hecho para que el servidor no lo envíe.
export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const { deviceId, date, itemId, done = true } = await req.json();
  if (!deviceId || !date || !itemId) return Response.json({ error: "Datos incompletos" }, { status: 400 });
  if (done) {
    await db.from("reminder_done").upsert({ device_id: deviceId, date, item_id: itemId });
  } else {
    await db.from("reminder_done").delete().match({ device_id: deviceId, date, item_id: itemId });
  }
  return Response.json({ ok: true });
}

// Lista de lo marcado como hecho desde la notificación (para sincronizar con la app).
export async function GET(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const url = new URL(req.url);
  const deviceId = url.searchParams.get("deviceId");
  const date = url.searchParams.get("date");
  if (!deviceId || !date) return Response.json({ error: "Datos incompletos" }, { status: 400 });
  const { data } = await db.from("reminder_done").select("item_id").match({ device_id: deviceId, date });
  return Response.json({ items: (data ?? []).map((r) => r.item_id) });
}

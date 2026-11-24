import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { bad, isDate, isId, isItem, rateLimit, readJson } from "@/lib/server/guard";

async function deviceExists(id: string) {
  const { data } = await getSupabase()!.from("devices").select("id").eq("id", id).maybeSingle();
  return Boolean(data);
}

// Marca un recordatorio como hecho para que el servidor no lo envíe.
export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const body = await readJson<{ deviceId?: unknown; date?: unknown; itemId?: unknown; done?: unknown }>(req);
  if (!body || !isId(body.deviceId) || !isDate(body.date) || !isItem(body.itemId)) return bad("Datos incompletos");
  const limited = await rateLimit("done", body.deviceId, 300, 3600);
  if (limited) return limited;
  if (!(await deviceExists(body.deviceId))) return Response.json({ ok: false, registered: false });
  if (body.done === false) {
    await db.from("reminder_done").delete().match({ device_id: body.deviceId, date: body.date, item_id: body.itemId });
  } else {
    await db.from("reminder_done").upsert({ device_id: body.deviceId, date: body.date, item_id: body.itemId });
  }
  return Response.json({ ok: true });
}

// Lo marcado como hecho desde la notificación (para sincronizar con la app).
export async function GET(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const url = new URL(req.url);
  const deviceId = url.searchParams.get("deviceId");
  const date = url.searchParams.get("date");
  if (!isId(deviceId) || !isDate(date)) return bad("Datos incompletos");
  const limited = await rateLimit("done-get", deviceId, 200, 3600);
  if (limited) return limited;
  const { data } = await db.from("reminder_done").select("item_id").match({ device_id: deviceId, date });
  return Response.json({ items: (data ?? []).map((r) => r.item_id) });
}

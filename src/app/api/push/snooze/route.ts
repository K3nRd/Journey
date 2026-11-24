import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { bad, clip, isId, isItem, rateLimit, readJson } from "@/lib/server/guard";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const body = await readJson<{ deviceId?: unknown; itemId?: unknown; title?: unknown; body?: unknown; url?: unknown; minutes?: unknown }>(req);
  if (!body || !isId(body.deviceId) || !isItem(body.itemId)) return bad("Datos incompletos");
  const limited = await rateLimit("snooze", body.deviceId, 30, 3600);
  if (limited) return limited;
  const { data: device } = await db.from("devices").select("id").eq("id", body.deviceId).maybeSingle();
  if (!device) return bad("Este teléfono no está registrado", 404);
  const minutes = Math.min(180, Math.max(1, Number(body.minutes) || 15));
  const due = new Date(Date.now() + minutes * 60000);
  const url = clip(body.url, 120);
  await db.from("snoozes").insert({
    device_id: body.deviceId,
    item_id: body.itemId,
    title: clip(body.title || "Recordatorio", 80),
    body: clip(body.body, 160),
    url: url.startsWith("/") && !url.startsWith("//") ? url : "/",
    due_at: due.toISOString(),
  });
  return Response.json({ ok: true, due: due.toISOString() });
}

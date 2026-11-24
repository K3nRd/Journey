import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { bad, clientIp, isId, rateLimit, readJson } from "@/lib/server/guard";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const limited = await rateLimit("unsubscribe", clientIp(req), 20, 3600);
  if (limited) return limited;
  const body = await readJson<{ deviceId?: unknown }>(req);
  if (!body || !isId(body.deviceId)) return bad("Falta deviceId");
  await db.from("devices").delete().eq("id", body.deviceId);
  await db.from("reminder_done").delete().eq("device_id", body.deviceId);
  return Response.json({ ok: true });
}

import { getSupabase, notConfigured, requireUser } from "@/lib/server/supabase";
import { bad, clientIp, isId, rateLimit, readJson } from "@/lib/server/guard";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const limited = await rateLimit("unsubscribe", clientIp(req), 20, 3600);
  if (limited) return limited;
  const body = await readJson<{ deviceId?: unknown }>(req);
  if (!body || !isId(body.deviceId)) return bad("Falta deviceId");
  const auth = await requireUser(req);
  if (auth.response) return auth.response;
  const userId = auth.userId;
  const { data: dev } = await db.from("devices").select("*").eq("id", body.deviceId).maybeSingle();
  if (!dev || (userId && dev.user_id && dev.user_id !== userId)) return Response.json({ ok: true });
  await db.from("devices").delete().eq("id", body.deviceId);
  await db.from("reminder_done").delete().eq("device_id", body.deviceId);
  return Response.json({ ok: true });
}

import { getSupabase, notConfigured } from "@/lib/server/supabase";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const { deviceId } = await req.json();
  if (!deviceId) return Response.json({ error: "Falta deviceId" }, { status: 400 });
  await db.from("devices").delete().eq("id", deviceId);
  return Response.json({ ok: true });
}

import { getSupabase, notConfigured } from "@/lib/server/supabase";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const { deviceId, timezone, reminders } = await req.json();
  if (!deviceId || !Array.isArray(reminders)) return Response.json({ error: "Datos incompletos" }, { status: 400 });
  const { data, error } = await db
    .from("devices")
    .update({ reminders, timezone, updated_at: new Date().toISOString() })
    .eq("id", deviceId)
    .select("id");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, registered: (data?.length ?? 0) > 0 });
}

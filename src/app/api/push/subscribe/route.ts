import { getSupabase, notConfigured } from "@/lib/server/supabase";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const { deviceId, subscription, timezone, reminders } = await req.json();
  if (!deviceId || !subscription?.endpoint) return Response.json({ error: "Datos incompletos" }, { status: 400 });
  const { error } = await db.from("devices").upsert({
    id: deviceId,
    subscription,
    timezone: timezone || "America/Santo_Domingo",
    reminders: reminders ?? [],
    updated_at: new Date().toISOString(),
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

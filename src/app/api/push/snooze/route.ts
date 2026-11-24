import { getSupabase, notConfigured } from "@/lib/server/supabase";

export async function POST(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const { deviceId, itemId, title, body, url, minutes = 15 } = await req.json();
  if (!deviceId || !itemId) return Response.json({ error: "Datos incompletos" }, { status: 400 });
  const due = new Date(Date.now() + Math.min(180, Math.max(1, Number(minutes))) * 60000);
  await db.from("snoozes").insert({
    device_id: deviceId,
    item_id: itemId,
    title: String(title ?? "Recordatorio").slice(0, 120),
    body: String(body ?? "").slice(0, 300),
    url: String(url ?? "/").slice(0, 200),
    due_at: due.toISOString(),
  });
  return Response.json({ ok: true, due: due.toISOString() });
}

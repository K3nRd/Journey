import { getSupabase, notConfigured, unauthorized, userFromRequest } from "@/lib/server/supabase";
import { rateLimit } from "@/lib/server/guard";

// Borra la cuenta y todos sus datos del servidor.
export async function DELETE(req: Request) {
  const db = getSupabase();
  if (!db) return notConfigured();
  const user = await userFromRequest(req);
  if (!user) return unauthorized();
  const limited = await rateLimit("account-delete", user.id, 5, 3600);
  if (limited) return limited;
  const { data: devices } = await db.from("devices").select("id").eq("user_id", user.id);
  const ids = (devices ?? []).map((d) => d.id);
  if (ids.length) await db.from("reminder_done").delete().in("device_id", ids);
  await db.from("devices").delete().eq("user_id", user.id);
  await db.from("user_data").delete().eq("user_id", user.id);
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return Response.json({ error: "No se pudo borrar la cuenta. Inténtalo de nuevo." }, { status: 500 });
  return Response.json({ ok: true });
}

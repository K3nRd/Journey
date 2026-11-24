import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { pushConfigured, sendPush, localNow } from "@/lib/server/push";

interface Reminder {
  id: string;
  day: number;
  time: string;
  title: string;
  body: string;
  url: string;
  date?: string;
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Ventana de tolerancia por si el cron se retrasa
const WINDOW_MIN = 5;

/**
 * Lo llama Supabase (pg_cron + pg_net) cada minuto.
 * Envía los recordatorios que tocan ahora y que no se han marcado como hechos.
 */
async function tick(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) return Response.json({ error: "No autorizado" }, { status: 401 });
  const db = getSupabase();
  if (!db) return notConfigured();
  if (!pushConfigured()) return Response.json({ error: "Faltan las claves VAPID" }, { status: 503 });

  const { data: devices, error } = await db.from("devices").select("id, subscription, timezone, reminders");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const d of devices ?? []) {
    const now = localNow(d.timezone || "America/Santo_Domingo");
    const reminders = (d.reminders ?? []) as Reminder[];
    const due = reminders.filter((r) => {
      if (r.day !== now.day) return false;
      if (r.date && r.date !== now.date) return false;
      const diff = now.minutes - toMin(r.time);
      return diff >= 0 && diff < WINDOW_MIN;
    });

    const { data: snoozes } = await db
      .from("snoozes")
      .select("id, item_id, title, body, url")
      .eq("device_id", d.id)
      .eq("sent", false)
      .lte("due_at", new Date().toISOString());

    if (!due.length && !snoozes?.length) continue;

    const [{ data: doneRows }, { data: sentRows }] = await Promise.all([
      db.from("reminder_done").select("item_id").match({ device_id: d.id, date: now.date }),
      db.from("reminder_sent").select("item_id").match({ device_id: d.id, date: now.date }),
    ]);
    const done = new Set((doneRows ?? []).map((r) => r.item_id));
    const already = new Set((sentRows ?? []).map((r) => r.item_id));

    let gone = false;
    for (const r of due) {
      if (done.has(r.id) || already.has(r.id)) continue;
      // Registramos primero para no duplicar si el cron se solapa
      const { error: insErr } = await db
        .from("reminder_sent")
        .insert({ device_id: d.id, date: now.date, item_id: r.id });
      if (insErr) continue;
      const res = await sendPush(d.subscription, {
        title: r.title,
        body: r.body,
        url: r.url,
        tag: r.id,
        itemId: r.id,
        date: now.date,
        deviceId: d.id,
        actions: true,
      });
      if (res === "ok") sent++;
      if (res === "gone") {
        gone = true;
        break;
      }
    }

    for (const s of snoozes ?? []) {
      if (gone) break;
      await db.from("snoozes").update({ sent: true }).eq("id", s.id);
      if (done.has(s.item_id)) continue;
      const res = await sendPush(d.subscription, {
        title: s.title,
        body: s.body,
        url: s.url,
        tag: s.item_id,
        itemId: s.item_id,
        date: now.date,
        deviceId: d.id,
        actions: true,
      });
      if (res === "ok") sent++;
      if (res === "gone") gone = true;
    }

    if (gone) await db.from("devices").delete().eq("id", d.id);
  }

  // Limpieza ocasional de registros viejos
  if (new Date().getUTCMinutes() === 7) {
    const old = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
    await db.from("reminder_sent").delete().lt("date", old);
    await db.from("reminder_done").delete().lt("date", old);
    await db.from("snoozes").delete().eq("sent", true);
  }

  return Response.json({ ok: true, sent });
}

export const GET = tick;
export const POST = tick;

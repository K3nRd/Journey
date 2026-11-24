import { timingSafeEqual } from "node:crypto";
import { getSupabase, notConfigured } from "@/lib/server/supabase";
import { pushConfigured, sendPush, localNow, type PushPayload } from "@/lib/server/push";

interface Reminder {
  id: string;
  day: number;
  time: string;
  title: string;
  body: string;
  url: string;
  date?: string;
}

interface Device {
  id: string;
  subscription: Parameters<typeof sendPush>[0];
  timezone: string | null;
  reminders: Reminder[] | null;
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Tolerancia por si el cron se retrasa
const WINDOW_MIN = 5;
// Envíos simultáneos
const CONCURRENCY = 25;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret) return false;
  const a = Buffer.from(auth);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

/**
 * Lo llama Supabase (pg_cron + pg_net) cada minuto.
 * Envía los recordatorios que tocan ahora y que no se han marcado como hechos.
 * Todo se hace en lotes: unas pocas consultas sin importar cuántos usuarios haya.
 */
async function tick(req: Request) {
  if (!authorized(req)) return Response.json({ error: "No autorizado" }, { status: 401 });
  const db = getSupabase();
  if (!db) return notConfigured();
  if (!pushConfigured()) return Response.json({ error: "Faltan las claves VAPID" }, { status: 503 });

  const { data: devices, error } = await db.from("devices").select("id, subscription, timezone, reminders");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // 1. Qué le toca a cada dispositivo ahora mismo
  type Job = { device: Device; date: string; itemId: string; payload: Omit<PushPayload, "deviceId" | "date" | "itemId" | "tag"> };
  const candidates: Job[] = [];
  const dates = new Set<string>();
  for (const d of (devices ?? []) as Device[]) {
    const now = localNow(d.timezone || "America/Santo_Domingo");
    dates.add(now.date);
    for (const r of d.reminders ?? []) {
      if (r.day !== now.day || (r.date && r.date !== now.date)) continue;
      const diff = now.minutes - toMin(r.time);
      if (diff >= 0 && diff < WINDOW_MIN)
        candidates.push({ device: d, date: now.date, itemId: r.id, payload: { title: r.title, body: r.body, url: r.url, actions: true } });
    }
  }

  // 2. Quitar lo que ya está hecho (una sola consulta)
  const ids = [...new Set(candidates.map((c) => c.device.id))];
  const done = new Set<string>();
  if (ids.length) {
    const { data } = await db.from("reminder_done").select("device_id, date, item_id").in("device_id", ids).in("date", [...dates]);
    for (const r of data ?? []) done.add(`${r.device_id}|${r.date}|${r.item_id}`);
  }
  const pending = candidates.filter((c) => !done.has(`${c.device.id}|${c.date}|${c.itemId}`));

  // 3. Reservar los envíos: solo se envía lo que se inserta por primera vez (evita duplicados)
  let toSend: Job[] = [];
  if (pending.length) {
    const { data: inserted } = await db
      .from("reminder_sent")
      .upsert(
        pending.map((c) => ({ device_id: c.device.id, date: c.date, item_id: c.itemId })),
        { onConflict: "device_id,date,item_id", ignoreDuplicates: true },
      )
      .select("device_id, date, item_id");
    const ok = new Set((inserted ?? []).map((r) => `${r.device_id}|${r.date}|${r.item_id}`));
    toSend = pending.filter((c) => ok.has(`${c.device.id}|${c.date}|${c.itemId}`));
  }

  // 4. "Recordar en 15 min" que ya vencieron (una consulta + una actualización)
  const { data: snoozes } = await db
    .from("snoozes")
    .select("id, device_id, item_id, title, body, url")
    .eq("sent", false)
    .lte("due_at", new Date().toISOString())
    .limit(1000);
  if (snoozes?.length) {
    await db.from("snoozes").update({ sent: true }).in("id", snoozes.map((s) => s.id));
    const byId = new Map(((devices ?? []) as Device[]).map((d) => [d.id, d]));
    for (const s of snoozes) {
      const d = byId.get(s.device_id);
      if (!d) continue;
      const date = localNow(d.timezone || "America/Santo_Domingo").date;
      if (done.has(`${d.id}|${date}|${s.item_id}`)) continue;
      toSend.push({ device: d, date, itemId: s.item_id, payload: { title: s.title, body: s.body, url: s.url, actions: true } });
    }
  }

  // 5. Enviar en paralelo y borrar suscripciones que ya no existen
  let sent = 0;
  const gone = new Set<string>();
  await pool(toSend, CONCURRENCY, async (j) => {
    if (gone.has(j.device.id)) return;
    const r = await sendPush(j.device.subscription, { ...j.payload, tag: j.itemId, itemId: j.itemId, date: j.date, deviceId: j.device.id });
    if (r === "ok") sent++;
    if (r === "gone") gone.add(j.device.id);
  });
  if (gone.size) await db.from("devices").delete().in("id", [...gone]);

  // Limpieza ocasional
  if (new Date().getUTCMinutes() === 7) {
    const old = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
    await Promise.all([
      db.from("reminder_sent").delete().lt("date", old),
      db.from("reminder_done").delete().lt("date", old),
      db.from("snoozes").delete().eq("sent", true),
      db.from("rate_limits").delete().lt("window_start", new Date(Date.now() - 86400000).toISOString()),
    ]);
  }

  return Response.json({ ok: true, devices: devices?.length ?? 0, sent });
}

export const GET = tick;
export const POST = tick;

import "server-only";
import { getSupabase } from "./supabase";

/** IP del cliente (Vercel pone la real en x-forwarded-for / x-real-ip). */
export function clientIp(req: Request) {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconocida"
  );
}

// Primera barrera: memoria de la instancia (rápida, se reinicia con cada instancia)
const mem = new Map<string, { start: number; count: number }>();

function memoryHit(key: string, max: number, windowSec: number) {
  const now = Date.now();
  const e = mem.get(key);
  if (!e || now - e.start > windowSec * 1000) {
    mem.set(key, { start: now, count: 1 });
    if (mem.size > 5000) for (const [k, v] of mem) if (now - v.start > 3600_000) mem.delete(k);
    return true;
  }
  e.count++;
  return e.count <= max;
}

/**
 * Límite de peticiones: `max` por ventana de `windowSec` segundos.
 * Usa memoria + una función atómica en Supabase (compartida entre instancias).
 * Devuelve una respuesta 429 si se pasa del límite, o null si puede seguir.
 */
export async function rateLimit(bucket: string, id: string, max: number, windowSec: number): Promise<Response | null> {
  const key = `${bucket}:${id}`;
  if (!memoryHit(key, max, windowSec)) return tooMany(windowSec);
  const db = getSupabase();
  if (db) {
    const { data, error } = await db.rpc("hit_rate_limit", { p_key: key, p_max: max, p_window_seconds: windowSec });
    if (!error && data === false) return tooMany(windowSec);
  }
  return null;
}

const tooMany = (retry: number) =>
  Response.json(
    { error: "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo." },
    { status: 429, headers: { "Retry-After": String(retry) } },
  );

export const bad = (msg: string, status = 400) => Response.json({ error: msg }, { status });

export const isId = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9-]{8,64}$/.test(v);
export const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
export const isItem = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9-]{1,40}$/.test(v);
export const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);

/** Lee el cuerpo JSON con un tamaño máximo. */
export async function readJson<T = Record<string, unknown>>(req: Request, maxBytes = 64_000): Promise<T | null> {
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export interface CleanReminder {
  id: string;
  day: number;
  time: string;
  title: string;
  body: string;
  url: string;
  date?: string;
}

/** Valida y limpia la lista de recordatorios que manda el teléfono. */
export function cleanReminders(input: unknown): CleanReminder[] | null {
  if (!Array.isArray(input) || input.length > 250) return null;
  const out: CleanReminder[] = [];
  for (const r of input) {
    if (!r || typeof r !== "object") return null;
    const x = r as Record<string, unknown>;
    if (!isItem(x.id) || typeof x.day !== "number" || x.day < 0 || x.day > 6) return null;
    if (typeof x.time !== "string" || !/^\d{2}:\d{2}$/.test(x.time)) return null;
    const url = clip(x.url, 120);
    out.push({
      id: x.id,
      day: x.day,
      time: x.time,
      title: clip(x.title, 80),
      body: clip(x.body, 160),
      url: url.startsWith("/") && !url.startsWith("//") ? url : "/",
      ...(isDate(x.date) ? { date: x.date } : {}),
    });
  }
  return out;
}

/** Solo aceptamos suscripciones de los servicios push reales (Apple, Google, Mozilla, Microsoft). */
export function validSubscription(sub: unknown): sub is { endpoint: string; keys: { p256dh: string; auth: string } } {
  if (!sub || typeof sub !== "object") return false;
  const s = sub as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  if (typeof s.endpoint !== "string" || s.endpoint.length > 600) return false;
  let host: string;
  try {
    const u = new URL(s.endpoint);
    if (u.protocol !== "https:") return false;
    host = u.hostname;
  } catch {
    return false;
  }
  const allowed = [/\.push\.apple\.com$/, /^fcm\.googleapis\.com$/, /^android\.googleapis\.com$/, /\.push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/];
  if (!allowed.some((r) => r.test(host))) return false;
  return typeof s.keys?.p256dh === "string" && typeof s.keys?.auth === "string" && s.keys.p256dh.length < 200 && s.keys.auth.length < 100;
}

export const MAX_DEVICES = Number(process.env.MAX_DEVICES ?? 500);

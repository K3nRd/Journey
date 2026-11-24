import "server-only";
import * as webpush from "web-push";
import type { PushSubscription } from "web-push";

let configured = false;

export function pushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
  itemId: string;
  date: string;
  deviceId: string;
  actions?: boolean;
}

/** Envía una notificación. Devuelve "gone" si la suscripción ya no existe. */
export async function sendPush(sub: PushSubscription, payload: PushPayload): Promise<"ok" | "gone" | "error"> {
  configure();
  try {
    await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 60 * 30, urgency: "high" });
    return "ok";
  } catch (e: unknown) {
    const code = (e as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) return "gone";
    console.error("push error", code, (e as Error).message);
    return "error";
  }
}

/** Fecha, día de la semana y minutos actuales en la zona horaria del usuario. */
export function localNow(timeZone: string, at = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hour = Number(get("hour")) % 24;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    day: days.indexOf(get("weekday")),
    minutes: hour * 60 + Number(get("minute")),
  };
}

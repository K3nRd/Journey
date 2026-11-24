"use client";

import type { ServerReminder } from "./schedule";

export const isPushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

export const isAndroid = () => typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

export const isStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

export async function registerSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  } catch {
    return null;
  }
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export interface ServerStatus {
  push: boolean;
  sync: boolean;
  cron: boolean;
}

export async function serverStatus(): Promise<ServerStatus> {
  try {
    const r = await fetch("/api/status", { cache: "no-store" });
    return await r.json();
  } catch {
    return { push: false, sync: false, cron: false };
  }
}

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Santo_Domingo";

export async function enablePush(deviceId: string, reminders: ServerReminder[]): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) {
    return {
      ok: false,
      error: isIOS()
        ? "En iPhone primero añade la app a la pantalla de inicio (Compartir → Añadir a pantalla de inicio) y ábrela desde ahí."
        : "Este navegador no permite notificaciones push.",
    };
  }
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return { ok: false, error: "La app todavía no tiene configuradas las claves de notificaciones (VAPID)." };
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return { ok: false, error: "No diste permiso para notificaciones. Puedes activarlo en los ajustes del teléfono." };
  const reg = (await navigator.serviceWorker.getRegistration()) ?? (await registerSW());
  if (!reg) return { ok: false, error: "No se pudo registrar el service worker." };
  await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
  }
  const r = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, subscription: sub.toJSON(), timezone: tz(), reminders }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    return { ok: false, error: j.error ?? "El servidor no respondió." };
  }
  return { ok: true };
}

export async function disablePush(deviceId: string) {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    await sub?.unsubscribe();
  } catch {}
  await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
  }).catch(() => {});
}

export async function syncReminders(deviceId: string, reminders: ServerReminder[]) {
  const r = await fetch("/api/push/reminders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, timezone: tz(), reminders }),
  }).catch(() => null);
  if (!r?.ok) return false;
  const j = await r.json();
  return Boolean(j.registered);
}

export function markDoneRemote(deviceId: string, date: string, itemId: string, done: boolean) {
  fetch("/api/push/done", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, date, itemId, done }),
    keepalive: true,
  }).catch(() => {});
}

export async function fetchDoneRemote(deviceId: string, date: string): Promise<string[]> {
  try {
    const r = await fetch(`/api/push/done?deviceId=${encodeURIComponent(deviceId)}&date=${date}`, { cache: "no-store" });
    if (!r.ok) return [];
    return (await r.json()).items ?? [];
  } catch {
    return [];
  }
}

export async function sendTestPush(deviceId: string) {
  const r = await fetch("/api/push/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId }),
  });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok && j.ok, error: j.error as string | undefined };
}

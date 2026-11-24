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

const IOS_REINSTALL =
  "El iPhone no mostró el aviso de permiso. Borra el ícono de Journey, ábrela en Safari → Compartir → Añadir a pantalla de inicio (con «Abrir como app web» activado), ábrela desde el ícono nuevo y toca de nuevo «Activar recordatorios».";

function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);
}

/** Estado del teléfono para diagnosticar problemas con las notificaciones. */
export function pushDiagnostics() {
  if (typeof window === "undefined") return null;
  return {
    instalada: isStandalone(),
    serviceWorker: "serviceWorker" in navigator,
    pushManager: "PushManager" in window,
    notificaciones: "Notification" in window,
    permiso: "Notification" in window ? Notification.permission : "no disponible",
    clave: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
  };
}

/**
 * Activa las notificaciones paso a paso. Nunca lanza errores: siempre devuelve
 * { ok } o { ok: false, error } con un mensaje claro del paso que falló.
 */
export async function enablePush(
  deviceId: string,
  reminders: ServerReminder[],
  onStep?: (step: string) => void,
): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) {
    return {
      ok: false,
      error: isIOS()
        ? isStandalone()
          ? "Tu iPhone no permite notificaciones web. Actualiza a iOS 16.4 o más reciente (Ajustes → General → Actualización de software)."
          : "En iPhone primero añade la app a la pantalla de inicio (Safari → Compartir → Añadir a pantalla de inicio) y ábrela desde el ícono."
        : "Este navegador no permite notificaciones push. Prueba con Chrome o Safari actualizados.",
    };
  }
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) return { ok: false, error: "La app no tiene configuradas las claves de notificaciones (VAPID)." };

  try {
    // 1. Permiso (debe ser lo primero tras el toque, sin esperas antes)
    onStep?.("Pidiendo permiso…");
    const before = Notification.permission;
    const t0 = Date.now();
    const perm = await Notification.requestPermission();
    if (perm === "denied") {
      // Si nunca se había preguntado y la respuesta llegó al instante, el iPhone no mostró el aviso.
      const silent = before !== "denied" && Date.now() - t0 < 600;
      return {
        ok: false,
        error: isIOS()
          ? silent || !isStandalone()
            ? IOS_REINSTALL
            : "Bloqueaste las notificaciones. Ve a Ajustes del iPhone → Notificaciones → Journey → activa «Permitir notificaciones». Si Journey no aparece ahí: " + IOS_REINSTALL
          : "Las notificaciones están bloqueadas para este sitio. Actívalas en la configuración del navegador.",
      };
    }
    if (perm !== "granted") return { ok: false, error: "No se concedió el permiso. Toca de nuevo y elige «Permitir»." };

    // 2. Service worker
    onStep?.("Preparando el teléfono…");
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) reg = (await registerSW()) ?? undefined;
    if (!reg) return { ok: false, error: "No se pudo preparar el servicio de notificaciones. Cierra la app por completo y vuelve a abrirla." };
    reg = await withTimeout(navigator.serviceWorker.ready, 15000, "El servicio de notificaciones tardó demasiado en activarse. Cierra la app por completo y vuelve a abrirla.");

    // 3. Suscripción con Apple / Google
    onStep?.("Conectando con el servicio de notificaciones…");
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await withTimeout(
        reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }),
        20000,
        "Apple/Google no respondió. Revisa tu conexión a internet e inténtalo de nuevo.",
      );
    }

    // 4. Registro en el servidor de Journey
    onStep?.("Guardando tus recordatorios…");
    const r = await withTimeout(
      fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, subscription: sub.toJSON(), timezone: tz(), reminders }),
      }),
      20000,
      "El servidor no respondió. Inténtalo de nuevo en un momento.",
    );
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      return { ok: false, error: `${j.error ?? "El servidor rechazó el registro."} (código ${r.status})` };
    }
    return { ok: true };
  } catch (e) {
    const name = (e as { name?: string })?.name ?? "";
    const m = e instanceof Error ? e.message : String(e);
    if (name === "NotAllowedError" || /permission denied/i.test(m))
      return {
        ok: false,
        error: isIOS() ? IOS_REINSTALL : "El navegador no permitió las notificaciones. Actívalas para este sitio en la configuración del navegador.",
      };
    if (name === "AbortError" || /push service/i.test(m))
      return { ok: false, error: "No se pudo conectar con el servicio de notificaciones de Apple/Google. Revisa tu internet e inténtalo de nuevo." };
    if (name === "InvalidStateError")
      return { ok: false, error: "Cierra la app por completo (desliza hacia arriba) y vuelve a abrirla desde el ícono." };
    if (/fetch|network|load failed/i.test(m)) return { ok: false, error: "Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo." };
    return { ok: false, error: `No se pudo activar: ${m || "error desconocido"}` };
  }
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

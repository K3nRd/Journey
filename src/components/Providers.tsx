"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { initAuth, startAutoSync, useAuth } from "@/lib/cloud";
import { useHydrated } from "@/lib/hooks";
import { registerSW, syncReminders, fetchDoneRemote } from "@/lib/push-client";
import { buildWeeklyReminders } from "@/lib/schedule";
import { dateKey } from "@/lib/date";
import { BottomNav } from "./BottomNav";

const PUBLIC = ["/login", "/legal"];

export function Providers({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const router = useRouter();
  const onboarded = useApp((s) => s.onboarded);
  const theme = useApp((s) => s.theme);

  // Tema
  useEffect(() => {
    if (!hydrated) return;
    const apply = () => {
      const t = theme === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : theme;
      document.documentElement.dataset.theme = t;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#f4f4ef" : "#07080a");
    };
    apply();
    if (theme === "system") {
      const mq = matchMedia("(prefers-color-scheme: light)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme, hydrated]);

  // Service worker
  useEffect(() => {
    registerSW();
  }, []);

  // iOS ignora user-scalable=no: bloqueamos el pellizco (el doble toque lo evita touch-action en CSS)
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    const pinch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("gesturestart", stop, { passive: false });
    document.addEventListener("gesturechange", stop, { passive: false });
    document.addEventListener("touchmove", pinch, { passive: false });
    return () => {
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("gesturechange", stop);
      document.removeEventListener("touchmove", pinch);
    };
  }, []);

  // Sesión: arranca una vez que los datos locales están listos
  const auth = useAuth((s) => s.status);
  useEffect(() => {
    if (!hydrated) return;
    initAuth();
    return startAutoSync();
  }, [hydrated]);

  // Login obligatorio → preguntas iniciales → cuestionario de salud
  const healthDone = useApp((s) => Boolean(s.profile.health?.disclaimerAcceptedAt && s.profile.health?.dataConsentAt));
  const publicPage = PUBLIC.includes(pathname);
  const ready = hydrated && auth !== "loading" && auth !== "syncing";
  useEffect(() => {
    if (!ready) return;
    if (auth === "signedOut") {
      if (!publicPage) router.replace("/login");
      return;
    }
    if (pathname === "/login") {
      router.replace("/");
      return;
    }
    if (pathname === "/onboarding" || pathname === "/legal") return;
    if (!onboarded) router.replace("/onboarding");
    else if (!healthDone && pathname !== "/salud") router.replace("/salud");
  }, [ready, auth, onboarded, healthDone, pathname, publicPage, router]);

  const canSync = hydrated && (auth === "signedIn" || auth === "unconfigured");
  useReminderSync(canSync);
  useRemoteDone(canSync);

  const blocked = auth === "signedOut" && !publicPage;
  if (!ready || blocked) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="text-center">
          <div className="font-display text-3xl font-bold grad-text">journey</div>
          {auth === "syncing" && <p className="mt-2 text-sm text-muted">Sincronizando tus datos…</p>}
        </div>
      </div>
    );
  }

  const showNav = onboarded && auth !== "signedOut" && !["/onboarding", "/legal", "/salud", "/login"].includes(pathname);
  return (
    <>
      <main className={showNav ? "mx-auto max-w-lg overflow-x-clip px-4 pb-28" : "mx-auto max-w-lg overflow-x-clip px-4 pb-10"}>{children}</main>
      {showNav && <BottomNav />}
    </>
  );
}

/** Envía la rutina al servidor de notificaciones cuando cambia (y una vez al día). */
function useReminderSync(hydrated: boolean) {
  const profile = useApp((s) => s.profile);
  const overrides = useApp((s) => s.overrides);
  const pushEnabled = useApp((s) => s.pushEnabled);
  const deviceId = useApp((s) => s.deviceId);
  useEffect(() => {
    if (!hydrated || !pushEnabled) return;
    const t = setTimeout(() => {
      syncReminders(deviceId, buildWeeklyReminders(profile, overrides));
    }, 1500);
    return () => clearTimeout(t);
  }, [hydrated, pushEnabled, profile, overrides, deviceId]);
}

/** Trae lo que marcaste como "Hecho" desde una notificación. */
function useRemoteDone(hydrated: boolean) {
  const pushEnabled = useApp((s) => s.pushEnabled);
  const deviceId = useApp((s) => s.deviceId);
  useEffect(() => {
    if (!hydrated || !pushEnabled) return;
    const pull = async () => {
      const key = dateKey();
      const items = await fetchDoneRemote(deviceId, key);
      const { checks, toggleCheck } = useApp.getState();
      for (const id of items) if (!checks[key]?.[id]) toggleCheck(key, id, true);
    };
    pull();
    const vis = () => document.visibilityState === "visible" && pull();
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, [hydrated, pushEnabled, deviceId]);
}

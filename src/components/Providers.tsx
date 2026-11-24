"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp, exportableState } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { registerSW, syncReminders, fetchDoneRemote } from "@/lib/push-client";
import { buildWeeklyReminders } from "@/lib/schedule";
import { dateKey } from "@/lib/date";
import { BottomNav } from "./BottomNav";

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

  // Preguntas iniciales y cuestionario de salud obligatorio
  const healthDone = useApp((s) => Boolean(s.profile.health?.disclaimerAcceptedAt));
  useEffect(() => {
    if (!hydrated || pathname === "/onboarding" || pathname === "/legal") return;
    if (!onboarded) router.replace("/onboarding");
    else if (!healthDone && pathname !== "/salud") router.replace("/salud");
  }, [hydrated, onboarded, healthDone, pathname, router]);

  useReminderSync(hydrated);
  useRemoteDone(hydrated);
  useCloudBackup(hydrated);

  if (!hydrated) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="font-display text-3xl font-bold grad-text">journey</div>
      </div>
    );
  }

  const showNav = onboarded && !["/onboarding", "/legal", "/salud"].includes(pathname);
  return (
    <>
      <main className={showNav ? "mx-auto max-w-lg px-4 pb-28" : "mx-auto max-w-lg px-4 pb-10"}>{children}</main>
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

/** Copia de seguridad automática en la nube si configuraste un código. */
function useCloudBackup(hydrated: boolean) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    return useApp.subscribe((state, prev) => {
      if (!state.syncCode || state.lastSyncAt !== prev.lastSyncAt) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const s = useApp.getState();
        if (!s.syncCode) return;
        const r = await fetch("/api/sync", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-sync-code": s.syncCode },
          body: JSON.stringify(exportableState(s)),
        }).catch(() => null);
        if (r?.ok) s.markSynced();
      }, 8000);
    });
  }, [hydrated]);
}

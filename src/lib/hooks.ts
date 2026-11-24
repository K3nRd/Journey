"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useApp } from "./store";
import { buildTimeline } from "./schedule";
import { menuForDay, targets } from "./nutrition";
import { sessionForDate, phaseFor, weekNumber } from "./workout";
import { trend } from "./progress";
import { dateKey, parseKey } from "./date";

/** true cuando los datos guardados ya se cargaron en el navegador. */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useApp.persist.onFinishHydration(cb),
    () => useApp.persist.hasHydrated(),
    () => false,
  );
}

/** Fecha/hora actual que se actualiza cada `ms`. */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    const vis = () => document.visibilityState === "visible" && setNow(new Date());
    document.addEventListener("visibilitychange", vis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [ms]);
  return now;
}

export function useCurrentWeight() {
  const weights = useApp((s) => s.weights);
  const start = useApp((s) => s.profile.startWeightLb);
  return useMemo(() => {
    const t = trend(weights);
    const last = weights.length ? [...weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1)! : null;
    return {
      trend: t.length ? t.at(-1)!.value : start,
      last: last?.value ?? start,
      lastDate: last?.date,
      series: t,
    };
  }, [weights, start]);
}

export function useTargets() {
  const profile = useApp((s) => s.profile);
  const { trend: w } = useCurrentWeight();
  return useMemo(() => targets(profile, w), [profile, w]);
}

export function useDay(key: string = dateKey()) {
  const profile = useApp((s) => s.profile);
  const overrides = useApp((s) => s.overrides);
  const swaps = useApp((s) => s.menuSwaps);
  const t = useTargets();
  return useMemo(() => {
    const wd = parseKey(key).getDay();
    const timeline = buildTimeline(profile, key, { overrides });
    const session = sessionForDate(profile, key);
    const menu = menuForDay(wd, swaps[wd], profile, t.kcal);
    const phase = phaseFor(profile, key);
    const week = weekNumber(profile, key);
    return { key, weekday: wd, timeline, session, menu, phase, week };
  }, [profile, overrides, swaps, t.kcal, key]);
}

/** Porcentaje del checklist completado en una fecha. */
export function completionFor(
  checks: Record<string, Record<string, boolean>>,
  profile: ReturnType<typeof useApp.getState>["profile"],
  overrides: Record<string, string>,
  key: string,
) {
  const items = buildTimeline(profile, key, { overrides }).filter((i) => i.checkable);
  if (!items.length) return 0;
  const day = checks[key] ?? {};
  return items.filter((i) => day[i.id]).length / items.length;
}

import { WEEK_PLAN, type DayPlan, type PlanExercise } from "@/data/workouts";
import { getExercise } from "@/data/exercises";
import type { Profile, WorkoutLog, ExerciseLog } from "./types";
import { daysBetween, parseKey } from "./date";

const STRENGTH = WEEK_PLAN.filter((d) => d.type === "fuerza");
const REST = WEEK_PLAN.find((d) => d.type === "descanso")!;
const CARDIO = WEEK_PLAN.find((d) => d.type === "cardio")!;

/** Asigna las 5 sesiones de fuerza a los días de gimnasio elegidos, en orden. */
export function sessionForDate(p: Pick<Profile, "gymDays" | "saturdayCardio">, key: string): DayPlan {
  const wd = parseKey(key).getDay();
  const days = [...p.gymDays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)); // lunes primero
  const idx = days.indexOf(wd);
  if (idx >= 0) return { ...STRENGTH[idx % STRENGTH.length], weekday: wd };
  if (p.saturdayCardio && wd === 6) return CARDIO;
  return { ...REST, weekday: wd };
}

export function sessionByKey(p: Pick<Profile, "gymDays" | "saturdayCardio">, planKey: string): DayPlan | undefined {
  return WEEK_PLAN.find((d) => d.key === planKey);
}

export type Phase = "adaptacion" | "normal" | "descarga";

export function weekNumber(p: Pick<Profile, "startDate">, key: string) {
  return Math.max(1, Math.floor(daysBetween(p.startDate, key) / 7) + 1);
}

export function phaseFor(p: Pick<Profile, "startDate">, key: string): Phase {
  const w = weekNumber(p, key);
  if (w <= 2) return "adaptacion";
  if (w % 7 === 0) return "descarga"; // semana 7, 14, 21…
  return "normal";
}

export const PHASE_INFO: Record<Phase, { label: string; desc: string; rir: string }> = {
  adaptacion: {
    label: "Adaptación",
    desc: "Semanas 1–2: una serie menos, pesos cómodos y técnica perfecta. Termina cada serie con 3 repeticiones en reserva.",
    rir: "Deja 3 reps en reserva",
  },
  normal: {
    label: "Progresión",
    desc: "Busca completar el rango de repeticiones. Cuando lo logres en todas las series, sube el peso.",
    rir: "Deja 1–2 reps en reserva",
  },
  descarga: {
    label: "Semana de descarga",
    desc: "Una serie menos y 10% menos de peso para recuperar articulaciones y sistema nervioso. Vuelves más fuerte la próxima semana.",
    rir: "Deja 3–4 reps en reserva",
  },
};

export function adjustedSets(ex: PlanExercise, phase: Phase) {
  if (ex.sets <= 1) return ex.sets;
  return phase === "normal" ? ex.sets : Math.max(2, ex.sets - 1);
}

export function sessionExercises(day: DayPlan, phase: Phase, short: boolean): PlanExercise[] {
  const list = short ? day.exercises.filter((e) => e.key) : day.exercises;
  return list.map((e) => ({ ...e, sets: adjustedSets(e, phase) }));
}

export function repRange(reps: string): [number, number] | null {
  const m = reps.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return [Number(m[1]), Number(m[2])];
  const one = reps.match(/^(\d+)/);
  return one ? [Number(one[1]), Number(one[1])] : null;
}

/** Último registro de un ejercicio (por id real o del plan). */
export function lastLogFor(history: WorkoutLog[], exId: string): ExerciseLog | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    const w = history[i];
    if (!w.finishedAt) continue;
    const e = w.exercises.find((x) => x.exId === exId && x.sets.some((s) => s.done));
    if (e) return e;
  }
  return undefined;
}

export function recentLogsFor(history: WorkoutLog[], exId: string, n: number): ExerciseLog[] {
  const out: ExerciseLog[] = [];
  for (let i = history.length - 1; i >= 0 && out.length < n; i--) {
    const e = history[i].finishedAt && history[i].exercises.find((x) => x.exId === exId && x.sets.some((s) => s.done));
    if (e) out.push(e);
  }
  return out;
}

export interface Suggestion {
  weight: number;
  message: string;
  trend: "subir" | "mantener" | "bajar" | "nuevo";
}

/** Progresión doble: completa el rango en todas las series → sube el peso. */
export function suggestWeight(history: WorkoutLog[], exId: string, reps: string, phase: Phase): Suggestion {
  const ex = getExercise(exId);
  const inc = ex.increment ?? 5;
  const range = repRange(reps);
  const recent = recentLogsFor(history, exId, 2);
  const last = recent[0];
  if (!last || !range || ex.timed) {
    return {
      weight: last ? topWeight(last) : 0,
      message: last ? "Repite el peso de la última vez." : "Primera vez: elige un peso con el que hagas todas las reps con buena técnica.",
      trend: last ? "mantener" : "nuevo",
    };
  }
  const w = topWeight(last);
  const done = last.sets.filter((s) => s.done);
  const [lo, hi] = range;
  if (phase === "descarga") {
    return { weight: roundTo(w * 0.9, inc), message: "Descarga: 10% menos de peso.", trend: "bajar" };
  }
  if (phase === "adaptacion") {
    const allTop = done.length > 0 && done.every((s) => s.reps >= hi);
    return allTop
      ? { weight: w + inc, message: `Completaste todo: prueba +${inc} lb sin forzar.`, trend: "subir" }
      : { weight: w, message: "Adaptación: mantén el peso y cuida la técnica.", trend: "mantener" };
  }
  if (done.length > 0 && done.every((s) => s.reps >= hi)) {
    return { weight: w + inc, message: `¡Completaste el rango! Sube a ${w + inc} lb.`, trend: "subir" };
  }
  const prev = recent[1];
  const failed = (l: ExerciseLog) => l.sets.filter((s) => s.done).some((s) => s.reps < lo);
  if (prev && failed(last) && failed(prev)) {
    const nw = roundTo(w * 0.95, inc);
    return { weight: nw, message: `Dos sesiones por debajo de ${lo} reps: baja a ${nw} lb y vuelve a subir.`, trend: "bajar" };
  }
  return { weight: w, message: `Mantén ${w} lb e intenta llegar a ${hi} reps en todas las series.`, trend: "mantener" };
}

export function topWeight(e: ExerciseLog) {
  return e.sets.filter((s) => s.done).reduce((m, s) => Math.max(m, s.weight), 0);
}

const roundTo = (w: number, inc: number) => Math.max(0, Math.round(w / inc) * inc);

/** 1RM estimado (Epley). */
export const e1rm = (w: number, reps: number) => (reps <= 0 ? 0 : reps === 1 ? w : w * (1 + reps / 30));

export function bestE1rm(history: WorkoutLog[], exId: string, excludeId?: string) {
  let best = 0;
  for (const w of history) {
    if (w.id === excludeId || !w.finishedAt) continue;
    for (const e of w.exercises) {
      if (e.exId !== exId) continue;
      for (const s of e.sets) if (s.done && s.weight > 0) best = Math.max(best, e1rm(s.weight, s.reps));
    }
  }
  return best;
}

/** Récords logrados en un entrenamiento. */
export function prsIn(history: WorkoutLog[], log: WorkoutLog) {
  const out: { exId: string; weight: number; reps: number }[] = [];
  for (const e of log.exercises) {
    const prev = bestE1rm(history, e.exId, log.id);
    let bestSet: { weight: number; reps: number; v: number } | null = null;
    for (const s of e.sets) {
      if (!s.done || s.weight <= 0) continue;
      const v = e1rm(s.weight, s.reps);
      if (!bestSet || v > bestSet.v) bestSet = { weight: s.weight, reps: s.reps, v };
    }
    if (bestSet && prev > 0 && bestSet.v > prev + 0.01) out.push({ exId: e.exId, weight: bestSet.weight, reps: bestSet.reps });
  }
  return out;
}

/** Calculadora de discos (lb). */
export function plates(target: number, bar = 45): { perSide: number[]; achieved: number } {
  const avail = [45, 35, 25, 10, 5, 2.5];
  let side = Math.max(0, (target - bar) / 2);
  const perSide: number[] = [];
  for (const p of avail) {
    while (side >= p - 1e-9) {
      perSide.push(p);
      side -= p;
    }
  }
  const achieved = bar + perSide.reduce((a, b) => a + b, 0) * 2;
  return { perSide, achieved };
}

export const isBarbell = (exId: string) => /Barbell|Smith|Bench_Press_-_Medium|Squat$|Romanian_Deadlift|Hip_Thrust/.test(exId) && !/Dumbbell|Goblet|Bodyweight/.test(exId);

export function volume(log: WorkoutLog) {
  return log.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).reduce((b, s) => b + s.weight * s.reps, 0), 0);
}

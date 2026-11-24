import { addDays, daysBetween, dateKey, parseKey } from "./date";
import type { Goal } from "./types";

export interface Entry {
  date: string;
  value: number;
}

/** Media móvil exponencial: suaviza el agua/sal del día a día. */
export function trend(entries: Entry[], alpha = 0.3): Entry[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const out: Entry[] = [];
  let t: number | null = null;
  for (const e of sorted) {
    t = t === null ? e.value : t + alpha * (e.value - t);
    out.push({ date: e.date, value: Math.round(t * 10) / 10 });
  }
  return out;
}

/** Ritmo semanal (lb/semana, negativo = bajando) por regresión lineal sobre los últimos `days`. */
export function weeklyRate(entries: Entry[], days = 21): number | null {
  if (entries.length < 3) return null;
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1].date;
  const recent = sorted.filter((e) => daysBetween(e.date, last) <= days);
  if (recent.length < 3) return null;
  const span = daysBetween(recent[0].date, last);
  if (span < 6) return null;
  const xs = recent.map((e) => daysBetween(recent[0].date, e.date));
  const ys = recent.map((e) => e.value);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  if (den === 0) return null;
  return (num / den) * 7;
}

export function projection(current: number, goal: number, rate: number | null): string | null {
  if (rate === null || Math.abs(current - goal) < 0.5) return null;
  const down = goal < current;
  if ((down && rate >= -0.05) || (!down && rate <= 0.05)) return null;
  const weeks = Math.abs(current - goal) / Math.abs(rate);
  if (weeks > 200) return null;
  return addDays(dateKey(), Math.round(weeks * 7));
}

export interface CalorieAdvice {
  delta: number; // kcal a sumar (negativo = bajar)
  message: string;
}

/** Revisión cada 2 semanas según el objetivo. */
export function calorieAdvice(rate: number | null, goal: Goal = "perder", weightLb = 200): CalorieAdvice | null {
  if (rate === null) return null;
  const pct = (rate / weightLb) * 100; // % del peso por semana (negativo = bajando)
  const f = (n: number) => Math.abs(n).toFixed(1);
  if (goal === "perder") {
    const loss = -pct;
    if (loss > 1.3) return { delta: 150, message: `Bajas ${f(rate)} lb/semana (${f(pct)} % de tu peso): demasiado rápido, puedes perder músculo. Sube 150 kcal.` };
    if (loss > 1.0) return { delta: 100, message: `Bajas ${f(rate)} lb/semana, un poco rápido. Sube 100 kcal para proteger tu músculo.` };
    if (loss < 0.2) return { delta: -150, message: `Bajas solo ${f(Math.min(0, rate))} lb/semana. Baja 150 kcal (o camina 2,000 pasos más al día).` };
    if (loss < 0.4) return { delta: -100, message: `Bajas ${f(rate)} lb/semana, algo lento. Baja 100 kcal.` };
    return { delta: 0, message: `Bajas ${f(rate)} lb/semana (${f(pct)} % de tu peso): justo en el rango ideal. No cambies nada.` };
  }
  if (goal === "ganar") {
    if (pct > 0.75) return { delta: -150, message: `Subes ${f(rate)} lb/semana: muy rápido, será más grasa que músculo. Baja 150 kcal.` };
    if (pct > 0.5) return { delta: -100, message: `Subes ${f(rate)} lb/semana, algo rápido. Baja 100 kcal.` };
    if (pct < 0.1) return { delta: 150, message: `Casi no estás subiendo (${f(Math.max(0, rate))} lb/semana). Sube 150 kcal: añade una merienda o más arroz/avena.` };
    if (pct < 0.2) return { delta: 100, message: `Subes ${f(rate)} lb/semana, un poco lento. Sube 100 kcal.` };
    return { delta: 0, message: `Subes ${f(rate)} lb/semana: ritmo ideal para ganar músculo. No cambies nada.` };
  }
  if (pct < -0.3) return { delta: 100, message: `Estás bajando ${f(rate)} lb/semana. Para mantenerte, sube 100 kcal.` };
  if (pct > 0.3) return { delta: -100, message: `Estás subiendo ${f(rate)} lb/semana. Para mantenerte, baja 100 kcal.` };
  return { delta: 0, message: "Tu peso está estable: tus calorías están bien." };
}

/** Racha con margen: un día fallado no rompe la racha si los dos anteriores se cumplieron. */
export function streak(completion: (key: string) => number, threshold = 0.7): number {
  let n = 0;
  let graceUsed = 0;
  let key = dateKey();
  // Hoy cuenta solo si ya se cumplió
  if (completion(key) < threshold) key = addDays(key, -1);
  for (let i = 0; i < 400; i++) {
    const c = completion(key);
    if (c >= threshold) {
      n++;
    } else if (graceUsed < Math.floor(n / 7) + 1 && n > 0) {
      graceUsed++;
    } else break;
    key = addDays(key, -1);
  }
  return n;
}

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
}

export interface AchievementInput {
  goal?: Goal;
  startWeight: number;
  currentTrend: number | null;
  goalWeight: number;
  workouts: number;
  startWaist?: number;
  currentWaist?: number;
  streak: number;
  reviews: number;
  photos: number;
  prs: number;
}

export function achievements(i: AchievementInput): (Achievement & { done: boolean })[] {
  const goal = i.goal ?? "perder";
  const dir = goal === "ganar" ? -1 : 1;
  const lost = i.currentTrend !== null ? (i.startWeight - i.currentTrend) * dir : 0; // avance hacia la meta
  const waistLost = i.startWaist && i.currentWaist ? i.startWaist - i.currentWaist : 0;
  const totalToLose = Math.abs(i.startWeight - i.goalWeight);
  const list: (Achievement & { done: boolean })[] = [
    { id: "w1", emoji: "🏁", title: "Primer entrenamiento", desc: "Completaste tu primera sesión.", done: i.workouts >= 1 },
    { id: "w10", emoji: "💪", title: "10 entrenamientos", desc: "Ya es un hábito.", done: i.workouts >= 10 },
    { id: "w25", emoji: "🔥", title: "25 entrenamientos", desc: "Un mes y algo de constancia.", done: i.workouts >= 25 },
    { id: "w50", emoji: "🏆", title: "50 entrenamientos", desc: "Disciplina de verdad.", done: i.workouts >= 50 },
    { id: "w100", emoji: "👑", title: "100 entrenamientos", desc: "Estilo de vida.", done: i.workouts >= 100 },
  ];
  if (goal !== "mantener") {
    for (const lb of [5, 10, 15, 20, 25, 30]) {
      if (lb > totalToLose + 0.01 && lb !== 5) continue;
      list.push({
        id: `lb${lb}`,
        emoji: lb >= 20 ? "🌟" : goal === "ganar" ? "📈" : "📉",
        title: `${goal === "ganar" ? "+" : "−"}${lb} lb`,
        desc: `Tu tendencia ${goal === "ganar" ? "subió" : "bajó"} ${lb} libras.`,
        done: lost >= lb,
      });
    }
    list.push({
      id: "goal",
      emoji: "🎯",
      title: "¡Meta alcanzada!",
      desc: `Llegaste a ${i.goalWeight} lb.`,
      done: i.currentTrend !== null && (goal === "ganar" ? i.currentTrend >= i.goalWeight : i.currentTrend <= i.goalWeight),
    });
  }
  for (const inch of [1, 2, 4]) {
    list.push({ id: `in${inch}`, emoji: "📏", title: `−${inch}" de cintura`, desc: `Tu cintura bajó ${inch} pulgada${inch > 1 ? "s" : ""}.`, done: waistLost >= inch });
  }
  list.push(
    { id: "s7", emoji: "📅", title: "Racha de 7 días", desc: "Una semana cumpliendo tu rutina.", done: i.streak >= 7 },
    { id: "s30", emoji: "🗓️", title: "Racha de 30 días", desc: "Un mes completo.", done: i.streak >= 30 },
    { id: "rev1", emoji: "📝", title: "Primera revisión", desc: "Hiciste tu primera revisión semanal.", done: i.reviews >= 1 },
    { id: "photo1", emoji: "📸", title: "Punto de partida", desc: "Tomaste tus primeras fotos.", done: i.photos >= 1 },
    { id: "pr1", emoji: "⚡", title: "Primer récord", desc: "Superaste tu mejor marca en un ejercicio.", done: i.prs >= 1 },
    { id: "pr10", emoji: "🚀", title: "10 récords", desc: "Tu fuerza está volviendo.", done: i.prs >= 10 },
  );
  return list;
}

export function lastNDays(n: number, end = dateKey()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i));
  return out;
}

export function inRange(key: string, from: string, to: string) {
  return key >= from && key <= to;
}

export function avg(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

export const monthLabel = (key: string) => {
  const d = parseKey(key);
  return d.toLocaleDateString("es-DO", { month: "long", year: "numeric" });
};

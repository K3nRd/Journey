import type { Goal, MealSlot, Profile } from "./types";

/**
 * Comidas del día según cuántas haga la persona (basado en evidencia):
 * - Desayuno y almuerzo siempre: comer más temprano y no pasar más de ~5 h sin comer.
 * - 4 comidas: + merienda (pre-entreno los días de gimnasio).
 * - 5 comidas: + media mañana, o merienda nocturna de proteína si el objetivo es ganar músculo (ISSN).
 */
export function slotsFor(count: 3 | 4 | 5, goal: Goal = "perder"): MealSlot[] {
  if (count === 3) return ["comida1", "almuerzo", "cena"];
  if (count === 4) return ["comida1", "almuerzo", "merienda", "cena"];
  return goal === "ganar" ? ["comida1", "almuerzo", "merienda", "cena", "snack"] : ["comida1", "snack", "almuerzo", "merienda", "cena"];
}

/** Reparto de calorías: más peso en desayuno y almuerzo, cena moderada (crononutrición). */
export function sharesFor(count: 3 | 4 | 5, goal: Goal): Record<MealSlot, number> {
  const s: Record<MealSlot, number> = { comida1: 0, almuerzo: 0, merienda: 0, cena: 0, snack: 0 };
  if (count === 3) Object.assign(s, { comida1: 0.3, almuerzo: 0.4, cena: 0.3 });
  else if (count === 4) Object.assign(s, { comida1: 0.25, almuerzo: 0.35, merienda: 0.13, cena: 0.27 });
  else
    Object.assign(
      s,
      goal === "ganar"
        ? { comida1: 0.22, almuerzo: 0.3, merienda: 0.14, cena: 0.24, snack: 0.1 }
        : { comida1: 0.22, snack: 0.1, almuerzo: 0.3, merienda: 0.12, cena: 0.26 },
    );
  return s;
}

/**
 * Cuántas comidas recomendamos. Lo que más importa es el total del día (AHA);
 * repartir la proteína cada 3–4 h (ISSN) favorece el músculo, y quien entrena
 * necesita una merienda antes del gimnasio.
 */
export function suggestedMeals(kcal: number, goal: Goal, _proteinG?: number, trains = true): 3 | 4 | 5 {
  if (goal === "ganar") return kcal >= 2600 ? 5 : 4;
  if (kcal < 1700 && !trains) return 3;
  return 4;
}

export function mealsPerDay(p: Pick<Profile, "mealsPerDay">): 3 | 4 | 5 {
  return p.mealsPerDay ?? 4;
}

export const goalOf = (p: Pick<Profile, "goal">): Goal => p.goal ?? "perder";

export function slotLabel(slot: MealSlot, _count: 3 | 4 | 5, gymDay: boolean, goal: Goal): string {
  switch (slot) {
    case "comida1":
      return "Desayuno";
    case "almuerzo":
      return "Almuerzo";
    case "merienda":
      return gymDay ? "Merienda pre-entreno" : "Merienda";
    case "cena":
      return gymDay ? "Cena post-entreno" : "Cena";
    case "snack":
      return goal === "ganar" ? "Merienda de proteína" : "Media mañana";
  }
}

export const GOAL_INFO: Record<Goal, { label: string; short: string; desc: string; emoji: string }> = {
  perder: { label: "Bajar grasa", short: "Bajar", desc: "Perder grasa conservando el músculo", emoji: "🔥" },
  mantener: { label: "Mantenerme", short: "Mantener", desc: "Mantener tu peso y mejorar tu forma", emoji: "⚖️" },
  ganar: { label: "Ganar músculo", short: "Ganar", desc: "Subir de peso con músculo, sin mucha grasa", emoji: "💪" },
};

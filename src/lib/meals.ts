import type { Goal, MealSlot, Profile } from "./types";

/** Comidas del día según cuántas haga la persona. */
export function slotsFor(count: 3 | 4 | 5): MealSlot[] {
  if (count === 5) return ["comida1", "snack", "almuerzo", "merienda", "cena"];
  if (count === 4) return ["comida1", "almuerzo", "merienda", "cena"];
  return ["comida1", "merienda", "cena"];
}

/** Reparto de las calorías del día entre las comidas. */
export function sharesFor(count: 3 | 4 | 5, goal: Goal): Record<MealSlot, number> {
  const s: Record<MealSlot, number> = { comida1: 0, almuerzo: 0, merienda: 0, cena: 0, snack: 0 };
  if (count === 3) Object.assign(s, { comida1: 0.38, merienda: 0.2, cena: 0.42 });
  else if (count === 4) Object.assign(s, { comida1: 0.25, almuerzo: 0.32, merienda: 0.15, cena: 0.28 });
  else
    Object.assign(
      s,
      goal === "ganar"
        ? { comida1: 0.22, almuerzo: 0.27, merienda: 0.14, cena: 0.25, snack: 0.12 }
        : { comida1: 0.22, snack: 0.1, almuerzo: 0.28, merienda: 0.12, cena: 0.28 },
    );
  return s;
}

/**
 * Cuántas comidas recomendamos. Lo que más importa es el total del día;
 * repartirlo en más comidas ayuda cuando hay que comer mucho (ganar músculo)
 * y a repartir la proteína (unos 25–40 g por comida).
 */
export function suggestedMeals(kcal: number, goal: Goal, proteinG: number): 3 | 4 | 5 {
  if (goal === "ganar") return kcal >= 3000 ? 5 : 4;
  if (kcal >= 2800 || proteinG >= 170) return 5;
  if (kcal >= 2300 || proteinG >= 140) return 4;
  return 3;
}

export function mealsPerDay(p: Pick<Profile, "mealsPerDay">): 3 | 4 | 5 {
  return p.mealsPerDay ?? 3;
}

export const goalOf = (p: Pick<Profile, "goal">): Goal => p.goal ?? "perder";

export function slotLabel(slot: MealSlot, count: 3 | 4 | 5, gymDay: boolean, goal: Goal): string {
  switch (slot) {
    case "comida1":
      return count >= 4 ? "Desayuno" : "Primera comida";
    case "almuerzo":
      return "Almuerzo";
    case "merienda":
      return gymDay ? "Merienda pre-entreno" : "Merienda";
    case "cena":
      return gymDay ? "Cena post-entreno" : "Cena";
    case "snack":
      return goal === "ganar" ? "Merienda nocturna" : "Merienda de media mañana";
  }
}

export const GOAL_INFO: Record<Goal, { label: string; short: string; desc: string; emoji: string }> = {
  perder: { label: "Bajar grasa", short: "Bajar", desc: "Perder grasa conservando el músculo", emoji: "🔥" },
  mantener: { label: "Mantenerme", short: "Mantener", desc: "Mantener tu peso y mejorar tu forma", emoji: "⚖️" },
  ganar: { label: "Ganar músculo", short: "Ganar", desc: "Subir de peso con músculo, sin mucha grasa", emoji: "💪" },
};

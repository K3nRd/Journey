import { FOOD, type Food } from "@/data/foods";
import { RECIPE, RECIPES, type Recipe } from "@/data/recipes";
import { RECIPE_POOL, baseRecipeFor } from "@/data/mealplan";
import { goalOf, mealsPerDay, sharesFor, slotsFor, suggestedMeals } from "./meals";
import { EXCLUDABLE } from "@/data/foods";
import type { Goal, MealSlot, Profile } from "./types";

export const LB_TO_KG = 0.45359237;

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const ZERO: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

export function scaleMacros(m: Macros, k: number): Macros {
  return { kcal: m.kcal * k, protein: m.protein * k, carbs: m.carbs * k, fat: m.fat * k };
}

export function foodMacros(food: Food, grams: number): Macros {
  const k = grams / 100;
  return { kcal: food.kcal * k, protein: food.protein * k, carbs: food.carbs * k, fat: food.fat * k };
}

export function recipeMacros(r: Recipe, scale = 1): Macros {
  return r.ingredients.reduce((acc, ing) => {
    const f = FOOD[ing.food];
    if (!f) return acc;
    return addMacros(acc, foodMacros(f, ing.g * scale));
  }, ZERO);
}

// ── Energía ───────────────────────────────────────────

export function bmr(p: Pick<Profile, "sex" | "age" | "heightCm">, weightLb: number) {
  const kg = weightLb * LB_TO_KG;
  const base = 10 * kg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === "m" ? base + 5 : base - 161;
}

export function activityFactor(p: Pick<Profile, "workType" | "gymDays">) {
  const base = p.workType === "sentado" ? 1.2 : p.workType === "mixto" ? 1.3 : 1.4;
  return base + 0.035 * p.gymDays.length;
}

export function tdee(p: Profile, weightLb: number) {
  return bmr(p, weightLb) * activityFactor(p);
}

export interface Targets {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  tdee: number;
  suggestedKcal: number;
  goal: Goal;
  meals: 3 | 4 | 5;
  suggestedMeals: 3 | 4 | 5;
}

/**
 * Calorías y macros según el objetivo:
 * - Bajar grasa: déficit moderado del 20 % (entre 300 y 750 kcal) → ~0.5–1 % del peso por semana.
 * - Mantener: el gasto estimado.
 * - Ganar músculo: superávit del 10 % → ~0.25–0.5 % del peso por semana.
 * Proteína 1.6–1.8 g/kg (ISSN: 1.4–2.0 g/kg con ejercicio).
 */
export function targets(p: Profile, currentWeightLb: number): Targets {
  const goal = goalOf(p);
  const t = tdee(p, currentWeightLb);
  const floor = p.sex === "m" ? 1700 : 1400;
  let raw: number;
  if (goal === "perder") raw = t - Math.min(750, Math.max(300, t * 0.2));
  else if (goal === "ganar") raw = t * 1.1;
  else raw = t;
  const suggested = Math.max(floor, Math.round(raw / 50) * 50);
  const kcal = p.calorieTarget ?? suggested;

  // Peso de referencia para la proteína: la meta al bajar (evita cifras enormes con mucho sobrepeso), el actual al mantener o ganar
  const refLb = goal === "perder" ? p.goalWeightLb || currentWeightLb : currentWeightLb;
  const perKg = goal === "ganar" ? 1.8 : 1.6;
  const protein = Math.round((refLb * LB_TO_KG * perKg) / 5) * 5;
  const fat = Math.round((kcal * (goal === "ganar" ? 0.25 : 0.27)) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const sugg = suggestedMeals(kcal, goal, protein, p.gymDays.length > 0);
  return { kcal, protein, fat, carbs, tdee: Math.round(t), suggestedKcal: suggested, goal, meals: mealsPerDay(p), suggestedMeals: sugg };
}

// ── Exclusiones ───────────────────────────────────────

export function excludedFoodIds(p: Pick<Profile, "excludedFoods">): Set<string> {
  const s = new Set<string>();
  for (const id of p.excludedFoods) {
    const ex = EXCLUDABLE.find((e) => e.id === id);
    ex?.matches.forEach((m) => s.add(m));
  }
  return s;
}

export function recipeAllowed(r: Recipe, excluded: Set<string>) {
  return !r.ingredients.some((i) => excluded.has(i.food));
}

// ── Menú del día con porciones ajustadas ──────────────

export interface PlannedMeal {
  slot: MealSlot;
  recipe: Recipe;
  scale: number;
  macros: Macros;
}

export function menuForDay(
  weekday: number,
  swaps: Partial<Record<MealSlot, string>> | undefined,
  p: Profile,
  kcalTarget: number,
): PlannedMeal[] {
  const excluded = excludedFoodIds(p);
  const count = mealsPerDay(p);
  const shares = sharesFor(count, goalOf(p));
  // ~5 % libre para café, condimentos, una fruta extra…
  const dayGoal = kcalTarget * 0.95;
  const used = new Set<string>();

  const meals: PlannedMeal[] = slotsFor(count, goalOf(p)).map((slot) => {
    const pool = RECIPE_POOL[slot];
    let r = RECIPE[swaps?.[slot] ?? baseRecipeFor(weekday, slot)];
    if (!r || !recipeAllowed(r, excluded) || (used.has(r.id) && !swaps?.[slot])) {
      r =
        RECIPES.find((x) => x.slots.includes(pool) && recipeAllowed(x, excluded) && !used.has(x.id)) ??
        RECIPES.find((x) => x.slots.includes(pool) && recipeAllowed(x, excluded)) ??
        RECIPE[baseRecipeFor(weekday, slot)];
    }
    used.add(r.id);
    return { slot, recipe: r, scale: portionScale(r, dayGoal * shares[slot]), macros: recipeMacros(r) };
  });

  // Segunda pasada: si por los topes de porción el día no cuadra, se reparte la diferencia
  for (let pass = 0; pass < 2; pass++) {
    const total = meals.reduce((a, m) => a + recipeMacros(m.recipe, m.scale).kcal, 0);
    if (!total || Math.abs(total - dayGoal) / dayGoal < 0.03) break;
    const f = dayGoal / total;
    for (const m of meals) m.scale = clampScale(m.scale * f);
  }
  for (const m of meals) m.macros = recipeMacros(m.recipe, m.scale);
  return meals;
}

const clampScale = (x: number) => Math.round(Math.min(2.2, Math.max(0.5, x)) * 20) / 20;

/** Porción (multiplicador) de una receta para llegar a las calorías de esa comida. */
export function portionScale(r: Recipe, kcalForMeal: number) {
  const base = recipeMacros(r).kcal || 1;
  return clampScale(kcalForMeal / base);
}

/** Calorías que le tocan a una comida del día (meta diaria × su parte). */
export function mealKcalTarget(p: Profile, kcalTarget: number, slot: MealSlot) {
  return kcalTarget * 0.95 * sharesFor(mealsPerDay(p), goalOf(p))[slot];
}

// ── Lista de compras ──────────────────────────────────

export interface ShoppingItem {
  food: Food;
  grams: number; // crudo / comprado
  units: number; // unidades de compra (redondeadas hacia arriba en 0.5)
  cost: number;
  inPantry: boolean;
}

export function rawGrams(food: Food, g: number) {
  return food.rawPerCooked ? g * food.rawPerCooked : g;
}

export function shoppingList(
  meals: PlannedMeal[],
  pantry: string[],
  priceOverrides: Record<string, number>,
): ShoppingItem[] {
  const totals = new Map<string, number>();
  for (const m of meals) {
    for (const ing of m.recipe.ingredients) {
      const f = FOOD[ing.food];
      if (!f) continue;
      totals.set(f.id, (totals.get(f.id) ?? 0) + rawGrams(f, ing.g * m.scale));
    }
  }
  const items: ShoppingItem[] = [];
  for (const [id, grams] of totals) {
    const food = FOOD[id];
    const price = priceOverrides[id] ?? food.price;
    const exactUnits = grams / food.gramsPerBuyUnit;
    const step = food.buyUnit === "lb" ? 0.5 : 1;
    const units = Math.max(step, Math.ceil(exactUnits / step) * step);
    const inPantry = pantry.includes(id);
    // El costo real de lo que se consume (no del paquete completo) para frascos/aceite/sazón
    const partial = food.buyUnit === "frasco" || food.buyUnit === "litro" || food.seasoning;
    const cost = inPantry ? 0 : Math.round((partial ? exactUnits : units) * price);
    items.push({ food, grams, units, cost, inPantry });
  }
  const order = ["Carnes y huevos", "Granos y cereales", "Víveres", "Vegetales", "Frutas", "Lácteos", "Enlatados", "Despensa"];
  return items.sort((a, b) => order.indexOf(a.food.aisle) - order.indexOf(b.food.aisle) || a.food.name.localeCompare(b.food.name));
}

// ── Presentación de cantidades ────────────────────────

export function formatQty(food: Food, g: number): string {
  if (food.seasoning && g <= 5) {
    if (food.id === "aceite") return `${Math.max(1, Math.round(g / 4.5))} cdta`;
    if (food.id === "ajo") return `${Math.max(1, Math.round(g / 5))} diente${Math.round(g / 5) > 1 ? "s" : ""}`;
    return "al gusto";
  }
  if (food.id === "aceite") {
    const cdta = g / 4.5;
    return cdta >= 3 ? `${(g / 13.5).toFixed(1).replace(".0", "")} cda` : `${Math.round(cdta)} cdta`;
  }
  if (food.unitLabel) {
    const n = g / food.unitLabel.grams;
    // Huevos y unidades pequeñas: enteros; víveres grandes: medios
    const r = food.unitLabel.grams <= 60 ? Math.max(1, Math.round(n)) : Math.round(n * 2) / 2;
    if (r >= 0.5) {
      const txt = r % 1 === 0 ? `${r}` : r === 0.5 ? "½" : `${Math.floor(r)}½`;
      return `${txt} ${r > 1 ? food.unitLabel.plural : food.unitLabel.singular} (${Math.round(g)} g)`;
    }
  }
  if (food.id === "leche") return `${Math.round(g)} ml (${(g / 240).toFixed(1).replace(".0", "")} taza)`;
  if (food.id === "arroz" || food.id === "habichuelas" || food.id === "lentejas" || food.id === "guandules" || food.id === "espaguetis") {
    const cups = g / 180;
    return `${Math.round(g)} g cocido (~${cups.toFixed(1).replace(".0", "")} taza)`;
  }
  if (food.id === "avena") return `${Math.round(g)} g (~${(g / 80).toFixed(1).replace(".0", "")} taza)`;
  return `${Math.round(g)} g`;
}

export function formatBuyQty(item: ShoppingItem): string {
  const f = item.food;
  const u = item.units;
  const n = u % 1 === 0 ? `${u}` : u < 1 ? "½" : `${Math.floor(u)}½`;
  switch (f.buyUnit) {
    case "lb":
      return `${n} lb`;
    case "unidad":
      return `${n} ${u === 1 ? "unidad" : "unidades"}`;
    case "litro":
      return `${n} ${u === 1 ? "litro" : "litros"}`;
    case "lata":
      return `${n} ${u === 1 ? "lata" : "latas"}`;
    case "paquete":
      return `${n} ${u === 1 ? "paquete" : "paquetes"}`;
    case "frasco":
      return `${n} ${u === 1 ? "frasco" : "frascos"}`;
  }
}

export const r0 = (n: number) => Math.round(n);

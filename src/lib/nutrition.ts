import { FOOD, type Food } from "@/data/foods";
import { RECIPE, RECIPES, type Recipe } from "@/data/recipes";
import { BASE_MENU } from "@/data/mealplan";
import { EXCLUDABLE } from "@/data/foods";
import type { MealSlot, Profile } from "./types";

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
}

export function targets(p: Profile, currentWeightLb: number): Targets {
  const t = tdee(p, currentWeightLb);
  const floor = p.sex === "m" ? 1700 : 1400;
  const suggested = Math.max(floor, Math.round((t - 500) / 50) * 50);
  const kcal = p.calorieTarget ?? suggested;
  const goalKg = p.goalWeightLb * LB_TO_KG;
  const protein = Math.round((goalKg * 1.6) / 5) * 5; // mínimo 1.6 g/kg de peso meta (ideal hasta 2 g/kg)
  const fat = Math.round((kcal * 0.27) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, fat, carbs, tdee: Math.round(t), suggestedKcal: suggested };
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
  const base = BASE_MENU[weekday];
  const slots: MealSlot[] = ["comida1", "merienda", "cena"];
  const chosen = slots.map((slot) => {
    let id = swaps?.[slot] ?? base[slot];
    let r = RECIPE[id];
    if (!r || !recipeAllowed(r, excluded)) {
      r = RECIPES.find((x) => x.slots.includes(slot) && recipeAllowed(x, excluded)) ?? RECIPE[base[slot]];
      id = r.id;
    }
    return { slot, recipe: r };
  });

  // Escalamos las porciones para acercarnos a la meta (dejamos ~5% libre para café, condimentos, etc.)
  const raw = chosen.reduce((acc, c) => addMacros(acc, recipeMacros(c.recipe)), ZERO);
  const goal = kcalTarget * 0.95;
  const scale = Math.min(1.35, Math.max(0.75, goal / raw.kcal));
  const rounded = Math.round(scale * 20) / 20;
  return chosen.map((c) => ({
    ...c,
    scale: rounded,
    macros: recipeMacros(c.recipe, rounded),
  }));
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

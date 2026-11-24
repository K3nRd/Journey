import { FOOD } from "@/data/foods";
import type { Recipe } from "@/data/recipes";
import { rawGrams } from "./nutrition";

export function recipeCost(r: Recipe, prices: Record<string, number>, scale = 1) {
  return Math.round(
    r.ingredients.reduce((a, i) => {
      const f = FOOD[i.food];
      if (!f) return a;
      const p = prices[f.id] ?? f.price;
      return a + (rawGrams(f, i.g * scale) / f.gramsPerBuyUnit) * p;
    }, 0),
  );
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function matchRecipe(r: Recipe, q: string) {
  if (!q.trim()) return true;
  const hay = norm([r.name, r.summary, ...r.tags, ...r.ingredients.map((i) => FOOD[i.food]?.name ?? "")].join(" "));
  return norm(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

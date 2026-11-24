import type { Ingredient, Recipe } from "./recipes";
import type { MealSlot } from "@/lib/types";

/** Pool de recetas: "comida1" (desayuno), "cena" (almuerzo y cena) o "merienda". */
type Pool = Extract<MealSlot, "comida1" | "merienda" | "cena">;

/**
 * Atajo para escribir recetas: ingredientes como "pechuga 150; arroz_integral 150 cocido; aceite 7".
 * Cada línea: id del alimento, gramos por porción y una nota opcional.
 */
export function rec(
  id: string,
  name: string,
  emoji: string,
  slots: Pool[],
  minutes: number,
  summary: string,
  ingredients: string,
  steps: string[],
  tags: string[],
  prep?: string,
): Recipe {
  const ing: Ingredient[] = ingredients
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => {
      const [food, g, ...note] = x.split(/\s+/);
      return note.length ? { food, g: Number(g), note: note.join(" ") } : { food, g: Number(g) };
    });
  return { id, name, emoji, slots, minutes, summary, ingredients: ing, steps, tags, ...(prep ? { prep } : {}) };
}

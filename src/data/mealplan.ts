import type { MealSlot } from "@/lib/types";

// Menú base por día de la semana (0 = domingo). Se puede cambiar cada comida en la app.
export const BASE_MENU: Record<number, Record<"comida1" | "merienda" | "cena", string>> = {
  0: { comida1: "batata-pollo-desmenuzado", merienda: "leche-avena-licuada", cena: "sancocho-ligero" },
  1: { comida1: "mangu-huevos", merienda: "avena-caliente", cena: "pechuga-guisada" },
  2: { comida1: "pollo-plancha-yuca", merienda: "huevos-guineo", cena: "habichuelas-arroz-huevo" },
  3: { comida1: "huevos-batata-aguacate", merienda: "batido-guineo", cena: "bandera-ligera" },
  4: { comida1: "ensalada-rusa-atun", merienda: "overnight-oats", cena: "locrio-pollo" },
  5: { comida1: "guineitos-huevo", merienda: "pan-mani-guineo", cena: "lentejas-pollo" },
  6: { comida1: "pancakes-avena", merienda: "batata-huevo", cena: "bowl-salteado" },
};

/** Menú base para cualquier comida: almuerzo y merienda extra se toman de otros días para variar. */
export function baseRecipeFor(weekday: number, slot: MealSlot): string {
  if (slot === "almuerzo") return BASE_MENU[(weekday + 3) % 7].cena;
  if (slot === "snack") return BASE_MENU[(weekday + 2) % 7].merienda;
  return BASE_MENU[weekday][slot];
}

/** Qué tipo de recetas sirven para cada comida. */
export const RECIPE_POOL: Record<MealSlot, "comida1" | "merienda" | "cena"> = {
  comida1: "comida1",
  almuerzo: "cena",
  merienda: "merienda",
  cena: "cena",
  snack: "merienda",
};

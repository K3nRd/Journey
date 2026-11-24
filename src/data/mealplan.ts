import type { MealSlot } from "@/lib/types";

// Menú base por día de la semana (0 = domingo). Se puede cambiar cada comida en la app.
export const BASE_MENU: Record<number, Record<MealSlot, string>> = {
  0: { comida1: "batata-pollo-desmenuzado", merienda: "leche-avena-licuada", cena: "sancocho-ligero" },
  1: { comida1: "mangu-huevos", merienda: "avena-caliente", cena: "pechuga-guisada" },
  2: { comida1: "pollo-plancha-yuca", merienda: "huevos-guineo", cena: "habichuelas-arroz-huevo" },
  3: { comida1: "huevos-batata-aguacate", merienda: "batido-guineo", cena: "bandera-ligera" },
  4: { comida1: "ensalada-rusa-atun", merienda: "overnight-oats", cena: "locrio-pollo" },
  5: { comida1: "guineitos-huevo", merienda: "pan-mani-guineo", cena: "lentejas-pollo" },
  6: { comida1: "pancakes-avena", merienda: "batata-huevo", cena: "bowl-salteado" },
};

export const SLOT_LABEL: Record<MealSlot, string> = {
  comida1: "Primera comida",
  merienda: "Merienda pre-entreno",
  cena: "Cena post-entreno",
};

export const SLOT_LABEL_REST: Record<MealSlot, string> = {
  comida1: "Primera comida",
  merienda: "Merienda",
  cena: "Cena",
};

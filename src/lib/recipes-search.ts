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

// Traducción simple español → inglés para buscar en TheMealDB
const DICT: Record<string, string> = {
  pollo: "chicken",
  pechuga: "chicken breast",
  res: "beef",
  carne: "beef",
  cerdo: "pork",
  huevo: "egg",
  huevos: "egg",
  arroz: "rice",
  habichuelas: "beans",
  frijoles: "beans",
  lentejas: "lentil",
  salmon: "salmon",
  atun: "tuna",
  pasta: "pasta",
  espaguetis: "spaghetti",
  papa: "potato",
  papas: "potato",
  batata: "sweet potato",
  avena: "oat",
  ensalada: "salad",
  sopa: "soup",
  guiso: "stew",
  guisado: "stew",
  pavo: "turkey",
  cordero: "lamb",
  tomate: "tomato",
  aguacate: "avocado",
  platano: "plantain",
  guineo: "banana",
  queso: "cheese",
  hamburguesa: "burger",
  tacos: "tacos",
  curry: "curry",
  pancakes: "pancakes",
  panqueques: "pancakes",
  wrap: "wrap",
  pizza: "pizza",
};

export function toEnglish(q: string) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  for (const w of words) if (DICT[w]) return DICT[w];
  return words[0] ?? "";
}

// Pescados/mariscos y berenjena para avisar en recetas de internet
const FISH = ["cod", "tilapia", "haddock", "mackerel", "sardine", "anchov", "herring", "trout", "bass", "snapper", "halibut", "fish", "monkfish", "kipper", "prawn", "shrimp", "squid", "octopus", "mussel", "clam", "crab", "lobster", "scallop"];
export function externalWarnings(ingredients: string[], excluded: string[]) {
  const all = ingredients.map((i) => i.toLowerCase());
  const w: string[] = [];
  if (excluded.includes("pescado") && all.some((i) => FISH.some((f) => i.includes(f)) && !i.includes("salmon") && !i.includes("tuna")))
    w.push("Lleva pescado o mariscos");
  if (excluded.includes("berenjena") && all.some((i) => i.includes("aubergine") || i.includes("eggplant"))) w.push("Lleva berenjena");
  if (excluded.includes("res") && all.some((i) => i.includes("beef"))) w.push("Lleva res");
  if (excluded.includes("lacteos") && all.some((i) => /milk|cheese|cream|butter|yogurt/.test(i))) w.push("Lleva lácteos");
  return w;
}

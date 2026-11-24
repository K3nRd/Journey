// Valores nutricionales por 100 g (o 100 ml) aproximados a partir de USDA FoodData Central.
// Precios: estimaciones para supermercados/colmados de Santo Domingo (editables en la app).

export type BuyUnit = "lb" | "unidad" | "litro" | "lata" | "paquete" | "frasco";
export type Aisle =
  | "Carnes y huevos"
  | "Granos y cereales"
  | "Víveres"
  | "Vegetales"
  | "Frutas"
  | "Lácteos"
  | "Enlatados"
  | "Despensa";

export interface Food {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  aisle: Aisle;
  buyName: string;
  buyUnit: BuyUnit;
  price: number; // RD$ por buyUnit
  gramsPerBuyUnit: number; // gramos de producto crudo/comprado por unidad de compra
  rawPerCooked?: number; // gramos crudos por gramo cocido (arroz, habichuelas…)
  unitLabel?: { grams: number; singular: string; plural: string }; // "1 huevo"
  pantryDefault?: boolean;
  seasoning?: boolean; // no se cuenta en la lista si está en la despensa
}

export const FOODS: Food[] = [
  // Carnes y huevos
  { id: "pechuga", name: "Pechuga de pollo", kcal: 120, protein: 22.5, carbs: 0, fat: 2.6, aisle: "Carnes y huevos", buyName: "Pechuga de pollo deshuesada", buyUnit: "lb", price: 175, gramsPerBuyUnit: 454 },
  { id: "muslo", name: "Muslo de pollo sin piel", kcal: 121, protein: 19.7, carbs: 0, fat: 4.1, aisle: "Carnes y huevos", buyName: "Muslos de pollo", buyUnit: "lb", price: 95, gramsPerBuyUnit: 340 /* con hueso → ~75% comestible */ },
  { id: "huevo", name: "Huevo", kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5, aisle: "Carnes y huevos", buyName: "Huevos", buyUnit: "unidad", price: 9, gramsPerBuyUnit: 50, unitLabel: { grams: 50, singular: "huevo", plural: "huevos" } },
  { id: "carne_molida", name: "Carne molida de res (magra)", kcal: 176, protein: 20, carbs: 0, fat: 10, aisle: "Carnes y huevos", buyName: "Carne molida de res magra", buyUnit: "lb", price: 190, gramsPerBuyUnit: 454 },

  // Granos y cereales
  { id: "arroz", name: "Arroz blanco (cocido)", kcal: 130, protein: 2.7, carbs: 28.2, fat: 0.3, aisle: "Granos y cereales", buyName: "Arroz", buyUnit: "lb", price: 40, gramsPerBuyUnit: 454, rawPerCooked: 0.36, pantryDefault: true },
  { id: "habichuelas", name: "Habichuelas rojas (cocidas)", kcal: 127, protein: 8.7, carbs: 22.8, fat: 0.5, aisle: "Granos y cereales", buyName: "Habichuelas rojas secas", buyUnit: "lb", price: 85, gramsPerBuyUnit: 454, rawPerCooked: 0.4 },
  { id: "lentejas", name: "Lentejas (cocidas)", kcal: 116, protein: 9, carbs: 20.1, fat: 0.4, aisle: "Granos y cereales", buyName: "Lentejas secas", buyUnit: "lb", price: 75, gramsPerBuyUnit: 454, rawPerCooked: 0.42 },
  { id: "avena", name: "Avena en hojuelas", kcal: 379, protein: 13.2, carbs: 67.7, fat: 6.5, aisle: "Granos y cereales", buyName: "Avena en hojuelas", buyUnit: "lb", price: 110, gramsPerBuyUnit: 454 },
  { id: "pan_integral", name: "Pan integral", kcal: 250, protein: 12, carbs: 43, fat: 3.5, aisle: "Granos y cereales", buyName: "Pan integral (funda)", buyUnit: "paquete", price: 135, gramsPerBuyUnit: 560, unitLabel: { grams: 28, singular: "rebanada", plural: "rebanadas" } },
  { id: "espaguetis", name: "Espaguetis (cocidos)", kcal: 158, protein: 5.8, carbs: 30.9, fat: 0.9, aisle: "Granos y cereales", buyName: "Espaguetis", buyUnit: "paquete", price: 50, gramsPerBuyUnit: 454, rawPerCooked: 0.42 },

  // Víveres
  { id: "platano_verde", name: "Plátano verde", kcal: 122, protein: 1.3, carbs: 31.9, fat: 0.4, aisle: "Víveres", buyName: "Plátanos verdes", buyUnit: "unidad", price: 25, gramsPerBuyUnit: 220, unitLabel: { grams: 220, singular: "plátano", plural: "plátanos" } },
  { id: "platano_maduro", name: "Plátano maduro", kcal: 122, protein: 1.3, carbs: 31.9, fat: 0.4, aisle: "Víveres", buyName: "Plátanos maduros", buyUnit: "unidad", price: 25, gramsPerBuyUnit: 220, unitLabel: { grams: 220, singular: "plátano", plural: "plátanos" } },
  { id: "guineo_verde", name: "Guineo verde", kcal: 105, protein: 1.3, carbs: 25, fat: 0.3, aisle: "Víveres", buyName: "Guineítos verdes", buyUnit: "unidad", price: 8, gramsPerBuyUnit: 110, unitLabel: { grams: 110, singular: "guineíto", plural: "guineítos" } },
  { id: "batata", name: "Batata", kcal: 86, protein: 1.6, carbs: 20.1, fat: 0.1, aisle: "Víveres", buyName: "Batata", buyUnit: "lb", price: 35, gramsPerBuyUnit: 454 },
  { id: "yuca", name: "Yuca", kcal: 160, protein: 1.4, carbs: 38.1, fat: 0.3, aisle: "Víveres", buyName: "Yuca", buyUnit: "lb", price: 30, gramsPerBuyUnit: 400 },
  { id: "papa", name: "Papa", kcal: 77, protein: 2, carbs: 17, fat: 0.1, aisle: "Víveres", buyName: "Papas", buyUnit: "lb", price: 40, gramsPerBuyUnit: 454 },
  { id: "auyama", name: "Auyama", kcal: 26, protein: 1, carbs: 6.5, fat: 0.1, aisle: "Víveres", buyName: "Auyama", buyUnit: "lb", price: 25, gramsPerBuyUnit: 400 },

  // Vegetales
  { id: "tomate", name: "Tomate", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, aisle: "Vegetales", buyName: "Tomates", buyUnit: "lb", price: 45, gramsPerBuyUnit: 454 },
  { id: "cebolla", name: "Cebolla", kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, aisle: "Vegetales", buyName: "Cebollas", buyUnit: "lb", price: 50, gramsPerBuyUnit: 454 },
  { id: "aji", name: "Ají morrón", kcal: 26, protein: 1, carbs: 6, fat: 0.3, aisle: "Vegetales", buyName: "Ají morrón", buyUnit: "lb", price: 60, gramsPerBuyUnit: 454 },
  { id: "lechuga", name: "Lechuga", kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2, aisle: "Vegetales", buyName: "Lechuga", buyUnit: "unidad", price: 50, gramsPerBuyUnit: 350 },
  { id: "repollo", name: "Repollo", kcal: 25, protein: 1.3, carbs: 5.8, fat: 0.1, aisle: "Vegetales", buyName: "Repollo", buyUnit: "lb", price: 30, gramsPerBuyUnit: 454 },
  { id: "zanahoria", name: "Zanahoria", kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, aisle: "Vegetales", buyName: "Zanahorias", buyUnit: "lb", price: 35, gramsPerBuyUnit: 454 },
  { id: "pepino", name: "Pepino", kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, aisle: "Vegetales", buyName: "Pepinos", buyUnit: "unidad", price: 20, gramsPerBuyUnit: 300 },
  { id: "vainitas", name: "Vainitas", kcal: 31, protein: 1.8, carbs: 7, fat: 0.2, aisle: "Vegetales", buyName: "Vainitas", buyUnit: "lb", price: 70, gramsPerBuyUnit: 454 },
  { id: "brocoli", name: "Brócoli", kcal: 34, protein: 2.8, carbs: 6.6, fat: 0.4, aisle: "Vegetales", buyName: "Brócoli", buyUnit: "lb", price: 110, gramsPerBuyUnit: 454 },
  { id: "ajo", name: "Ajo", kcal: 149, protein: 6.4, carbs: 33, fat: 0.5, aisle: "Vegetales", buyName: "Ajo (cabeza)", buyUnit: "unidad", price: 15, gramsPerBuyUnit: 40, seasoning: true },
  { id: "cilantro", name: "Cilantro / verdura", kcal: 23, protein: 2.1, carbs: 3.7, fat: 0.5, aisle: "Vegetales", buyName: "Cilantro y verdurita", buyUnit: "paquete", price: 20, gramsPerBuyUnit: 60, seasoning: true },

  // Frutas
  { id: "guineo", name: "Guineo maduro", kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, aisle: "Frutas", buyName: "Guineos maduros", buyUnit: "unidad", price: 10, gramsPerBuyUnit: 120, unitLabel: { grams: 120, singular: "guineo", plural: "guineos" } },
  { id: "aguacate", name: "Aguacate", kcal: 160, protein: 2, carbs: 8.5, fat: 14.7, aisle: "Frutas", buyName: "Aguacate", buyUnit: "unidad", price: 50, gramsPerBuyUnit: 250 },
  { id: "limon", name: "Limón", kcal: 29, protein: 1.1, carbs: 9.3, fat: 0.3, aisle: "Frutas", buyName: "Limones", buyUnit: "unidad", price: 8, gramsPerBuyUnit: 40, seasoning: true },

  // Lácteos
  { id: "leche", name: "Leche descremada", kcal: 35, protein: 3.4, carbs: 5, fat: 0.1, aisle: "Lácteos", buyName: "Leche descremada", buyUnit: "litro", price: 95, gramsPerBuyUnit: 1000 },
  { id: "queso_blanco", name: "Queso blanco de freír", kcal: 320, protein: 20, carbs: 3, fat: 25, aisle: "Lácteos", buyName: "Queso de freír", buyUnit: "lb", price: 220, gramsPerBuyUnit: 454 },

  // Enlatados
  { id: "atun", name: "Atún en agua (escurrido)", kcal: 116, protein: 25.5, carbs: 0, fat: 0.8, aisle: "Enlatados", buyName: "Atún en agua (lata)", buyUnit: "lata", price: 80, gramsPerBuyUnit: 120 },
  { id: "guandules", name: "Guandules (cocidos)", kcal: 121, protein: 6.8, carbs: 23.6, fat: 0.4, aisle: "Enlatados", buyName: "Guandules (lata)", buyUnit: "lata", price: 60, gramsPerBuyUnit: 260 },
  { id: "pasta_tomate", name: "Pasta de tomate", kcal: 82, protein: 4.3, carbs: 18.9, fat: 0.5, aisle: "Enlatados", buyName: "Pasta de tomate (sobre)", buyUnit: "unidad", price: 25, gramsPerBuyUnit: 70 },
  { id: "salmon", name: "Salmón", kcal: 208, protein: 20, carbs: 0, fat: 13.4, aisle: "Carnes y huevos", buyName: "Salmón (filete)", buyUnit: "lb", price: 480, gramsPerBuyUnit: 454 },

  // Despensa
  { id: "aceite", name: "Aceite", kcal: 884, protein: 0, carbs: 0, fat: 100, aisle: "Despensa", buyName: "Aceite", buyUnit: "litro", price: 250, gramsPerBuyUnit: 920, pantryDefault: true, seasoning: true },
  { id: "sazon", name: "Sazón, sal y orégano", kcal: 0, protein: 0, carbs: 0, fat: 0, aisle: "Despensa", buyName: "Sazón / sal / orégano", buyUnit: "unidad", price: 60, gramsPerBuyUnit: 200, pantryDefault: true, seasoning: true },
  { id: "mani", name: "Mantequilla de maní", kcal: 588, protein: 25, carbs: 20, fat: 50, aisle: "Despensa", buyName: "Mantequilla de maní", buyUnit: "frasco", price: 220, gramsPerBuyUnit: 340 },
  { id: "canela", name: "Canela y vainilla", kcal: 0, protein: 0, carbs: 0, fat: 0, aisle: "Despensa", buyName: "Canela / vainilla", buyUnit: "unidad", price: 40, gramsPerBuyUnit: 100, seasoning: true },
];

export const FOOD: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

// Grupos que el usuario puede excluir en las preguntas iniciales
export const EXCLUDABLE: { id: string; label: string; matches: string[] }[] = [
  { id: "pescado", label: "Pescado (excepto salmón y atún)", matches: [] },
  { id: "berenjena", label: "Berenjena", matches: [] },
  { id: "salmon", label: "Salmón", matches: ["salmon"] },
  { id: "atun", label: "Atún", matches: ["atun"] },
  { id: "res", label: "Carne de res", matches: ["carne_molida"] },
  { id: "lacteos", label: "Lácteos", matches: ["leche", "queso_blanco"] },
  { id: "huevo", label: "Huevo", matches: ["huevo"] },
  { id: "mani", label: "Maní", matches: ["mani"] },
  { id: "aguacate", label: "Aguacate", matches: ["aguacate"] },
  { id: "brocoli", label: "Brócoli", matches: ["brocoli"] },
];

export const PANTRY_CHOICES = FOODS.filter(
  (f) => f.aisle === "Despensa" || f.aisle === "Granos y cereales" || f.id === "huevo" || f.id === "ajo",
).map((f) => ({ id: f.id, label: f.buyName }));

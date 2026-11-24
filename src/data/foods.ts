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
  // ── Ingredientes internacionales (valores USDA aproximados) ──
  { id: "pavo_molido", name: "Pavo molido (93% magro)", kcal: 150, protein: 19.7, carbs: 0, fat: 8, aisle: "Carnes y huevos", buyName: "Pavo molido", buyUnit: "lb", price: 260, gramsPerBuyUnit: 454 },
  { id: "cerdo", name: "Lomo de cerdo", kcal: 143, protein: 21, carbs: 0, fat: 6, aisle: "Carnes y huevos", buyName: "Lomo de cerdo", buyUnit: "lb", price: 180, gramsPerBuyUnit: 454 },
  { id: "res_magra", name: "Res magra (bistec/filete)", kcal: 158, protein: 22, carbs: 0, fat: 7, aisle: "Carnes y huevos", buyName: "Bistec de res magro", buyUnit: "lb", price: 260, gramsPerBuyUnit: 454 },
  { id: "tilapia", name: "Tilapia / pescado blanco", kcal: 96, protein: 20, carbs: 0, fat: 1.7, aisle: "Carnes y huevos", buyName: "Filete de tilapia", buyUnit: "lb", price: 220, gramsPerBuyUnit: 454 },
  { id: "camarones", name: "Camarones", kcal: 99, protein: 24, carbs: 0.2, fat: 0.3, aisle: "Carnes y huevos", buyName: "Camarones limpios", buyUnit: "lb", price: 420, gramsPerBuyUnit: 454 },
  { id: "sardinas", name: "Sardinas en agua/tomate", kcal: 185, protein: 24, carbs: 0.5, fat: 10, aisle: "Enlatados", buyName: "Sardinas (lata)", buyUnit: "lata", price: 70, gramsPerBuyUnit: 120 },
  { id: "claras", name: "Claras de huevo", kcal: 52, protein: 10.9, carbs: 0.7, fat: 0.2, aisle: "Carnes y huevos", buyName: "Claras de huevo (cartón)", buyUnit: "litro", price: 260, gramsPerBuyUnit: 1000 },
  { id: "tofu", name: "Tofu firme", kcal: 144, protein: 17.3, carbs: 2.8, fat: 8.7, aisle: "Lácteos", buyName: "Tofu firme", buyUnit: "paquete", price: 180, gramsPerBuyUnit: 400 },
  { id: "garbanzos", name: "Garbanzos (cocidos)", kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6, aisle: "Enlatados", buyName: "Garbanzos (lata)", buyUnit: "lata", price: 65, gramsPerBuyUnit: 260 },
  { id: "habichuelas_negras", name: "Habichuelas negras (cocidas)", kcal: 132, protein: 8.9, carbs: 23.7, fat: 0.5, aisle: "Granos y cereales", buyName: "Habichuelas negras secas", buyUnit: "lb", price: 85, gramsPerBuyUnit: 454, rawPerCooked: 0.4 },
  { id: "yogur_griego", name: "Yogur griego natural 0%", kcal: 59, protein: 10.3, carbs: 3.6, fat: 0.4, aisle: "Lácteos", buyName: "Yogur griego natural", buyUnit: "frasco", price: 230, gramsPerBuyUnit: 900 },
  { id: "cottage", name: "Queso cottage bajo en grasa", kcal: 84, protein: 11, carbs: 4.3, fat: 2.3, aisle: "Lácteos", buyName: "Queso cottage", buyUnit: "frasco", price: 210, gramsPerBuyUnit: 450 },
  { id: "mozzarella", name: "Mozzarella light", kcal: 254, protein: 24, carbs: 2.8, fat: 16, aisle: "Lácteos", buyName: "Mozzarella light", buyUnit: "paquete", price: 190, gramsPerBuyUnit: 227 },
  { id: "parmesano", name: "Queso parmesano", kcal: 431, protein: 38, carbs: 4, fat: 29, aisle: "Lácteos", buyName: "Parmesano rallado", buyUnit: "frasco", price: 260, gramsPerBuyUnit: 170, seasoning: true },
  { id: "whey", name: "Proteína en polvo (whey)", kcal: 400, protein: 80, carbs: 8, fat: 6, aisle: "Despensa", buyName: "Proteína whey", buyUnit: "frasco", price: 3200, gramsPerBuyUnit: 907, unitLabel: { grams: 30, singular: "scoop", plural: "scoops" } },
  { id: "arroz_integral", name: "Arroz integral (cocido)", kcal: 123, protein: 2.7, carbs: 25.6, fat: 1, aisle: "Granos y cereales", buyName: "Arroz integral", buyUnit: "lb", price: 70, gramsPerBuyUnit: 454, rawPerCooked: 0.38 },
  { id: "quinoa", name: "Quinoa (cocida)", kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9, aisle: "Granos y cereales", buyName: "Quinoa", buyUnit: "paquete", price: 260, gramsPerBuyUnit: 454, rawPerCooked: 0.35 },
  { id: "pasta_integral", name: "Pasta integral (cocida)", kcal: 149, protein: 6, carbs: 30, fat: 1.7, aisle: "Granos y cereales", buyName: "Pasta integral", buyUnit: "paquete", price: 95, gramsPerBuyUnit: 454, rawPerCooked: 0.42 },
  { id: "tortilla_maiz", name: "Tortilla de maíz", kcal: 218, protein: 5.7, carbs: 44.6, fat: 2.9, aisle: "Granos y cereales", buyName: "Tortillas de maíz", buyUnit: "paquete", price: 150, gramsPerBuyUnit: 400, unitLabel: { grams: 26, singular: "tortilla", plural: "tortillas" } },
  { id: "tortilla_integral", name: "Tortilla integral de trigo", kcal: 300, protein: 9, carbs: 50, fat: 7.5, aisle: "Granos y cereales", buyName: "Tortillas integrales", buyUnit: "paquete", price: 170, gramsPerBuyUnit: 450, unitLabel: { grams: 45, singular: "tortilla", plural: "tortillas" } },
  { id: "casabe", name: "Casabe", kcal: 330, protein: 1.5, carbs: 80, fat: 0.5, aisle: "Granos y cereales", buyName: "Casabe", buyUnit: "paquete", price: 60, gramsPerBuyUnit: 200 },
  { id: "espinaca", name: "Espinaca", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, aisle: "Vegetales", buyName: "Espinaca", buyUnit: "paquete", price: 90, gramsPerBuyUnit: 300 },
  { id: "calabacin", name: "Calabacín (zucchini)", kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3, aisle: "Vegetales", buyName: "Calabacín", buyUnit: "lb", price: 70, gramsPerBuyUnit: 454 },
  { id: "champinones", name: "Champiñones", kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, aisle: "Vegetales", buyName: "Champiñones", buyUnit: "paquete", price: 120, gramsPerBuyUnit: 227 },
  { id: "maiz", name: "Maíz dulce (granos)", kcal: 96, protein: 3.4, carbs: 21, fat: 1.5, aisle: "Enlatados", buyName: "Maíz dulce (lata)", buyUnit: "lata", price: 55, gramsPerBuyUnit: 280 },
  { id: "coliflor", name: "Coliflor", kcal: 25, protein: 1.9, carbs: 5, fat: 0.3, aisle: "Vegetales", buyName: "Coliflor", buyUnit: "unidad", price: 120, gramsPerBuyUnit: 600 },
  { id: "remolacha", name: "Remolacha", kcal: 43, protein: 1.6, carbs: 9.6, fat: 0.2, aisle: "Vegetales", buyName: "Remolacha", buyUnit: "lb", price: 45, gramsPerBuyUnit: 454 },
  { id: "manzana", name: "Manzana", kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2, aisle: "Frutas", buyName: "Manzanas", buyUnit: "unidad", price: 35, gramsPerBuyUnit: 180, unitLabel: { grams: 180, singular: "manzana", plural: "manzanas" } },
  { id: "fresas", name: "Fresas / frutos rojos", kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, aisle: "Frutas", buyName: "Fresas (frescas o congeladas)", buyUnit: "paquete", price: 220, gramsPerBuyUnit: 454 },
  { id: "pina", name: "Piña", kcal: 50, protein: 0.5, carbs: 13, fat: 0.1, aisle: "Frutas", buyName: "Piña", buyUnit: "unidad", price: 80, gramsPerBuyUnit: 900 },
  { id: "mango", name: "Mango", kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, aisle: "Frutas", buyName: "Mangos", buyUnit: "unidad", price: 40, gramsPerBuyUnit: 300 },
  { id: "lechosa", name: "Lechosa", kcal: 43, protein: 0.5, carbs: 10.8, fat: 0.3, aisle: "Frutas", buyName: "Lechosa", buyUnit: "lb", price: 30, gramsPerBuyUnit: 454 },
  { id: "naranja", name: "Naranja / china", kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1, aisle: "Frutas", buyName: "Chinas", buyUnit: "unidad", price: 12, gramsPerBuyUnit: 130, unitLabel: { grams: 130, singular: "china", plural: "chinas" } },
  { id: "almendras", name: "Almendras", kcal: 579, protein: 21, carbs: 22, fat: 50, aisle: "Despensa", buyName: "Almendras", buyUnit: "paquete", price: 280, gramsPerBuyUnit: 227 },
  { id: "nueces", name: "Nueces", kcal: 654, protein: 15, carbs: 14, fat: 65, aisle: "Despensa", buyName: "Nueces", buyUnit: "paquete", price: 320, gramsPerBuyUnit: 227 },
  { id: "chia", name: "Semillas de chía", kcal: 486, protein: 17, carbs: 42, fat: 31, aisle: "Despensa", buyName: "Chía", buyUnit: "paquete", price: 180, gramsPerBuyUnit: 227 },
  { id: "cacao", name: "Cacao en polvo sin azúcar", kcal: 228, protein: 20, carbs: 58, fat: 14, aisle: "Despensa", buyName: "Cacao en polvo", buyUnit: "paquete", price: 190, gramsPerBuyUnit: 227, seasoning: true },
  { id: "miel", name: "Miel", kcal: 304, protein: 0.3, carbs: 82, fat: 0, aisle: "Despensa", buyName: "Miel", buyUnit: "frasco", price: 250, gramsPerBuyUnit: 340, seasoning: true },
  { id: "salsa_soya", name: "Salsa de soya baja en sodio", kcal: 53, protein: 8, carbs: 4.9, fat: 0.6, aisle: "Despensa", buyName: "Salsa de soya baja en sodio", buyUnit: "frasco", price: 110, gramsPerBuyUnit: 300, seasoning: true },
  { id: "canela", name: "Canela y vainilla", kcal: 0, protein: 0, carbs: 0, fat: 0, aisle: "Despensa", buyName: "Canela / vainilla", buyUnit: "unidad", price: 40, gramsPerBuyUnit: 100, seasoning: true },
];

export const FOOD: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

// Grupos que el usuario puede excluir en las preguntas iniciales
export const EXCLUDABLE: { id: string; label: string; matches: string[] }[] = [
  { id: "pescado", label: "Pescado (excepto salmón y atún)", matches: ["tilapia", "sardinas"] },
  { id: "mariscos", label: "Mariscos", matches: ["camarones"] },
  { id: "cerdo", label: "Cerdo", matches: ["cerdo"] },
  { id: "berenjena", label: "Berenjena", matches: [] },
  { id: "salmon", label: "Salmón", matches: ["salmon"] },
  { id: "atun", label: "Atún", matches: ["atun"] },
  { id: "res", label: "Carne de res", matches: ["carne_molida", "res_magra"] },
  { id: "lacteos", label: "Lácteos", matches: ["leche", "queso_blanco", "yogur_griego", "cottage", "mozzarella", "parmesano", "whey"] },
  { id: "huevo", label: "Huevo", matches: ["huevo", "claras"] },
  { id: "soya", label: "Soya / tofu", matches: ["tofu", "salsa_soya"] },
  { id: "frutos_secos", label: "Almendras y nueces", matches: ["almendras", "nueces"] },
  { id: "gluten", label: "Gluten (trigo)", matches: ["pan_integral", "espaguetis", "pasta_integral", "tortilla_integral"] },
  { id: "mani", label: "Maní", matches: ["mani"] },
  { id: "aguacate", label: "Aguacate", matches: ["aguacate"] },
  { id: "brocoli", label: "Brócoli", matches: ["brocoli"] },
];

export const PANTRY_CHOICES = FOODS.filter(
  (f) => f.aisle === "Despensa" || f.aisle === "Granos y cereales" || f.id === "huevo" || f.id === "ajo",
).map((f) => ({ id: f.id, label: f.buyName }));

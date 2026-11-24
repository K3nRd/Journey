// Estimaciones para registrar rápido cuando comes fuera (porción típica en RD).
export interface QuickFood {
  id: string;
  name: string;
  portion: string;
  kcal: number;
  protein: number;
  emoji: string;
  tip?: string;
}

export const EAT_OUT: QuickFood[] = [
  { id: "pica-pollo", name: "Pica pollo con tostones", portion: "2 piezas + 6 tostones", kcal: 1100, protein: 55, emoji: "🍗", tip: "Pide pechuga, quítale la piel y comparte los tostones." },
  { id: "pica-pollo-1", name: "Pica pollo (1 pieza sola)", portion: "1 pieza", kcal: 380, protein: 28, emoji: "🍗" },
  { id: "chimi", name: "Chimi", portion: "1 chimi completo", kcal: 750, protein: 32, emoji: "🍔", tip: "Sin salsa extra y sin refresco: ahorras ~300 kcal." },
  { id: "yaroa", name: "Yaroa de pollo", portion: "1 bandeja", kcal: 1200, protein: 45, emoji: "🍟", tip: "Mejor compártela o pide la pequeña." },
  { id: "bandera", name: "La bandera (plato del día)", portion: "Arroz, habichuelas, carne y ensalada", kcal: 900, protein: 40, emoji: "🇩🇴", tip: "Pide media porción de arroz y doble ensalada." },
  { id: "locrio", name: "Locrio de pollo", portion: "1 plato", kcal: 700, protein: 30, emoji: "🥘" },
  { id: "sancocho", name: "Sancocho", portion: "1 plato con arroz", kcal: 750, protein: 35, emoji: "🍜", tip: "Sin el arroz baja a ~500 kcal." },
  { id: "mangu-3-golpes", name: "Mangú con los tres golpes", portion: "1 plato", kcal: 1100, protein: 38, emoji: "🍳", tip: "Pide huevo y queso, sin salami frito." },
  { id: "pollo-carbon", name: "Pollo al carbón (¼) con ensalada", portion: "¼ de pollo", kcal: 520, protein: 45, emoji: "🔥", tip: "Una de las mejores opciones fuera de casa." },
  { id: "empanada", name: "Empanada / pastelito frito", portion: "1 unidad", kcal: 300, protein: 9, emoji: "🥟" },
  { id: "quipe", name: "Quipe", portion: "1 unidad", kcal: 220, protein: 10, emoji: "🥙" },
  { id: "tostones", name: "Tostones", portion: "6 unidades", kcal: 350, protein: 2, emoji: "🍌" },
  { id: "arroz-pollo", name: "Arroz con pollo", portion: "1 plato", kcal: 700, protein: 32, emoji: "🍚" },
  { id: "pizza", name: "Pizza", portion: "1 porción", kcal: 300, protein: 12, emoji: "🍕" },
  { id: "hamburguesa", name: "Hamburguesa de cadena", portion: "1 unidad", kcal: 550, protein: 28, emoji: "🍔" },
  { id: "papas-fritas", name: "Papas fritas", portion: "Mediana", kcal: 350, protein: 4, emoji: "🍟" },
  { id: "refresco", name: "Refresco", portion: "20 oz", kcal: 240, protein: 0, emoji: "🥤", tip: "Cámbialo por agua o refresco sin azúcar." },
  { id: "cerveza", name: "Cerveza", portion: "1 pequeña (12 oz)", kcal: 150, protein: 1, emoji: "🍺" },
  { id: "cerveza-grande", name: "Cerveza grande", portion: "1 grande (650 ml)", kcal: 280, protein: 2, emoji: "🍺" },
  { id: "morir-sonando", name: "Morir soñando", portion: "1 vaso", kcal: 300, protein: 8, emoji: "🍊" },
  { id: "batida", name: "Batida de frutas con leche", portion: "1 vaso", kcal: 320, protein: 8, emoji: "🥤" },
  { id: "habichuela-dulce", name: "Habichuelas con dulce", portion: "1 taza", kcal: 400, protein: 10, emoji: "🍮" },
  { id: "cafe-azucar", name: "Café con azúcar", portion: "1 taza", kcal: 50, protein: 0, emoji: "☕" },
  { id: "helado", name: "Helado", portion: "2 bolas", kcal: 280, protein: 5, emoji: "🍦" },
];

// Registro rápido por porciones con la mano
export const PORTIONS: QuickFood[] = [
  { id: "p-proteina", name: "Proteína", portion: "1 palma (pollo, carne, atún)", kcal: 160, protein: 28, emoji: "✋" },
  { id: "p-carbo", name: "Carbohidrato", portion: "1 puño (arroz, víveres, pasta)", kcal: 170, protein: 4, emoji: "✊" },
  { id: "p-grasa", name: "Grasa", portion: "1 pulgar (aceite, aguacate, maní)", kcal: 90, protein: 1, emoji: "👍" },
  { id: "p-veg", name: "Vegetales", portion: "1 puño", kcal: 25, protein: 1, emoji: "🥬" },
  { id: "p-huevo", name: "Huevo", portion: "1 unidad", kcal: 72, protein: 6, emoji: "🥚" },
  { id: "p-guineo", name: "Guineo", portion: "1 unidad", kcal: 105, protein: 1, emoji: "🍌" },
  { id: "p-leche", name: "Leche descremada", portion: "1 vaso (250 ml)", kcal: 88, protein: 9, emoji: "🥛" },
  { id: "p-habichuelas", name: "Habichuelas", portion: "½ taza", kcal: 115, protein: 8, emoji: "🫘" },
];

export const DISCONNECT_IDEAS: { emoji: string; title: string; desc: string }[] = [
  { emoji: "🚶", title: "Caminata sin teléfono", desc: "20 minutos por el barrio, el malecón o un parque, dejando el celular en casa o en modo avión." },
  { emoji: "📚", title: "Leer 15 páginas", desc: "Un libro físico antes de dormir en lugar de redes sociales." },
  { emoji: "🎸", title: "Aprender algo con las manos", desc: "Un instrumento, dibujar, cocinar una receta nueva o arreglar algo en casa." },
  { emoji: "👨‍👩‍👦", title: "Tiempo con familia o amigos", desc: "Una llamada o visita sin pantallas de por medio." },
  { emoji: "🏖️", title: "Plan de fin de semana al aire libre", desc: "Playa, río, montaña o un parque. El sol y el movimiento recargan." },
  { emoji: "🧘", title: "5 minutos de respiración", desc: "Inhala 4 s, mantén 4 s, exhala 6 s. Ideal al terminar el trabajo." },
  { emoji: "🏀", title: "Deporte recreativo", desc: "Baloncesto, softbol o fútbol con amigos: cardio sin sentirlo." },
  { emoji: "🍳", title: "Cocinar sin prisa", desc: "Preparar las comidas del domingo con música puede ser terapéutico." },
  { emoji: "📝", title: "Escribir 3 cosas buenas del día", desc: "Ayuda a cerrar el día y a dormir con la mente tranquila." },
  { emoji: "🔌", title: "Hora sin pantallas", desc: "Una hora antes de dormir: nada de teléfono, TV ni computadora." },
  { emoji: "🧹", title: "Ordenar un espacio", desc: "10 minutos ordenando tu cuarto o escritorio despeja la cabeza." },
  { emoji: "🎧", title: "Podcast o música caminando", desc: "Combina tu caminata diaria con algo que disfrutes." },
];

export const WARNING_SIGNS = [
  "Dolor agudo o punzante en una articulación durante un ejercicio (no es lo mismo que el ardor muscular).",
  "Mareo, dolor en el pecho o falta de aire desproporcionada.",
  "Cansancio extremo durante más de una semana, mal sueño o pérdida de fuerza constante.",
];

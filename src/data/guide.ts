// Guía de salud basada en evidencia (revisada en noviembre de 2026).
// Cada punto incluye la recomendación, cómo la aplica Journey y su fuente.

export interface GuideItem {
  id: string;
  emoji: string;
  title: string;
  number: string; // la cifra clave
  what: string; // qué dice la evidencia
  how: string; // qué hacer en la práctica
  journey: string; // cómo lo aplica la app
  source: { label: string; url: string };
  strength: "fuerte" | "moderada" | "orientativa";
}

export interface GuideSection {
  id: string;
  title: string;
  tone: "food" | "accent" | "violet" | "info";
  items: GuideItem[];
}

export const GUIDE: GuideSection[] = [
  {
    id: "comida",
    title: "Alimentación",
    tone: "food",
    items: [
      {
        id: "proteina",
        emoji: "🍗",
        title: "Proteína suficiente",
        number: "1.4–2.0 g por kg al día",
        what: "Con ejercicio, la Sociedad Internacional de Nutrición Deportiva recomienda 1.4–2.0 g/kg al día para mantener y ganar músculo. En déficit de calorías y entrenando fuerza, comer más proteína ayuda a no perder músculo.",
        how: "Incluye una fuente de proteína en cada comida: pollo, huevos, habichuelas, lentejas, atún o leche.",
        journey: "Tu meta se calcula a 1.6 g por kg de tu peso meta y cada receta muestra sus gramos de proteína.",
        source: { label: "ISSN · Proteína y ejercicio (2017)", url: "https://pubmed.ncbi.nlm.nih.gov/28642676/" },
        strength: "fuerte",
      },
      {
        id: "horario-comidas",
        emoji: "⏰",
        title: "Horario de comidas",
        number: "Desayuno ≤1 h tras despertar · cena 2–3 h antes de dormir",
        what: "Desayunar temprano y concentrar más calorías en la primera mitad del día se asocia con mejor control del azúcar y del peso; cenar tarde (1 h antes de dormir) sube la glucosa nocturna. Para el músculo, conviene repartir 20–40 g de proteína cada 3–4 h. La evidencia es en parte observacional: lo que más cuenta sigue siendo el total del día y la constancia.",
        how: "Desayuna dentro de la primera hora, almuerza cerca del mediodía, haz la comida más grande antes de la tarde y termina de cenar 2–3 h antes de acostarte. Come a horas parecidas cada día.",
        journey: "Tu rutina coloca el desayuno al despertar, el almuerzo entre 12:00 y 13:30, la merienda 1 h antes del gym y la cena al menos 2 h antes de dormir, con más calorías en desayuno y almuerzo.",
        source: { label: "Crononutrición y salud cardiometabólica (revisión 2023)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10471112/" },
        strength: "moderada",
      },
      {
        id: "fruta-verdura",
        emoji: "🥗",
        title: "Frutas y vegetales",
        number: "400 g o más al día",
        what: "La OMS recomienda al menos 400 g diarios de frutas y vegetales (unas 5 porciones). Los víveres como yuca, papa o batata no cuentan para esta meta. Congelados y enlatados sin azúcar ni sal añadida también valen.",
        how: "Media plancha de vegetales en almuerzo y cena, y una fruta en la merienda.",
        journey: "Las comidas del plan incluyen ensalada o vegetales, y las meriendas, guineo.",
        source: { label: "OMS · Alimentación sana (2026)", url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" },
        strength: "fuerte",
      },
      {
        id: "fibra",
        emoji: "🫘",
        title: "Fibra",
        number: "25–29 g o más al día",
        what: "Una revisión de 185 estudios y 58 ensayos en The Lancet encontró el mayor beneficio con 25–29 g de fibra al día: 15–30 % menos mortalidad y menos enfermedad cardíaca, diabetes tipo 2 y cáncer colorrectal.",
        how: "Habichuelas, lentejas, avena, víveres con fibra, frutas y vegetales. La mayoría de la gente come menos de 20 g.",
        journey: "El menú usa habichuelas, lentejas y avena varias veces por semana.",
        source: { label: "Reynolds et al. · The Lancet (2019)", url: "https://pubmed.ncbi.nlm.nih.gov/30638909/" },
        strength: "fuerte",
      },
      {
        id: "azucar-sal",
        emoji: "🧂",
        title: "Azúcar y sal",
        number: "Azúcar < 50 g · Sal < 5 g al día",
        what: "La OMS recomienda que los azúcares libres sean menos del 10 % de las calorías (unos 50 g en una dieta de 2,000), mejor aún menos del 5 %. Los jugos, aunque sean naturales, cuentan como azúcar libre. La sal, menos de 5 g al día (una cucharadita).",
        how: "Agua en vez de refresco o jugo. Ojo con el sazón en cubitos y los embutidos: tienen mucha sal.",
        journey: "Las recetas no llevan azúcar añadida y usan poco aceite y sazón.",
        source: { label: "OMS · Alimentación sana (2026)", url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" },
        strength: "fuerte",
      },
      {
        id: "ultraprocesados",
        emoji: "🍟",
        title: "Menos ultraprocesados",
        number: "Cuanto menos, mejor",
        what: "Una revisión en el BMJ (2024) asoció comer más ultraprocesados con 32 problemas de salud, entre ellos un 50 % más de riesgo de muerte cardiovascular. Son estudios observacionales: muestran asociación, no prueban causa.",
        how: "Prioriza comida hecha en casa. Limita salami, salchichas, galletas, snacks, refrescos y comida rápida.",
        journey: "Todo el recetario es comida casera; «Comí fuera» te sugiere la mejor opción cuando comes en la calle.",
        source: { label: "Lane et al. · BMJ (2024)", url: "https://bmjgroup.com/consistent-evidence-links-ultra-processed-food-to-over-30-damaging-health-outcomes/" },
        strength: "moderada",
      },
      {
        id: "agua",
        emoji: "💧",
        title: "Agua",
        number: "≈ 2.5 L hombres · 2 L mujeres",
        what: "La Autoridad Europea de Seguridad Alimentaria fija 2.5 L de agua total al día para hombres y 2 L para mujeres, contando la que viene de la comida (≈ 20 %). Con calor y ejercicio se necesita más.",
        how: "Unos 8–10 vasos de líquidos al día, más si sudas mucho. Un buen indicador: orina de color claro.",
        journey: "El contador de agua del inicio y el vaso al despertar.",
        source: { label: "EFSA vía EUFIC", url: "https://www.eufic.org/en/healthy-living/article/how-much-water-should-you-drink-per-day" },
        strength: "orientativa",
      },
      {
        id: "alcohol",
        emoji: "🍺",
        title: "Alcohol",
        number: "Ninguna cantidad es segura",
        what: "La OMS declaró en 2023 que no existe un nivel de consumo de alcohol seguro para la salud: el riesgo de cáncer empieza desde la primera bebida. Además aporta calorías vacías y empeora el sueño.",
        how: "Si bebes, que sea poco y no frecuente. Cada cerveza grande son unas 280 kcal.",
        journey: "«Comí fuera» incluye las cervezas para que veas su peso en tu día.",
        source: { label: "OMS · Lancet Public Health (2023)", url: "https://www.who.int/azerbaijan/news/item/04-01-2023-no-level-of-alcohol-consumption-is-safe-for-our-health" },
        strength: "fuerte",
      },
    ],
  },
  {
    id: "movimiento",
    title: "Movimiento",
    tone: "accent",
    items: [
      {
        id: "pasos",
        emoji: "👣",
        title: "Pasos diarios",
        number: "7,000 o más al día",
        what: "Un metaanálisis en The Lancet Public Health (2025, 57 estudios) encontró que 7,000 pasos al día se asocian con un 47 % menos de mortalidad frente a 2,000. El mayor beneficio llega entre 5,000 y 7,000; llegar a 10,000 añade algo más.",
        how: "Camina después de comer, usa escaleras, haz llamadas caminando.",
        journey: "Tu meta de pasos (8,000 por defecto) y la caminata diaria en tu rutina.",
        source: { label: "Ding et al. · Lancet Public Health (2025)", url: "https://pubmed.ncbi.nlm.nih.gov/40713949/" },
        strength: "moderada",
      },
      {
        id: "ejercicio",
        emoji: "🏋️",
        title: "Ejercicio semanal",
        number: "150–300 min + fuerza 2 días",
        what: "La OMS recomienda a los adultos 150–300 minutos semanales de actividad aeróbica moderada (o 75–150 intensa), más ejercicios de fuerza para todos los grupos musculares 2 o más días por semana.",
        how: "Combina pesas con cardio moderado (caminata inclinada, bici, elíptica).",
        journey: "5 días de fuerza con cardio opcional al final, y sábado de cardio y movilidad.",
        source: { label: "OMS · Actividad física (2020)", url: "https://www.ncbi.nlm.nih.gov/books/NBK566048/" },
        strength: "fuerte",
      },
      {
        id: "volumen",
        emoji: "📈",
        title: "Series por músculo",
        number: "10–20 series por semana",
        what: "Los metaanálisis muestran que más series semanales por músculo producen más crecimiento, con un punto óptimo para la mayoría entre 10 y 20 series, y menos ganancia extra por encima de eso.",
        how: "Progresa poco a poco: primero técnica, luego peso, luego series.",
        journey: "El plan da unas 10–16 series semanales por grupo grande, con adaptación al inicio y descarga cada 7 semanas.",
        source: { label: "Schoenfeld et al. · J Sports Sci (2017)", url: "https://researchgate.net/profile/Brad-Schoenfeld/publication/305455324_Dose-response_relationship_between_weekly_resistance_training_volume_and_increases_in_muscle_mass_A_systematic_review_and_meta-analysis/links/59dc0269458515e9ab4527d6/Dose-response-relationship-between-weekly-resistance-training-volume-and-increases-in-muscle-mass-A-systematic-review-and-meta-analysis.pdf" },
        strength: "moderada",
      },
      {
        id: "sentado",
        emoji: "🪑",
        title: "Romper el tiempo sentado",
        number: "2–5 min cada 30–60 min",
        what: "Estudios controlados muestran que interrumpir el tiempo sentado cada 30 minutos con 2–5 minutos de caminata ligera baja el azúcar en sangre después de comer. La OMS indica que cualquier movimiento, incluso ligero, reemplazando tiempo sentado, aporta beneficios.",
        how: "Levántate a tomar agua, camina en llamadas, usa un temporizador.",
        journey: "Las pausas activas de tu horario de trabajo.",
        source: { label: "Dunstan et al. · Diabetes Care (2012)", url: "https://pubmed.ncbi.nlm.nih.gov/22374636/" },
        strength: "moderada",
      },
      {
        id: "ritmo",
        emoji: "🐢",
        title: "Bajar a buen ritmo",
        number: "0.5–1 % de tu peso por semana",
        what: "Bajar de peso despacio, junto con entrenamiento de fuerza y proteína alta, conserva más músculo. Perder más de 1 kg por semana se asocia con mayor pérdida muscular.",
        how: "Para 210 lb, entre 1 y 2 lb por semana es razonable al principio; después, el ritmo baja.",
        journey: "La tendencia de peso y el ajuste de calorías cada 2 semanas te mantienen en ese rango.",
        source: { label: "Harvard Health", url: "https://www.health.harvard.edu/staying-healthy/trying-to-lose-weight-be-careful-not-to-lose-muscle" },
        strength: "orientativa",
      },
    ],
  },
  {
    id: "descanso",
    title: "Descanso",
    tone: "violet",
    items: [
      {
        id: "sueno",
        emoji: "😴",
        title: "Dormir suficiente",
        number: "7 horas o más",
        what: "La Academia Americana de Medicina del Sueño recomienda que los adultos duerman 7 horas o más con regularidad. Dormir menos de 7 se asocia con aumento de peso, diabetes, hipertensión, depresión y peor rendimiento. La regularidad del horario también forma parte del sueño sano.",
        how: "Misma hora de acostarte y levantarte, también el fin de semana. Cuarto oscuro y fresco.",
        journey: "Tu hora de dormir, el aviso de soltar el teléfono y el registro de sueño.",
        source: { label: "AASM y SRS · Consenso (2015)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/" },
        strength: "fuerte",
      },
      {
        id: "cafeina",
        emoji: "☕",
        title: "Último café",
        number: "6 h o más antes de dormir",
        what: "Un ensayo controlado encontró que una dosis moderada de cafeína tomada incluso 6 horas antes de acostarse redujo el sueño en más de 1 hora, sin que las personas lo notaran.",
        how: "Toma el café por la mañana o a mediodía. Ojo con refrescos de cola, té y energizantes.",
        journey: "Un aviso de «último café del día» 8 horas antes de tu hora de dormir.",
        source: { label: "Drake et al. · J Clin Sleep Med (2013)", url: "https://aasm.org/late-afternoon-and-early-evening-caffeine-can-disrupt-sleep-at-night/" },
        strength: "moderada",
      },
    ],
  },
];

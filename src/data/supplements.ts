// Suplementos según la evidencia (ISSN, Comité Olímpico Internacional, FDA).
// Solo recomendamos lo que tiene respaldo; el resto lo marcamos como "no hace falta".

import type { Profile } from "@/lib/types";

export type SupplementId = "creatina" | "proteina" | "cafeina" | "vitamina-d" | "omega-3" | "electrolitos";

export interface Supplement {
  id: SupplementId;
  emoji: string;
  name: string;
  verdict: "recomendado" | "util" | "segun-caso";
  what: string;
  dose: (p: Profile, weightKg: number) => string;
  when: string;
  tips: string[];
  caution: string;
  /** Ids del cuestionario de salud que obligan a consultar antes. */
  askDoctorIf: string[];
  source: { label: string; url: string };
}

const round = (n: number, step: number) => Math.round(n / step) * step;

export const SUPPLEMENTS: Supplement[] = [
  {
    id: "creatina",
    emoji: "⚡",
    name: "Creatina monohidrato",
    verdict: "recomendado",
    what: "El suplemento con más estudios del mundo. Aumenta la fuerza y la masa muscular cuando entrenas con pesas, y es segura en personas sanas a largo plazo.",
    dose: () => "3–5 g al día, todos los días (también los de descanso)",
    when: "A cualquier hora; lo más fácil es con el desayuno. Lo importante es no saltarla: tarda 3–4 semanas en llenar el músculo.",
    tips: [
      "Compra «creatina monohidrato» sola, sin mezclas. Las versiones «HCl» o «kre-alkalyn» cuestan más y no funcionan mejor.",
      "No hace falta la fase de carga (20 g al día). Si quieres el efecto en 1 semana, puedes hacer 5 días de 4 × 5 g.",
      "Es normal subir 1–2 lb en las primeras semanas: es agua dentro del músculo, no grasa.",
      "Toma tu agua de siempre; no hace falta más.",
    ],
    caution: "Si tienes enfermedad de los riñones, consulta a tu médico antes. Avísale que la tomas si te hacen análisis: puede subir un poco la creatinina sin que haya daño.",
    askDoctorIf: ["cronica", "medicamentos", "embarazo"],
    source: { label: "ISSN · Posición sobre la creatina (2017)", url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z" },
  },
  {
    id: "proteina",
    emoji: "🥤",
    name: "Proteína en polvo (whey)",
    verdict: "util",
    what: "No es mágica: es comida en polvo. Sirve si con tus comidas no llegas a tu meta de proteína, porque es barata por gramo y práctica.",
    dose: () => "1 scoop (≈25 g de proteína) cuando te falte proteína en el día",
    when: "Lo que importa es el total del día. Es cómoda después de entrenar o como merienda.",
    tips: [
      "Cuenta sus calorías (≈120 por scoop): úsala para reemplazar una merienda, no para sumar.",
      "Whey «isolate» si la leche te cae pesada. Si eres vegetariano, de guisante o soya.",
      "Busca un sello de calidad: NSF Certified for Sport o Informed Choice.",
    ],
    caution: "Si tienes enfermedad renal, tu médico debe indicar cuánta proteína puedes comer.",
    askDoctorIf: ["cronica"],
    source: { label: "ISSN · Proteína y ejercicio (2017)", url: "https://pubmed.ncbi.nlm.nih.gov/28642676/" },
  },
  {
    id: "cafeina",
    emoji: "☕",
    name: "Cafeína (pre-entreno)",
    verdict: "util",
    what: "Mejora el rendimiento y hace que el entrenamiento se sienta más fácil. Un café fuerte funciona igual que un pre-entreno caro.",
    dose: (_p, kg) =>
      `${Math.min(300, round(kg * 3, 25))}–${Math.min(400, round(kg * 6, 25))} mg, 30–60 min antes (una taza de café colado tiene ≈ 95 mg)`,
    when: "30–60 min antes de entrenar, y nunca en las 8 h antes de dormir: si entrenas de noche, mejor sin cafeína.",
    tips: [
      "Empieza con poco (100 mg) para ver cómo te cae.",
      "Máximo 400 mg al día sumando café, refrescos y bebidas energéticas.",
      "Muchos pre-entrenos traen 300 mg o más por porción: lee la etiqueta.",
    ],
    caution: "Evítala si tienes presión alta no controlada, arritmias, ansiedad, estás embarazada o te quita el sueño.",
    askDoctorIf: ["corazon", "pecho", "mareo", "medicamentos", "embarazo"],
    source: { label: "ISSN · Posición sobre la cafeína (2021)", url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-020-00383-4" },
  },
  {
    id: "vitamina-d",
    emoji: "☀️",
    name: "Vitamina D",
    verdict: "segun-caso",
    what: "Solo ayuda si tienes la vitamina D baja. En el Caribe es menos común, pero pasa si trabajas todo el día bajo techo.",
    dose: () => "1,000–2,000 UI al día si un análisis sale bajo (o según tu médico)",
    when: "Con una comida que tenga algo de grasa (el desayuno o el almuerzo).",
    tips: ["Lo ideal es medirla primero (análisis «25-OH vitamina D»).", "15–20 min de sol en brazos y piernas varios días a la semana también ayudan."],
    caution: "No tomes dosis altas sin indicación médica.",
    askDoctorIf: ["cronica", "medicamentos"],
    source: { label: "Comité Olímpico Internacional · Suplementos (2018)", url: "https://bjsm.bmj.com/content/52/7/439" },
  },
  {
    id: "omega-3",
    emoji: "🐟",
    name: "Omega-3",
    verdict: "segun-caso",
    what: "Útil si casi no comes pescado graso. Comer salmón o sardinas 2 veces por semana cubre lo mismo.",
    dose: () => "≈1 g de EPA + DHA al día",
    when: "Con una comida.",
    tips: ["Mira la etiqueta: cuenta el EPA + DHA, no el «aceite de pescado» total."],
    caution: "Si tomas anticoagulantes, consulta a tu médico.",
    askDoctorIf: ["medicamentos"],
    source: { label: "Comité Olímpico Internacional · Suplementos (2018)", url: "https://bjsm.bmj.com/content/52/7/439" },
  },
  {
    id: "electrolitos",
    emoji: "💧",
    name: "Electrolitos",
    verdict: "segun-caso",
    what: "Solo hacen falta si sudas mucho por más de 60–90 min (calor, cardio largo). Para una sesión normal de pesas basta con agua.",
    dose: () => "Según la etiqueta, en sesiones largas o con mucho calor",
    when: "Durante o después del ejercicio.",
    tips: ["Un poco de sal en las comidas y una fruta suelen bastar."],
    caution: "Si tienes presión alta o enfermedad renal, cuidado con el sodio y el potasio extra.",
    askDoctorIf: ["corazon", "cronica"],
    source: { label: "Comité Olímpico Internacional · Suplementos (2018)", url: "https://bjsm.bmj.com/content/52/7/439" },
  },
];

/** Lo que NO recomendamos gastar. */
export const NOT_NEEDED: { name: string; why: string }[] = [
  { name: "BCAA / aminoácidos", why: "Si comes suficiente proteína, no añaden nada." },
  { name: "Quemadores de grasa", why: "Casi todo el efecto es cafeína cara; algunos tienen sustancias peligrosas o prohibidas." },
  { name: "«Boosters» de testosterona", why: "No suben la testosterona de forma útil en personas sanas." },
  { name: "Glutamina", why: "No mejora la fuerza ni el músculo en personas sanas." },
  { name: "Gainers caros", why: "Son proteína + azúcar. Arroz, avena, plátano y leche hacen lo mismo más barato." },
  { name: "Detox / té quemagrasa", why: "Tu hígado y tus riñones ya se encargan. Bajar de peso así es agua." },
];

export const SUPP = Object.fromEntries(SUPPLEMENTS.map((s) => [s.id, s])) as Record<SupplementId, Supplement>;

/** Respuestas del cuestionario de salud que piden consultar antes de este suplemento. */
export function doctorFlags(p: Profile, s: Supplement) {
  const a = p.health?.answers ?? {};
  return s.askDoctorIf.filter((id) => a[id]);
}

import type { Profile } from "./types";
import { toMin } from "./date";

const KG_PER_LB = 0.45359237;

/** Peso mínimo saludable (IMC 18.5) para una estatura, en libras. */
export function minHealthyWeightLb(heightCm: number) {
  const m = heightCm / 100;
  return Math.ceil((18.5 * m * m) / KG_PER_LB);
}

/** Tope razonable para una etapa de ganar músculo (IMC 27). */
export function maxGainWeightLb(heightCm: number) {
  const m = heightCm / 100;
  return Math.floor((27 * m * m) / KG_PER_LB);
}

export function bmi(weightLb: number, heightCm: number) {
  const m = heightCm / 100;
  return m > 0 ? (weightLb * KG_PER_LB) / (m * m) : 0;
}

export type Errors = Record<string, string>;

export function validateBody(p: Profile): Errors {
  const e: Errors = {};
  if (!p.age) e.age = "Escribe tu edad.";
  else if (p.age < 18) e.age = "Journey está pensada para personas de 18 años o más.";
  else if (p.age > 90) e.age = "Revisa tu edad.";

  if (!p.heightCm) e.height = "Escribe tu estatura.";
  else if (p.heightCm < 120 || p.heightCm > 230) e.height = "Revisa tu estatura (entre 4'0\" y 7'6\").";

  if (!p.startWeightLb) e.weight = "Escribe tu peso actual.";
  else if (p.startWeightLb < 80 || p.startWeightLb > 600) e.weight = "Revisa tu peso (entre 80 y 600 lb).";

  const goal = p.goal ?? "perder";
  if (goal !== "mantener") {
    if (!p.goalWeightLb) e.goal = "Escribe tu peso meta.";
    else if (!e.weight && goal === "perder" && p.goalWeightLb >= p.startWeightLb)
      e.goal = "Para bajar grasa, la meta debe ser menor que tu peso actual. Si quieres subir, elige «Ganar músculo».";
    else if (!e.weight && goal === "ganar" && p.goalWeightLb <= p.startWeightLb)
      e.goal = "Para ganar músculo, la meta debe ser mayor que tu peso actual. Si quieres bajar, elige «Bajar grasa».";
    else if (!e.height && p.heightCm) {
      const min = minHealthyWeightLb(p.heightCm);
      const max = maxGainWeightLb(p.heightCm);
      if (p.goalWeightLb < min) e.goal = `Para tu estatura, la meta mínima saludable es ${min} lb (IMC 18.5).`;
      else if (goal === "ganar" && p.goalWeightLb > max)
        e.goal = `Para ganar músculo sin acumular mucha grasa, una meta razonable para tu estatura es hasta ${max} lb. Puedes subirla después.`;
      else if (goal === "ganar" && p.goalWeightLb - p.startWeightLb > 30)
        e.goal = "Ponte una meta de hasta 30 lb más; al llegar, puedes fijar la siguiente.";
    }
  }

  if (p.startWaistIn !== undefined && (p.startWaistIn < 20 || p.startWaistIn > 80)) e.waist = "Revisa la medida (entre 20 y 80 pulgadas).";
  return e;
}

export function validateSchedule(p: Profile): Errors {
  const e: Errors = {};
  if (p.workDays.length && toMin(p.workStart) === toMin(p.workEnd)) e.work = "La hora de entrada y salida no pueden ser iguales.";
  let sleepMin = toMin(p.wakeTime) - toMin(p.sleepTime);
  if (sleepMin <= 0) sleepMin += 1440;
  if (sleepMin < 5 * 60) e.sleep = "Menos de 5 horas de sueño no es sostenible. Ajusta tus horas.";
  return e;
}

export function validateGym(p: Profile): Errors {
  const e: Errors = {};
  if (p.gymDays.length === 0) e.gym = "Elige al menos 2 días de gimnasio.";
  else if (p.gymDays.length === 1) e.gym = "Con 1 día no se completa la rutina: elige al menos 2.";
  // El gym tiene que caer entre que te levantas y 1 h antes de dormir
  const wake = toMin(p.wakeTime);
  let sleep = toMin(p.sleepTime);
  if (sleep <= wake) sleep += 1440;
  let g = toMin(p.gymTime);
  if (g < wake) g += 1440;
  if (g + p.gymDurationMin > sleep - 60)
    e.gymTime = "Con esa hora no terminas el gym al menos 1 h antes de dormir. Ajusta la hora, la duración o tu hora de dormir.";
  return e;
}

export function validateHealth(p: Profile): Errors {
  const e: Errors = {};
  const h = p.health;
  if (!h || Object.keys(h.answers).length < HEALTH_QUESTIONS.filter((q) => !q.onlyFemale || p.sex === "f").length)
    e.answers = "Responde todas las preguntas.";
  if (h?.flagged && !h.doctorAck) e.doctor = "Confirma que consultarás con un médico antes de empezar.";
  if (!h?.disclaimerAcceptedAt) e.disclaimer = "Debes aceptar el aviso para continuar.";
  if (!h?.dataConsentAt) e.consent = "Necesitamos tu autorización para guardar tus datos de salud.";
  return e;
}

/** Cuestionario de salud basado en el PAR-Q+ (adaptado). */
export const HEALTH_QUESTIONS: { id: string; text: string; onlyFemale?: boolean }[] = [
  { id: "corazon", text: "¿Algún médico te ha dicho que tienes una condición del corazón o presión arterial alta?" },
  { id: "pecho", text: "¿Sientes dolor en el pecho en reposo, en tu día a día o al hacer actividad física?" },
  { id: "mareo", text: "¿Has perdido el equilibrio por mareos o el conocimiento en los últimos 12 meses?" },
  { id: "cronica", text: "¿Tienes otra condición crónica diagnosticada (por ejemplo diabetes, asma, enfermedad renal)?" },
  { id: "medicamentos", text: "¿Tomas medicamentos recetados para una condición crónica?" },
  { id: "articulaciones", text: "¿Tienes algún problema en huesos, articulaciones o una lesión que pueda empeorar con el ejercicio?" },
  { id: "supervisado", text: "¿Un médico te ha dicho que solo debes hacer actividad física con supervisión?" },
  { id: "alimentacion", text: "¿Tienes o has tenido un trastorno de la conducta alimentaria (anorexia, bulimia, atracones)?" },
  { id: "embarazo", text: "¿Estás embarazada o tuviste un parto en los últimos 6 meses?", onlyFemale: true },
];

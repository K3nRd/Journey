export interface PlanExercise {
  exId: string;
  sets: number;
  reps: string; // "8-10" | "30-45 s"
  restSec: number;
  key?: boolean; // se mantiene en la sesión corta
  note?: string;
}

export interface TimedItem {
  exId: string;
  duration: string;
}

export interface DayPlan {
  key: string;
  weekday: number; // 0 = domingo
  title: string;
  short: string;
  focus: string;
  type: "fuerza" | "cardio" | "descanso";
  exercises: PlanExercise[];
  warmup: TimedItem[];
  cooldown: TimedItem[];
  cardioFinisher?: string;
}

const WARMUP_UPPER: TimedItem[] = [
  { exId: "Walking_Treadmill", duration: "5 min suave" },
  { exId: "Arm_Circles", duration: "30 s" },
  { exId: "Cat_Stretch", duration: "30 s" },
  { exId: "Incline_Push-Up", duration: "10 reps" },
];

const WARMUP_LOWER: TimedItem[] = [
  { exId: "Bicycling_Stationary", duration: "5 min suave" },
  { exId: "Standing_Hip_Circles", duration: "30 s" },
  { exId: "Bodyweight_Squat", duration: "15 reps" },
  { exId: "Single_Leg_Glute_Bridge", duration: "10 por pierna" },
];

const COOL_UPPER: TimedItem[] = [
  { exId: "Chest_And_Front_Of_Shoulder_Stretch", duration: "30 s por lado" },
  { exId: "Triceps_Stretch", duration: "30 s por lado" },
  { exId: "Shoulder_Stretch", duration: "30 s por lado" },
];

const COOL_BACK: TimedItem[] = [
  { exId: "Spinal_Stretch", duration: "30 s por lado" },
  { exId: "Standing_Biceps_Stretch", duration: "30 s" },
  { exId: "Cat_Stretch", duration: "45 s" },
];

const COOL_LOWER: TimedItem[] = [
  { exId: "Quad_Stretch", duration: "30 s por lado" },
  { exId: "Hamstring_Stretch", duration: "30 s por lado" },
  { exId: "IT_Band_and_Glute_Stretch", duration: "30 s por lado" },
  { exId: "Intermediate_Hip_Flexor_and_Quad_Stretch", duration: "30 s por lado" },
];

export const WEEK_PLAN: DayPlan[] = [
  {
    key: "domingo",
    weekday: 0,
    title: "Descanso",
    short: "Descanso",
    focus: "Recuperación total",
    type: "descanso",
    exercises: [],
    warmup: [],
    cooldown: [],
  },
  {
    key: "lunes",
    weekday: 1,
    title: "Pecho y tríceps",
    short: "Pecho",
    focus: "Empuje: pecho, tríceps y hombro frontal",
    type: "fuerza",
    warmup: WARMUP_UPPER,
    cooldown: COOL_UPPER,
    exercises: [
      { exId: "Barbell_Bench_Press_-_Medium_Grip", sets: 4, reps: "6-8", restSec: 150, key: true },
      { exId: "Incline_Dumbbell_Press", sets: 3, reps: "8-10", restSec: 120, key: true },
      { exId: "Butterfly", sets: 3, reps: "10-12", restSec: 90 },
      { exId: "Triceps_Pushdown_-_Rope_Attachment", sets: 3, reps: "10-12", restSec: 75, key: true },
      { exId: "Cable_Rope_Overhead_Triceps_Extension", sets: 3, reps: "10-12", restSec: 75 },
    ],
    cardioFinisher: "15 min de caminata inclinada (opcional)",
  },
  {
    key: "martes",
    weekday: 2,
    title: "Espalda y bíceps",
    short: "Espalda",
    focus: "Tirón: dorsales, espalda media y bíceps",
    type: "fuerza",
    warmup: WARMUP_UPPER,
    cooldown: COOL_BACK,
    exercises: [
      { exId: "Wide-Grip_Lat_Pulldown", sets: 4, reps: "8-10", restSec: 120, key: true },
      { exId: "Bent_Over_Barbell_Row", sets: 4, reps: "6-8", restSec: 150, key: true },
      { exId: "Seated_Cable_Rows", sets: 3, reps: "10-12", restSec: 90 },
      { exId: "Face_Pull", sets: 3, reps: "12-15", restSec: 60 },
      { exId: "Barbell_Curl", sets: 3, reps: "8-10", restSec: 75, key: true },
      { exId: "Hammer_Curls", sets: 3, reps: "10-12", restSec: 60 },
    ],
    cardioFinisher: "15 min de bicicleta suave (opcional)",
  },
  {
    key: "miercoles",
    weekday: 3,
    title: "Piernas",
    short: "Piernas",
    focus: "Cuádriceps, isquiotibiales y pantorrillas",
    type: "fuerza",
    warmup: WARMUP_LOWER,
    cooldown: COOL_LOWER,
    exercises: [
      { exId: "Barbell_Squat", sets: 4, reps: "6-8", restSec: 180, key: true },
      { exId: "Leg_Press", sets: 3, reps: "10-12", restSec: 120, key: true },
      { exId: "Romanian_Deadlift", sets: 3, reps: "8-10", restSec: 120, key: true },
      { exId: "Leg_Extensions", sets: 3, reps: "12-15", restSec: 75 },
      { exId: "Lying_Leg_Curls", sets: 3, reps: "10-12", restSec: 75 },
      { exId: "Standing_Calf_Raises", sets: 4, reps: "12-15", restSec: 60 },
    ],
  },
  {
    key: "jueves",
    weekday: 4,
    title: "Hombros y torso",
    short: "Hombros",
    focus: "Hombros completos, más pecho y espalda de refuerzo",
    type: "fuerza",
    warmup: WARMUP_UPPER,
    cooldown: COOL_UPPER,
    exercises: [
      { exId: "Dumbbell_Shoulder_Press", sets: 4, reps: "8-10", restSec: 120, key: true },
      { exId: "Side_Lateral_Raise", sets: 4, reps: "12-15", restSec: 60, key: true },
      { exId: "Reverse_Machine_Flyes", sets: 3, reps: "12-15", restSec: 60 },
      { exId: "Close-Grip_Front_Lat_Pulldown", sets: 3, reps: "10-12", restSec: 90, key: true },
      { exId: "Dumbbell_Bench_Press", sets: 3, reps: "10-12", restSec: 90 },
      { exId: "Dumbbell_Shrug", sets: 3, reps: "12-15", restSec: 60 },
    ],
    cardioFinisher: "15 min de elíptica (opcional)",
  },
  {
    key: "viernes",
    weekday: 5,
    title: "Piernas y abdomen",
    short: "Piernas + abs",
    focus: "Glúteos, piernas y core",
    type: "fuerza",
    warmup: WARMUP_LOWER,
    cooldown: COOL_LOWER,
    exercises: [
      { exId: "Barbell_Hip_Thrust", sets: 4, reps: "8-10", restSec: 120, key: true },
      { exId: "Dumbbell_Lunges", sets: 3, reps: "10 por pierna", restSec: 90, key: true },
      { exId: "Goblet_Squat", sets: 3, reps: "12-15", restSec: 90 },
      { exId: "Seated_Leg_Curl", sets: 3, reps: "10-12", restSec: 75 },
      { exId: "Seated_Calf_Raise", sets: 3, reps: "15-20", restSec: 60 },
      { exId: "Cable_Crunch", sets: 3, reps: "12-15", restSec: 60, key: true },
      { exId: "Hanging_Leg_Raise", sets: 3, reps: "10-12", restSec: 60 },
      { exId: "Plank", sets: 3, reps: "30-45 s", restSec: 45 },
    ],
  },
  {
    key: "sabado",
    weekday: 6,
    title: "Cardio y movilidad",
    short: "Cardio",
    focus: "Cardio moderado (zona 2) y movilidad — opcional",
    type: "cardio",
    warmup: [],
    cooldown: COOL_LOWER,
    exercises: [
      { exId: "Walking_Treadmill", sets: 1, reps: "30-40 min", restSec: 0, key: true, note: "O camina al aire libre 45 min" },
      { exId: "Rowing_Stationary", sets: 1, reps: "10 min", restSec: 0 },
      { exId: "Cat_Stretch", sets: 2, reps: "45 s", restSec: 15 },
      { exId: "Standing_Hip_Circles", sets: 2, reps: "30 s", restSec: 15 },
      { exId: "Dead_Bug", sets: 3, reps: "10 por lado", restSec: 30 },
    ],
  },
];

const WARMUP_FULL: TimedItem[] = [
  { exId: "Bicycling_Stationary", duration: "5 min suave" },
  { exId: "Arm_Circles", duration: "30 s" },
  { exId: "Standing_Hip_Circles", duration: "30 s" },
  { exId: "Bodyweight_Squat", duration: "15 reps" },
  { exId: "Incline_Push-Up", duration: "10 reps" },
];
const COOL_FULL: TimedItem[] = [
  { exId: "Chest_And_Front_Of_Shoulder_Stretch", duration: "30 s por lado" },
  { exId: "Spinal_Stretch", duration: "30 s por lado" },
  { exId: "Quad_Stretch", duration: "30 s por lado" },
  { exId: "Hamstring_Stretch", duration: "30 s por lado" },
];

const strength = (
  key: string,
  title: string,
  short: string,
  focus: string,
  warmup: TimedItem[],
  cooldown: TimedItem[],
  exercises: PlanExercise[],
  cardioFinisher?: string,
): DayPlan => ({ key, weekday: -1, title, short, focus, type: "fuerza", warmup, cooldown, exercises, cardioFinisher });

/** 2–3 días: cuerpo completo (cada músculo 2–3 veces por semana). */
export const FULL_BODY: DayPlan[] = [
  strength("full-a", "Cuerpo completo A", "Full A", "Sentadilla, press de banca y remo", WARMUP_FULL, COOL_FULL, [
    { exId: "Barbell_Squat", sets: 3, reps: "6-8", restSec: 180, key: true },
    { exId: "Barbell_Bench_Press_-_Medium_Grip", sets: 3, reps: "6-8", restSec: 150, key: true },
    { exId: "Seated_Cable_Rows", sets: 3, reps: "8-10", restSec: 120, key: true },
    { exId: "Lying_Leg_Curls", sets: 3, reps: "10-12", restSec: 75 },
    { exId: "Side_Lateral_Raise", sets: 3, reps: "12-15", restSec: 60 },
    { exId: "Cable_Crunch", sets: 3, reps: "12-15", restSec: 60 },
  ], "10–15 min de caminata inclinada (opcional)"),
  strength("full-b", "Cuerpo completo B", "Full B", "Peso muerto rumano, press de hombro y jalón", WARMUP_FULL, COOL_FULL, [
    { exId: "Romanian_Deadlift", sets: 3, reps: "8-10", restSec: 150, key: true },
    { exId: "Dumbbell_Shoulder_Press", sets: 3, reps: "8-10", restSec: 120, key: true },
    { exId: "Wide-Grip_Lat_Pulldown", sets: 3, reps: "8-10", restSec: 120, key: true },
    { exId: "Dumbbell_Bench_Press", sets: 3, reps: "10-12", restSec: 90 },
    { exId: "Leg_Press", sets: 3, reps: "10-12", restSec: 120 },
    { exId: "Standing_Calf_Raises", sets: 2, reps: "12-15", restSec: 60 },
    { exId: "Barbell_Curl", sets: 2, reps: "10-12", restSec: 60 },
    { exId: "Triceps_Pushdown_-_Rope_Attachment", sets: 2, reps: "10-12", restSec: 60 },
  ], "10–15 min de caminata inclinada (opcional)"),
  strength("full-c", "Cuerpo completo C", "Full C", "Hip thrust, press inclinado y remo con barra", WARMUP_FULL, COOL_FULL, [
    { exId: "Barbell_Hip_Thrust", sets: 3, reps: "8-10", restSec: 120, key: true },
    { exId: "Incline_Dumbbell_Press", sets: 3, reps: "8-10", restSec: 120, key: true },
    { exId: "Bent_Over_Barbell_Row", sets: 3, reps: "8-10", restSec: 120, key: true },
    { exId: "Dumbbell_Lunges", sets: 3, reps: "10 por pierna", restSec: 90 },
    { exId: "Face_Pull", sets: 3, reps: "12-15", restSec: 60 },
    { exId: "Standing_Calf_Raises", sets: 3, reps: "12-15", restSec: 60 },
    { exId: "Plank", sets: 3, reps: "30-45 s", restSec: 45 },
  ], "10–15 min de caminata inclinada (opcional)"),
];

/** 4 días: torso / pierna (cada músculo 2 veces por semana). */
export const UPPER_LOWER: DayPlan[] = [
  strength("torso-a", "Torso A (fuerza)", "Torso A", "Press de banca, remo y hombro", WARMUP_UPPER, COOL_UPPER, [
    { exId: "Barbell_Bench_Press_-_Medium_Grip", sets: 4, reps: "6-8", restSec: 150, key: true },
    { exId: "Bent_Over_Barbell_Row", sets: 4, reps: "6-8", restSec: 150, key: true },
    { exId: "Dumbbell_Shoulder_Press", sets: 3, reps: "8-10", restSec: 120, key: true },
    { exId: "Wide-Grip_Lat_Pulldown", sets: 3, reps: "10-12", restSec: 90 },
    { exId: "Barbell_Curl", sets: 3, reps: "8-10", restSec: 75 },
    { exId: "Triceps_Pushdown_-_Rope_Attachment", sets: 3, reps: "10-12", restSec: 75 },
  ]),
  strength("pierna-a", "Pierna A (sentadilla)", "Pierna A", "Cuádriceps, femoral y pantorrilla", WARMUP_LOWER, COOL_LOWER, [
    { exId: "Barbell_Squat", sets: 4, reps: "6-8", restSec: 180, key: true },
    { exId: "Romanian_Deadlift", sets: 3, reps: "8-10", restSec: 150, key: true },
    { exId: "Leg_Extensions", sets: 3, reps: "12-15", restSec: 75 },
    { exId: "Lying_Leg_Curls", sets: 3, reps: "10-12", restSec: 75, key: true },
    { exId: "Standing_Calf_Raises", sets: 4, reps: "12-15", restSec: 60 },
    { exId: "Cable_Crunch", sets: 3, reps: "12-15", restSec: 60 },
  ]),
  strength("torso-b", "Torso B (volumen)", "Torso B", "Press inclinado, jalón y hombro lateral", WARMUP_UPPER, COOL_BACK, [
    { exId: "Incline_Dumbbell_Press", sets: 4, reps: "8-10", restSec: 120, key: true },
    { exId: "Close-Grip_Front_Lat_Pulldown", sets: 4, reps: "8-10", restSec: 120, key: true },
    { exId: "Seated_Cable_Rows", sets: 3, reps: "10-12", restSec: 90, key: true },
    { exId: "Side_Lateral_Raise", sets: 4, reps: "12-15", restSec: 60 },
    { exId: "Face_Pull", sets: 3, reps: "12-15", restSec: 60 },
    { exId: "Hammer_Curls", sets: 3, reps: "10-12", restSec: 60 },
    { exId: "Cable_Rope_Overhead_Triceps_Extension", sets: 3, reps: "10-12", restSec: 60 },
  ]),
  strength("pierna-b", "Pierna B (glúteo)", "Pierna B", "Glúteo, femoral y abdomen", WARMUP_LOWER, COOL_LOWER, [
    { exId: "Barbell_Hip_Thrust", sets: 4, reps: "8-10", restSec: 120, key: true },
    { exId: "Leg_Press", sets: 3, reps: "10-12", restSec: 120, key: true },
    { exId: "Dumbbell_Lunges", sets: 3, reps: "10 por pierna", restSec: 90 },
    { exId: "Seated_Leg_Curl", sets: 3, reps: "10-12", restSec: 75, key: true },
    { exId: "Seated_Calf_Raise", sets: 3, reps: "15-20", restSec: 60 },
    { exId: "Hanging_Leg_Raise", sets: 3, reps: "10-12", restSec: 60 },
  ]),
];

/** Qué programa conviene según los días de gimnasio. */
export function programFor(days: number): { name: string; why: string; sessions: DayPlan[] } {
  const split = WEEK_PLAN.filter((d) => d.type === "fuerza");
  if (days <= 2) return { name: "Cuerpo completo (2 días)", why: "Con 2 días, entrenar todo el cuerpo en cada sesión es lo que más músculo trabaja por semana.", sessions: FULL_BODY.slice(0, 2) };
  if (days === 3) return { name: "Cuerpo completo (3 días)", why: "3 sesiones de cuerpo completo: cada músculo 3 veces por semana con buen descanso entre días.", sessions: FULL_BODY };
  if (days === 4) return { name: "Torso / Pierna", why: "4 días: cada músculo 2 veces por semana, la frecuencia que mejor funciona para ganar músculo.", sessions: UPPER_LOWER };
  return { name: "Rutina dividida (5 días)", why: "5 días: un grupo principal por día con más volumen por sesión. Si tienes 6 días, el sexto es cardio.", sessions: split };
}

export const ALL_PLANS: DayPlan[] = [...WEEK_PLAN, ...FULL_BODY, ...UPPER_LOWER];

export const dayPlanFor = (weekday: number) =>
  WEEK_PLAN.find((d) => d.weekday === weekday)!;

export const dayPlanByKey = (key: string) => ALL_PLANS.find((d) => d.key === key);

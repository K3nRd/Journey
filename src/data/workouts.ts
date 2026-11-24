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

export const dayPlanFor = (weekday: number) =>
  WEEK_PLAN.find((d) => d.weekday === weekday)!;

export const dayPlanByKey = (key: string) => WEEK_PLAN.find((d) => d.key === key);

export type Sex = "m" | "f";
export type Level = "principiante" | "intermedio" | "avanzado";
export type WorkType = "sentado" | "mixto" | "de pie";
export type MealSlot = "comida1" | "almuerzo" | "merienda" | "cena" | "snack";
export type Goal = "perder" | "mantener" | "ganar";

export type HabitId =
  | "agua"
  | "caminar"
  | "pausas"
  | "organizar"
  | "telefono"
  | "desconectar"
  | "pesaje"
  | "sueno";

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  startWeightLb: number;
  goalWeightLb: number;
  startWaistIn?: number;
  level: Level;

  wakeTime: string; // "HH:MM"
  sleepTime: string;
  workDays: number[]; // 0 = domingo
  workStart: string;
  workEnd: string;
  workType: WorkType;

  gymDays: number[];
  gymTime: string;
  gymDurationMin: number;
  saturdayCardio: boolean;

  mealsBefore: number;
  budgetWeekly: number;
  excludedFoods: string[];
  pantry: string[];

  habits: Record<HabitId, boolean>;
  waterGoalGlasses: number;
  stepsGoal: number;

  remindersEnabled: boolean;
  reminderKinds: Record<string, boolean>;

  timezone: string;
  startDate: string; // YYYY-MM-DD
  calorieTarget?: number; // ajuste manual / automático

  returningFromBreak?: boolean; // vuelve tras una pausa de entrenamiento
  goal?: Goal; // por defecto "perder"
  mealsPerDay?: 3 | 4 | 5; // por defecto 3
  health?: HealthScreening;
}

export interface HealthScreening {
  answers: Record<string, boolean>;
  flagged: boolean; // alguna respuesta "sí"
  doctorAck: boolean; // confirmó consultar con un médico
  disclaimerAcceptedAt: string; // ISO
}

export interface TimelineItem {
  id: string;
  time: string; // HH:MM
  end?: string;
  title: string;
  desc?: string;
  kind:
    | "habit"
    | "meal"
    | "work"
    | "gym"
    | "sleep"
    | "walk"
    | "break"
    | "cardio"
    | "track";
  icon: string;
  href?: string;
  meal?: MealSlot;
  checkable: boolean;
  remind: boolean;
  reminderKind: string;
}

export interface SetLog {
  weight: number;
  reps: number;
  done: boolean;
}

export interface ExerciseLog {
  exId: string;
  planExId: string; // ejercicio del plan (si se cambió por alternativa)
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  dayKey: string;
  startedAt: number;
  finishedAt?: number;
  exercises: ExerciseLog[];
  short?: boolean;
  notes?: string;
}

export interface FoodEntry {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs?: number;
  fat?: number;
  source: "plan" | "fuera" | "porcion" | "escaner" | "manual";
  meal?: MealSlot;
}

export interface Review {
  weekStart: string;
  good: string;
  bad: string;
  change: string;
  createdAt: number;
}

export interface PhotoMeta {
  id: string;
  date: string;
  pose: "frente" | "lado" | "espalda";
}

export interface DayMetrics {
  water?: number;
  steps?: number;
  energy?: number;
  hunger?: number;
  mood?: number;
  sleepBed?: string;
  sleepWake?: string;
  sleepQuality?: number;
}

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DayMetrics,
  FoodEntry,
  MealSlot,
  PhotoMeta,
  Profile,
  Review,
  WorkoutLog,
} from "./types";
import { dateKey, uid } from "./date";
import type { Entry } from "./progress";

// Perfil vacío: cada persona lo completa en las preguntas iniciales.
export const DEFAULT_PROFILE: Profile = {
  name: "",
  sex: "m",
  age: 0,
  heightCm: 0,
  startWeightLb: 0,
  goalWeightLb: 0,
  startWaistIn: undefined,
  level: "principiante",
  wakeTime: "06:30",
  sleepTime: "22:30",
  workDays: [1, 2, 3, 4, 5],
  workStart: "08:00",
  workEnd: "17:00",
  workType: "sentado",
  gymDays: [1, 2, 3, 4, 5],
  gymTime: "18:30",
  gymDurationMin: 90,
  saturdayCardio: true,
  mealsBefore: 2,
  budgetWeekly: 2500,
  excludedFoods: [],
  pantry: ["aceite", "sazon"],
  habits: {
    agua: true,
    caminar: true,
    pausas: true,
    organizar: true,
    telefono: true,
    desconectar: true,
    pesaje: true,
    sueno: true,
  },
  waterGoalGlasses: 10,
  stepsGoal: 8000,
  remindersEnabled: false,
  reminderKinds: {
    habitos: true,
    comidas: true,
    gym: true,
    pausas: true,
    caminar: true,
    seguimiento: true,
    sueno: true,
  },
  timezone: "America/Santo_Domingo",
  startDate: dateKey(),
};

export interface SavedExternal {
  id: string;
  name: string;
  thumb?: string;
  source: "mealdb" | "web";
  url?: string;
}

export interface Spending {
  id: string;
  date: string;
  amount: number;
  note: string;
}

export interface AppState {
  onboarded: boolean;
  profile: Profile;
  overrides: Record<string, string>;
  checks: Record<string, Record<string, boolean>>;
  metrics: Record<string, DayMetrics>;
  weights: Entry[];
  waists: Entry[];
  workouts: WorkoutLog[];
  activeWorkoutId?: string;
  foodLog: Record<string, FoodEntry[]>;
  menuSwaps: Record<string, Partial<Record<MealSlot, string>>>; // clave: día de la semana "0".."6"
  favorites: string[];
  savedExternal: SavedExternal[];
  prices: Record<string, number>;
  reviews: Review[];
  spending: Spending[];
  photos: PhotoMeta[];
  shoppingChecked: Record<string, boolean>;
  theme: "dark" | "light" | "system";
  deviceId: string;
  pushEnabled: boolean;
  syncCode?: string;
  lastSyncAt?: number;
  ownerId?: string; // cuenta dueña de estos datos
  calorieHistory: { date: string; kcal: number; reason: string }[];
  installDismissed?: boolean;

  // acciones
  setProfile: (p: Partial<Profile>) => void;
  finishOnboarding: () => void;
  resetOnboarding: () => void;
  setOverride: (id: string, time: string | null) => void;
  toggleCheck: (date: string, id: string, value?: boolean) => void;
  setMetric: (date: string, m: Partial<DayMetrics>) => void;
  addWeight: (date: string, value: number) => void;
  addWaist: (date: string, value: number) => void;
  removeWeight: (date: string) => void;
  removeWaist: (date: string) => void;
  startWorkout: (w: WorkoutLog) => void;
  updateWorkout: (id: string, fn: (w: WorkoutLog) => WorkoutLog) => void;
  finishWorkout: (id: string) => void;
  discardWorkout: (id: string) => void;
  addFood: (date: string, e: Omit<FoodEntry, "id">) => void;
  removeFood: (date: string, id: string) => void;
  swapMeal: (weekday: number, slot: MealSlot, recipeId: string | null) => void;
  toggleFavorite: (id: string) => void;
  saveExternal: (r: SavedExternal) => void;
  removeExternal: (id: string) => void;
  setPrice: (foodId: string, price: number | null) => void;
  addReview: (r: Omit<Review, "createdAt">) => void;
  addSpending: (s: Omit<Spending, "id">) => void;
  removeSpending: (id: string) => void;
  addPhoto: (p: PhotoMeta) => void;
  removePhoto: (id: string) => void;
  toggleShopping: (id: string) => void;
  clearShopping: () => void;
  setTheme: (t: AppState["theme"]) => void;
  setPushEnabled: (v: boolean) => void;
  setSyncCode: (c?: string) => void;
  markSynced: () => void;
  setCalorieTarget: (kcal: number | undefined, reason: string) => void;
  dismissInstall: () => void;
  importData: (data: Partial<AppState>) => void;
}

const upsert = (arr: Entry[], date: string, value: number) =>
  [...arr.filter((e) => e.date !== date), { date, value }].sort((a, b) => a.date.localeCompare(b.date));

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      onboarded: false,
      profile: DEFAULT_PROFILE,
      overrides: {},
      checks: {},
      metrics: {},
      weights: [],
      waists: [],
      workouts: [],
      foodLog: {},
      menuSwaps: {},
      favorites: [],
      savedExternal: [],
      prices: {},
      reviews: [],
      spending: [],
      photos: [],
      shoppingChecked: {},
      theme: "dark",
      deviceId: uid(),
      pushEnabled: false,
      calorieHistory: [],

      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      finishOnboarding: () =>
        set((s) => {
          const today = dateKey();
          return {
            onboarded: true,
            profile: { ...s.profile, startDate: s.onboarded ? s.profile.startDate : today },
            weights: s.weights.length ? s.weights : [{ date: today, value: s.profile.startWeightLb }],
            waists:
              s.waists.length || !s.profile.startWaistIn ? s.waists : [{ date: today, value: s.profile.startWaistIn }],
          };
        }),
      resetOnboarding: () => set({ onboarded: false }),
      setOverride: (id, time) =>
        set((s) => {
          const o = { ...s.overrides };
          if (time) o[id] = time;
          else delete o[id];
          return { overrides: o };
        }),
      toggleCheck: (date, id, value) =>
        set((s) => {
          const day = { ...(s.checks[date] ?? {}) };
          day[id] = value ?? !day[id];
          return { checks: { ...s.checks, [date]: day } };
        }),
      setMetric: (date, m) => set((s) => ({ metrics: { ...s.metrics, [date]: { ...(s.metrics[date] ?? {}), ...m } } })),
      addWeight: (date, value) => set((s) => ({ weights: upsert(s.weights, date, value) })),
      addWaist: (date, value) => set((s) => ({ waists: upsert(s.waists, date, value) })),
      removeWeight: (date) => set((s) => ({ weights: s.weights.filter((e) => e.date !== date) })),
      removeWaist: (date) => set((s) => ({ waists: s.waists.filter((e) => e.date !== date) })),
      startWorkout: (w) => set((s) => ({ workouts: [...s.workouts, w], activeWorkoutId: w.id })),
      updateWorkout: (id, fn) => set((s) => ({ workouts: s.workouts.map((w) => (w.id === id ? fn(w) : w)) })),
      finishWorkout: (id) =>
        set((s) => ({
          workouts: s.workouts.map((w) => (w.id === id ? { ...w, finishedAt: Date.now() } : w)),
          activeWorkoutId: undefined,
        })),
      discardWorkout: (id) =>
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id), activeWorkoutId: undefined })),
      addFood: (date, e) =>
        set((s) => ({ foodLog: { ...s.foodLog, [date]: [...(s.foodLog[date] ?? []), { ...e, id: uid() }] } })),
      removeFood: (date, id) =>
        set((s) => ({ foodLog: { ...s.foodLog, [date]: (s.foodLog[date] ?? []).filter((e) => e.id !== id) } })),
      swapMeal: (weekday, slot, recipeId) =>
        set((s) => {
          const day = { ...(s.menuSwaps[weekday] ?? {}) };
          if (recipeId) day[slot] = recipeId;
          else delete day[slot];
          return { menuSwaps: { ...s.menuSwaps, [weekday]: day } };
        }),
      toggleFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id] })),
      saveExternal: (r) => set((s) => ({ savedExternal: [...s.savedExternal.filter((x) => x.id !== r.id), r] })),
      removeExternal: (id) => set((s) => ({ savedExternal: s.savedExternal.filter((x) => x.id !== id) })),
      setPrice: (foodId, price) =>
        set((s) => {
          const p = { ...s.prices };
          if (price === null) delete p[foodId];
          else p[foodId] = price;
          return { prices: p };
        }),
      addReview: (r) => set((s) => ({ reviews: [...s.reviews.filter((x) => x.weekStart !== r.weekStart), { ...r, createdAt: Date.now() }] })),
      addSpending: (x) => set((s) => ({ spending: [...s.spending, { ...x, id: uid() }] })),
      removeSpending: (id) => set((s) => ({ spending: s.spending.filter((x) => x.id !== id) })),
      addPhoto: (p) => set((s) => ({ photos: [...s.photos, p] })),
      removePhoto: (id) => set((s) => ({ photos: s.photos.filter((x) => x.id !== id) })),
      toggleShopping: (id) => set((s) => ({ shoppingChecked: { ...s.shoppingChecked, [id]: !s.shoppingChecked[id] } })),
      clearShopping: () => set({ shoppingChecked: {} }),
      setTheme: (theme) => set({ theme }),
      setPushEnabled: (pushEnabled) => set({ pushEnabled }),
      setSyncCode: (syncCode) => set({ syncCode }),
      markSynced: () => set({ lastSyncAt: Date.now() }),
      setCalorieTarget: (kcal, reason) =>
        set((s) => ({
          profile: { ...s.profile, calorieTarget: kcal },
          calorieHistory: kcal ? [...s.calorieHistory, { date: dateKey(), kcal, reason }] : s.calorieHistory,
        })),
      dismissInstall: () => set({ installDismissed: true }),
      importData: (data) => set((s) => ({ ...s, ...data })),
    }),
    {
      name: "journey-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

/** Datos que se exportan / sincronizan (sin funciones). */
export function exportableState(s: AppState) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) if (typeof v !== "function") out[k] = v;
  return out as Partial<AppState>;
}

// Referencias estables para selectores (evita renders infinitos)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EMPTY_OBJ: any = Object.freeze({});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EMPTY_ARR: any = Object.freeze([]);

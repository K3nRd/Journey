"use client";

import { useApp } from "./store";
import { markDoneRemote } from "./push-client";
import type { MealSlot, TimelineItem } from "./types";
import type { PlannedMeal } from "./nutrition";

/** Marca/desmarca un elemento del checklist (y lo sincroniza con el servidor de avisos). */
export function toggleItem(date: string, item: Pick<TimelineItem, "id" | "meal">, meal?: PlannedMeal, value?: boolean) {
  const s = useApp.getState();
  const next = value ?? !s.checks[date]?.[item.id];
  s.toggleCheck(date, item.id, next);
  if (s.pushEnabled) markDoneRemote(s.deviceId, date, item.id, next);
  if (item.meal && meal) setMealEaten(date, item.meal, meal, next);
}

/** Registra la comida del plan en el diario de comidas. */
export function setMealEaten(date: string, slot: MealSlot, meal: PlannedMeal, eaten: boolean) {
  const s = useApp.getState();
  const existing = (s.foodLog[date] ?? []).filter((e) => e.source === "plan" && e.meal === slot);
  existing.forEach((e) => s.removeFood(date, e.id));
  if (eaten) {
    s.addFood(date, {
      name: meal.recipe.name,
      kcal: Math.round(meal.macros.kcal),
      protein: Math.round(meal.macros.protein),
      carbs: Math.round(meal.macros.carbs),
      fat: Math.round(meal.macros.fat),
      source: "plan",
      meal: slot,
    });
  }
}

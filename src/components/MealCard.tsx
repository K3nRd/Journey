"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Check, RefreshCw } from "lucide-react";
import { FOOD } from "@/data/foods";
import { RECIPES } from "@/data/recipes";
import { SLOT_LABEL, SLOT_LABEL_REST } from "@/data/mealplan";
import { formatQty, recipeMacros, excludedFoodIds, recipeAllowed, type PlannedMeal } from "@/lib/nutrition";
import { useApp } from "@/lib/store";
import { Button, Sheet, cx } from "./ui";

export function MealCard({
  meal,
  weekday,
  eaten,
  onToggle,
  time,
  restDay,
  compact,
}: {
  meal: PlannedMeal;
  weekday: number;
  eaten: boolean;
  onToggle: () => void;
  time?: string;
  restDay?: boolean;
  compact?: boolean;
}) {
  const [swap, setSwap] = useState(false);
  const r = meal.recipe;
  const label = (restDay ? SLOT_LABEL_REST : SLOT_LABEL)[meal.slot];
  const mains = r.ingredients.filter((i) => !FOOD[i.food]?.seasoning || i.food === "aceite").slice(0, compact ? 4 : 8);

  return (
    <div className={cx("rounded-2xl border border-line bg-surface-2/60 p-3.5", eaten && "opacity-70")}>
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-3 text-2xl">{r.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {label}
            {time && ` · ${time}`}
          </div>
          <div className="font-semibold leading-snug">{r.name}</div>
          <div className="mt-0.5 text-xs text-muted">
            {Math.round(meal.macros.kcal)} kcal · <span className="text-accent">{Math.round(meal.macros.protein)} g proteína</span> · {r.minutes} min
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition",
            eaten ? "border-accent bg-accent text-accent-ink" : "border-line",
          )}
          aria-label={eaten ? "Desmarcar comida" : "Marcar como comida"}
        >
          {eaten && <Check className="h-5 w-5" strokeWidth={3} />}
        </button>
      </div>

      <p className="mt-2.5 text-sm text-fg/90">{r.summary}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {mains.map((i) => {
          const f = FOOD[i.food];
          return (
            <span key={i.food} className="rounded-lg bg-surface-3 px-2 py-1 text-xs text-muted">
              {f.name.replace(/ \(.+\)/, "")}: <span className="text-fg">{formatQty(f, i.g * meal.scale)}</span>
            </span>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          href={`/recetas/${r.id}?porcion=${meal.scale}`}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent text-sm font-semibold text-accent-ink"
        >
          <BookOpen className="h-4 w-4" /> Receta completa
        </Link>
        <Button size="sm" variant="secondary" onClick={() => setSwap(true)}>
          <RefreshCw className="h-4 w-4" /> Cambiar
        </Button>
      </div>
      <SwapSheet open={swap} onClose={() => setSwap(false)} meal={meal} weekday={weekday} />
    </div>
  );
}

function SwapSheet({ open, onClose, meal, weekday }: { open: boolean; onClose: () => void; meal: PlannedMeal; weekday: number }) {
  const swapMeal = useApp((s) => s.swapMeal);
  const profile = useApp((s) => s.profile);
  const favorites = useApp((s) => s.favorites);
  const ex = excludedFoodIds(profile);
  const options = RECIPES.filter((r) => r.slots.includes(meal.slot) && recipeAllowed(r, ex)).sort(
    (a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)),
  );
  return (
    <Sheet open={open} onClose={onClose} title="Cambiar comida">
      <p className="mb-3 text-sm text-muted">Se cambia para este día de la semana. Las porciones se ajustan solas a tus calorías.</p>
      <div className="space-y-2">
        {options.map((r) => {
          const m = recipeMacros(r);
          const current = r.id === meal.recipe.id;
          return (
            <button
              key={r.id}
              onClick={() => {
                swapMeal(weekday, meal.slot, r.id);
                onClose();
              }}
              className={cx(
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                current ? "border-accent bg-accent-soft" : "border-line bg-surface-2",
              )}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {favorites.includes(r.id) && "★ "}
                  {r.name}
                </span>
                <span className="text-xs text-muted">
                  ~{Math.round(m.kcal)} kcal · {Math.round(m.protein)} g proteína · {r.minutes} min
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <Button
        variant="ghost"
        className="mt-3 w-full"
        onClick={() => {
          swapMeal(weekday, meal.slot, null);
          onClose();
        }}
      >
        Volver al menú original
      </Button>
    </Sheet>
  );
}

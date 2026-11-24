"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Check, RefreshCw } from "lucide-react";
import { FOOD } from "@/data/foods";
import { RECIPES } from "@/data/recipes";
import { RECIPE_POOL } from "@/data/mealplan";
import { goalOf, mealsPerDay, slotLabel } from "@/lib/meals";
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
  const profile = useApp((s) => s.profile);
  const label = slotLabel(meal.slot, mealsPerDay(profile), !restDay, goalOf(profile));
  const mains = r.ingredients.filter((i) => !FOOD[i.food]?.seasoning || i.food === "aceite").slice(0, compact ? 4 : 8);

  return (
    <div
      className={cx("card flex h-full flex-col overflow-hidden !p-0 transition", eaten && "opacity-60")}
      style={{ background: "radial-gradient(130% 55% at 0% 0%, var(--food-soft), transparent 65%), var(--card-hi), var(--surface)" }}
    >
      {/* Cabecera */}
      <div className="relative flex items-start gap-3 p-4 pb-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-surface text-[30px] shadow-sm">{r.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-bold uppercase tracking-[0.06em] text-food">
            {label}
            {time && <span className="font-medium normal-case tracking-normal text-muted"> · {time}</span>}
          </div>
          <div className="font-display text-[17px] font-bold leading-tight">{r.name}</div>
        </div>
        <button
          onClick={onToggle}
          className={cx(
            "tap grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition",
            eaten ? "grad pop border-transparent text-accent-ink" : "border-line-strong",
          )}
          aria-label={eaten ? "Desmarcar comida" : "Marcar como comida"}
        >
          {eaten && <Check className="h-5 w-5" strokeWidth={3} />}
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="flex gap-2">
          <Stat value={Math.round(meal.macros.kcal)} unit="kcal" />
          <Stat value={Math.round(meal.macros.protein)} unit="g prot" accent />
          <Stat value={r.minutes} unit="min" />
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-fg/85">{r.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mains.map((i) => {
            const f = FOOD[i.food];
            return (
              <span key={i.food} className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[12px] text-muted">
                {f.name.replace(/ \(.+\)/, "")} · <span className="font-medium text-fg">{formatQty(f, i.g * meal.scale)}</span>
              </span>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="mt-4 flex gap-2">
          <Link href={`/recetas/${r.id}?porcion=${meal.scale}`} className="tap grad glow inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-accent-ink">
            <BookOpen className="h-4 w-4" /> Receta completa
          </Link>
          <Button variant="secondary" className="!px-4" onClick={() => setSwap(true)} aria-label="Cambiar comida">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <SwapSheet open={swap} onClose={() => setSwap(false)} meal={meal} weekday={weekday} />
    </div>
  );
}

function Stat({ value, unit, accent }: { value: number; unit: string; accent?: boolean }) {
  return (
    <div className={cx("flex-1 rounded-2xl px-3 py-2", accent ? "bg-accent-soft" : "bg-surface-2")}>
      <div className={cx("font-display text-lg font-bold leading-none", accent && "text-accent-text")}>{value}</div>
      <div className="mt-1 text-[11px] text-muted">{unit}</div>
    </div>
  );
}

function SwapSheet({ open, onClose, meal, weekday }: { open: boolean; onClose: () => void; meal: PlannedMeal; weekday: number }) {
  const swapMeal = useApp((s) => s.swapMeal);
  const profile = useApp((s) => s.profile);
  const favorites = useApp((s) => s.favorites);
  const ex = excludedFoodIds(profile);
  const options = RECIPES.filter((r) => r.slots.includes(RECIPE_POOL[meal.slot]) && recipeAllowed(r, ex)).sort(
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

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Check, RefreshCw } from "lucide-react";
import { FOOD } from "@/data/foods";
import { goalOf, mealsPerDay, slotLabel } from "@/lib/meals";
import { formatQty, mealKcalTarget, swapOptions, type PlannedMeal, type SwapOption } from "@/lib/nutrition";
import { useTargets } from "@/lib/hooks";
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
  const t = useTargets();
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const goalKcal = mealKcalTarget(profile, t.kcal, meal.slot);
  const all = useMemo(() => (open ? swapOptions(meal, profile, t.kcal) : []), [open, meal, profile, t.kcal]);
  const norm = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const filtered = all
    .filter((o) => o.recipe.id !== meal.recipe.id)
    .filter((o) => !q || norm(o.recipe.name + " " + o.recipe.tags.join(" ")).includes(norm(q)))
    .sort((a, b) => Number(b.equivalent) - Number(a.equivalent) || Number(favorites.includes(b.recipe.id)) - Number(favorites.includes(a.recipe.id)));
  const equivalents = filtered.filter((o) => o.equivalent);
  const others = filtered.filter((o) => !o.equivalent);

  const pick = (id: string) => {
    swapMeal(weekday, meal.slot, id);
    setQ("");
    setShowAll(false);
    onClose();
  };

  const Row = ({ o }: { o: SwapOption }) => (
    <button
      onClick={() => pick(o.recipe.id)}
      className={cx("flex w-full items-center gap-3 rounded-xl border p-3 text-left", o.equivalent ? "border-line bg-surface-2" : "border-line/60 bg-surface")}
    >
      <span className="text-2xl">{o.recipe.emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">
          {favorites.includes(o.recipe.id) && "★ "}
          {o.recipe.name}
        </span>
        <span className="text-xs text-muted">
          ≈{Math.round(o.macros.kcal)} kcal · {Math.round(o.macros.protein)} g proteína
          {Math.abs(o.proteinDiff) >= 1 && (
            <span className={o.proteinDiff < 0 && !o.equivalent ? "text-warn" : o.proteinDiff > 0 ? "text-good" : ""}>
              {" "}({o.proteinDiff > 0 ? "+" : ""}
              {Math.round(o.proteinDiff)} g)
            </span>
          )}
          {o.scale !== 1 ? ` · porción ×${o.scale}` : ""} · {o.recipe.minutes} min
        </span>
      </span>
    </button>
  );

  return (
    <Sheet open={open} onClose={onClose} title="Cambiar comida">
      <p className="mb-3 text-sm text-muted">
        Tu comida actual: <b className="text-fg">≈{Math.round(meal.macros.kcal)} kcal y {Math.round(meal.macros.protein)} g de proteína</b>. Te
        mostramos primero las <b className="text-fg">equivalentes</b>: mismas calorías (la porción ya viene ajustada a {Math.round(goalKcal)} kcal) y
        la misma proteína o más.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar: pollo, mexicano, avena…"
        className="mb-3 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[16px] outline-none focus:border-accent"
      />
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-good">Equivalentes ({equivalents.length})</div>
      <div className="space-y-2">
        {equivalents.map((o) => (
          <Row key={o.recipe.id} o={o} />
        ))}
        {equivalents.length === 0 && <p className="text-sm text-muted">No hay equivalentes con esa búsqueda.</p>}
      </div>
      {others.length > 0 && (
        <div className="mt-4">
          <button type="button" onClick={() => setShowAll((v) => !v)} className="text-sm font-semibold text-accent-text">
            {showAll ? "Ocultar" : "Ver"} otras {others.length} opciones (menos proteína)
          </button>
          {showAll && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-warn">Estas te dan menos proteína que tu comida actual: compénsalo en otra comida del día.</p>
              {others.map((o) => (
                <Row key={o.recipe.id} o={o} />
              ))}
            </div>
          )}
        </div>
      )}
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

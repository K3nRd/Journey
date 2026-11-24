"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Clock, Star, Wallet, CalendarPlus } from "lucide-react";
import { RECIPE } from "@/data/recipes";
import { FOOD } from "@/data/foods";
import { useApp } from "@/lib/store";
import { formatQty, recipeMacros } from "@/lib/nutrition";
import { recipeCost } from "@/lib/recipes-search";
import { PageHeader, Card, Chip, SectionTitle, Badge, Sheet, Button, cx } from "@/components/ui";
import { DAY_NAMES } from "@/lib/date";
import { RECIPE_POOL } from "@/data/mealplan";
import { goalOf, mealsPerDay, slotLabel, slotsFor } from "@/lib/meals";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const r = RECIPE[id];
  const favorites = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const swapMeal = useApp((s) => s.swapMeal);
  const prices = useApp((s) => s.prices);
  const profile = useApp((s) => s.profile);
  const [scale, setScale] = useState(1);
  const [done, setDone] = useState<number[]>([]);
  const [plan, setPlan] = useState(false);

  useEffect(() => {
    const p = Number(new URLSearchParams(window.location.search).get("porcion"));
    if (p > 0) setScale(p);
  }, []);

  if (!r) return <PageHeader title="Receta no encontrada" back="/recetas" />;
  const m = recipeMacros(r, scale);
  const fav = favorites.includes(r.id);
  const scales = [...new Set([0.75, 1, 1.25, 1.5, scale])].sort((a, b) => a - b);

  return (
    <div>
      <PageHeader
        title={r.name}
        back
        right={
          <button onClick={() => toggleFavorite(r.id)} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2" aria-label="Favorita">
            <Star className={cx("h-5 w-5", fav && "fill-warn text-warn")} />
          </button>
        }
      />
      <div className="grid h-28 place-items-center rounded-3xl bg-surface-2 text-6xl">{r.emoji}</div>
      <p className="mt-3 text-fg/90">{r.summary}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge>
          <Clock className="h-3 w-3" /> {r.minutes} min
        </Badge>
        <Badge>
          <Wallet className="h-3 w-3" /> ~RD${recipeCost(r, prices, scale)} por porción
        </Badge>
        {r.tags.map((t) => (
          <Badge key={t} tone="accent">
            {t}
          </Badge>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          [Math.round(m.kcal), "kcal"],
          [`${Math.round(m.protein)} g`, "proteína"],
          [`${Math.round(m.carbs)} g`, "carbos"],
          [`${Math.round(m.fat)} g`, "grasa"],
        ].map(([v, l], i) => (
          <Card key={l} className="!p-2">
            <div className={cx("text-lg font-bold", i === 1 && "text-accent-text")}>{v}</div>
            <div className="text-[11px] text-muted">{l}</div>
          </Card>
        ))}
      </div>

      <SectionTitle>Tamaño de porción</SectionTitle>
      <div className="flex gap-2">
        {scales.map((s) => (
          <Chip key={s} active={scale === s} onClick={() => setScale(s)}>
            ×{s}
          </Chip>
        ))}
      </div>

      <SectionTitle>Ingredientes (1 porción)</SectionTitle>
      <Card className="divide-y divide-line !py-1">
        {r.ingredients.map((i) => {
          const f = FOOD[i.food];
          return (
            <div key={i.food} className="flex items-baseline justify-between gap-3 py-2 text-sm">
              <span>
                {f.name}
                {i.note && <span className="text-xs text-muted"> · {i.note}</span>}
              </span>
              <span className="shrink-0 font-semibold">{formatQty(f, i.g * scale)}</span>
            </div>
          );
        })}
      </Card>

      <SectionTitle>Preparación</SectionTitle>
      <div className="space-y-2">
        {r.steps.map((s, i) => {
          const on = done.includes(i);
          return (
            <button
              key={i}
              onClick={() => setDone((d) => (on ? d.filter((x) => x !== i) : [...d, i]))}
              className={cx("card flex w-full gap-3 !p-3 text-left", on && "opacity-50")}
            >
              <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold", on ? "grad text-accent-ink" : "bg-surface-2 text-accent-text")}>
                {on ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cx("text-sm", on && "line-through")}>{s}</span>
            </button>
          );
        })}
      </div>
      {r.prep && <Card className="mt-3 bg-info/10 text-sm text-info">🧊 {r.prep}</Card>}

      <Button variant="secondary" className="mt-5 w-full" onClick={() => setPlan(true)}>
        <CalendarPlus className="h-4 w-4" /> Usar en mi menú
      </Button>

      <Sheet open={plan} onClose={() => setPlan(false)} title="¿Qué día?">
        <div className="space-y-2">
          {slotsFor(mealsPerDay(profile)).filter((slot) => r.slots.includes(RECIPE_POOL[slot])).map((slot) => (
            <div key={slot}>
              <div className="mb-1 text-sm font-semibold">{slotLabel(slot, mealsPerDay(profile), false, goalOf(profile))}</div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      swapMeal(d, slot, r.id);
                      setPlan(false);
                    }}
                  >
                    {DAY_NAMES[d].slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

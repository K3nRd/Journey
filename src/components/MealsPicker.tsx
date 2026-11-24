"use client";

import { useApp } from "@/lib/store";
import { targets } from "@/lib/nutrition";
import { useCurrentWeight } from "@/lib/hooks";
import { Field, cx } from "./ui";

/** Elegir 3, 4 o 5 comidas al día, con la sugerencia según calorías y objetivo. */
export
function MealsPicker({ label = "¿Cuántas comidas al día?" }: { label?: string }) {
  const p = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const { trend } = useCurrentWeight();
  const t = targets(p, trend || p.startWeightLb || 150);
  const current = p.mealsPerDay ?? t.suggestedMeals;
  const why =
    t.goal === "ganar"
      ? "Para ganar músculo hay que comer bastante: repartirlo en más comidas lo hace más fácil."
      : t.suggestedMeals >= 4
        ? "Repartir tus calorías y tu proteína (unos 25–40 g por comida) te mantiene con energía y menos hambre."
        : "Con tus calorías, 3 comidas bien armadas son suficientes y más fáciles de mantener.";
  return (
    <Field label={label}>
      <div className="grid grid-cols-3 gap-2">
        {([3, 4, 5] as const).map((n) => {
          const on = current === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setProfile({ mealsPerDay: n })}
              className={cx(
                "tap relative rounded-2xl border p-3 text-center transition",
                on ? "border-transparent grad text-accent-ink" : "border-line bg-surface-2",
              )}
            >
              <div className="font-display text-2xl font-bold">{n}</div>
              <div className="text-[11px] font-medium">{n === 3 ? "3 principales" : n === 4 ? "+ almuerzo" : "+ 2 meriendas"}</div>
              {n === t.suggestedMeals && (
                <span className={cx("absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold", on ? "bg-bg text-fg" : "bg-accent-soft text-accent-text")}>
                  Sugerido
                </span>
              )}
            </button>
          );
        })}
      </div>
      <span className="mt-1.5 block text-xs text-muted">
        {why} Lo que más cuenta es el total del día: elige lo que puedas cumplir.
      </span>
    </Field>
  );
}

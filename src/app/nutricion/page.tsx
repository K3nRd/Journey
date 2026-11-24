"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, ChefHat, NotebookPen, Search, UtensilsCrossed } from "lucide-react";
import { EMPTY_OBJ, useApp } from "@/lib/store";
import { useDay, useTargets } from "@/lib/hooks";
import { addDays, dateKey, DAY_SHORT, parseKey, weekStart, fmtDate, fmt12 } from "@/lib/date";
import { PageHeader, Card, SectionTitle, Bar, cx } from "@/components/ui";
import { MealCard } from "@/components/MealCard";
import { toggleItem } from "@/lib/actions";

export default function Nutricion() {
  const today = dateKey();
  const [sel, setSel] = useState(today);
  const ws = weekStart(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const day = useDay(sel);
  const t = useTargets();
  const checks = useApp((s) => s.checks[sel] ?? EMPTY_OBJ);
  const tot = day.menu.reduce(
    (a, m) => ({ kcal: a.kcal + m.macros.kcal, p: a.p + m.macros.protein, c: a.c + m.macros.carbs, f: a.f + m.macros.fat }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );

  return (
    <div>
      <PageHeader title="Nutrición" subtitle={`${t.kcal.toLocaleString("es-DO")} kcal · ${t.protein} g proteína al día`} />

      <div className="grid grid-cols-4 gap-2">
        {[
          { href: "/recetas", icon: Search, label: "Recetas" },
          { href: "/nutricion/compras", icon: ShoppingCart, label: "Compras" },
          { href: "/nutricion/preparacion", icon: ChefHat, label: "Domingo" },
          { href: "/registro", icon: NotebookPen, label: "Registro" },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="card flex flex-col items-center gap-1 !p-2.5 text-center">
            <x.icon className="h-5 w-5 text-accent-text" />
            <span className="text-xs font-medium">{x.label}</span>
          </Link>
        ))}
      </div>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        {days.map((k) => {
          const d = parseKey(k);
          return (
            <button
              key={k}
              onClick={() => setSel(k)}
              className={cx(
                "flex w-12 shrink-0 flex-col items-center rounded-2xl border py-2",
                sel === k ? "border-transparent grad text-accent-ink" : "border-line bg-surface",
                k === today && sel !== k && "border-accent/60",
              )}
            >
              <span className="text-[11px] font-semibold uppercase">{DAY_SHORT[d.getDay()]}</span>
              <span className="text-lg font-bold">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      <Card className="mt-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm text-muted">{fmtDate(sel)}</span>
          <span className="text-sm">
            <b>{Math.round(tot.kcal).toLocaleString("es-DO")}</b> / {t.kcal.toLocaleString("es-DO")} kcal
          </span>
        </div>
        <Bar value={tot.kcal / t.kcal} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-base font-bold text-accent-text">{Math.round(tot.p)} g</div>
            <div className="text-muted">proteína</div>
          </div>
          <div>
            <div className="text-base font-bold">{Math.round(tot.c)} g</div>
            <div className="text-muted">carbohidratos</div>
          </div>
          <div>
            <div className="text-base font-bold">{Math.round(tot.f)} g</div>
            <div className="text-muted">grasa</div>
          </div>
        </div>
        {day.menu[0] && day.menu[0].scale !== 1 && (
          <p className="mt-3 text-xs text-muted">
            Porciones ajustadas ×{day.menu[0].scale} para acercarte a tu meta. Los gramos ya están calculados.
          </p>
        )}
      </Card>

      <SectionTitle>Menú del día</SectionTitle>
      <div className="space-y-3">
        {day.menu.map((m) => {
          const item = day.timeline.find((i) => i.meal === m.slot);
          return (
            <MealCard
              key={m.slot}
              meal={m}
              weekday={day.weekday}
              time={item ? fmt12(item.time) : undefined}
              restDay={day.session.type !== "fuerza"}
              eaten={Boolean(item && checks[item.id])}
              onToggle={() => item && toggleItem(sel, item, m)}
            />
          );
        })}
      </div>

      <Card className="mt-4 flex items-start gap-3 text-sm text-muted">
        <UtensilsCrossed className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" />
        <p>
          Agua: mínimo 8–10 vasos al día. Café sin azúcar está bien. Si un día comes fuera, regístralo en <Link href="/registro" className="text-accent-text">Registro → Comí fuera</Link> y
          sigue con normalidad en la próxima comida.
        </p>
      </Card>
    </div>
  );
}

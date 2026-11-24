"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, RotateCcw, Share2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { useTargets } from "@/lib/hooks";
import { menuForDay, shoppingList, formatBuyQty, type PlannedMeal } from "@/lib/nutrition";
import { PageHeader, Card, Button, Sheet, Badge, cx, inputCls } from "@/components/ui";
import type { Food } from "@/data/foods";

export default function Compras() {
  const profile = useApp((s) => s.profile);
  const swaps = useApp((s) => s.menuSwaps);
  const prices = useApp((s) => s.prices);
  const checked = useApp((s) => s.shoppingChecked);
  const toggle = useApp((s) => s.toggleShopping);
  const clear = useApp((s) => s.clearShopping);
  const setPrice = useApp((s) => s.setPrice);
  const t = useTargets();
  const [edit, setEdit] = useState<Food | null>(null);
  const [price, setPriceStr] = useState("");

  const items = useMemo(() => {
    const meals: PlannedMeal[] = [];
    for (let d = 0; d < 7; d++) meals.push(...menuForDay(d, swaps[d], profile, t.kcal));
    return shoppingList(meals, profile.pantry, prices);
  }, [profile, swaps, prices, t.kcal]);

  const total = items.reduce((a, i) => a + i.cost, 0);
  const over = total > profile.budgetWeekly;
  const aisles = [...new Set(items.map((i) => i.food.aisle))];

  const share = async () => {
    const text =
      "🛒 Lista de compras (Journey)\n\n" +
      aisles
        .map(
          (a) =>
            `${a}:\n` +
            items
              .filter((i) => i.food.aisle === a && !i.inPantry)
              .map((i) => `• ${i.food.buyName} — ${formatBuyQty(i)}`)
              .join("\n"),
        )
        .join("\n\n") +
      `\n\nTotal estimado: RD$${total.toLocaleString("es-DO")}`;
    if (navigator.share) await navigator.share({ text }).catch(() => {});
    else await navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <PageHeader
        title="Lista de compras"
        subtitle="Para toda la semana según tu menú"
        back="/nutricion"
        right={
          <button onClick={share} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2" aria-label="Compartir lista">
            <Share2 className="h-5 w-5" />
          </button>
        }
      />
      <Card className={cx(over && "border-warn/50")}>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-muted">Total estimado</div>
            <div className="text-3xl font-bold">RD${total.toLocaleString("es-DO")}</div>
          </div>
          <Badge tone={over ? "warn" : "good"}>
            Presupuesto RD${profile.budgetWeekly.toLocaleString("es-DO")}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted">
          {over
            ? "Te pasas del presupuesto. Cambia alguna cena por una con habichuelas, lentejas o huevo, o usa muslo en vez de pechuga."
            : "Precios estimados de Santo Domingo. Toca el lápiz para poner el precio real de tu súper o colmado."}
        </p>
      </Card>

      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="ghost" onClick={clear}>
          <RotateCcw className="h-4 w-4" /> Desmarcar todo
        </Button>
      </div>

      {aisles.map((a) => (
        <div key={a} className="mt-2">
          <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wider text-muted">{a}</h3>
          <Card className="divide-y divide-line !p-0">
            {items
              .filter((i) => i.food.aisle === a)
              .map((i) => {
                const on = checked[i.food.id] || i.inPantry;
                return (
                  <div key={i.food.id} className={cx("flex items-center gap-3 px-3 py-2.5", on && "opacity-50")}>
                    <button
                      onClick={() => !i.inPantry && toggle(i.food.id)}
                      className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2", on ? "border-transparent grad text-accent-ink" : "border-line")}
                      aria-label="Marcar comprado"
                    >
                      {on && <Check className="h-4 w-4" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={cx("text-sm font-medium", on && "line-through")}>{i.food.buyName}</div>
                      <div className="text-xs text-muted">
                        {i.inPantry ? "Ya lo tienes en casa" : formatBuyQty(i)}
                        {!i.inPantry && ` · RD$${(prices[i.food.id] ?? i.food.price).toLocaleString("es-DO")}/${i.food.buyUnit}`}
                      </div>
                    </div>
                    {!i.inPantry && <span className="text-sm font-semibold tabular-nums">RD${i.cost}</span>}
                    {!i.inPantry && (
                      <button
                        onClick={() => {
                          setEdit(i.food);
                          setPriceStr(String(prices[i.food.id] ?? i.food.price));
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full text-muted"
                        aria-label="Editar precio"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
          </Card>
        </div>
      ))}

      <Sheet open={Boolean(edit)} onClose={() => setEdit(null)} title={edit ? `Precio: ${edit.buyName}` : ""}>
        {edit && (
          <div className="space-y-3">
            <label className="block text-sm">
              RD$ por {edit.buyUnit}
              <input className={inputCls} type="number" inputMode="decimal" value={price} onChange={(e) => setPriceStr(e.target.value)} autoFocus />
            </label>
            <Button
              className="w-full"
              onClick={() => {
                const n = Number(price);
                if (n > 0) setPrice(edit.id, n);
                setEdit(null);
              }}
            >
              Guardar
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setPrice(edit.id, null);
                setEdit(null);
              }}
            >
              Usar precio estimado (RD${edit.price})
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { addDays, dateKey, fmtDate, weekStart } from "@/lib/date";
import { PageHeader, Card, Button, Bar, SectionTitle, Field, inputCls } from "@/components/ui";

export default function Gastos() {
  const spending = useApp((s) => s.spending);
  const add = useApp((s) => s.addSpending);
  const remove = useApp((s) => s.removeSpending);
  const budget = useApp((s) => s.profile.budgetWeekly);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const ws = weekStart(dateKey());
  const we = addDays(ws, 6);
  const week = spending.filter((x) => x.date >= ws && x.date <= we);
  const total = week.reduce((a, x) => a + x.amount, 0);

  return (
    <div>
      <PageHeader title="Gasto en comida" subtitle={`Semana del ${fmtDate(ws, false)}`} back="/mas" />
      <Card>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-muted">Esta semana</div>
            <div className="text-3xl font-bold">RD${total.toLocaleString("es-DO")}</div>
          </div>
          <div className="text-right text-sm text-muted">de RD${budget.toLocaleString("es-DO")}</div>
        </div>
        <div className="mt-3">
          <Bar value={total / budget} tone={total > budget ? "warn" : "accent"} />
        </div>
        <p className="mt-2 text-xs text-muted">
          {total > budget ? `Te pasaste RD$${(total - budget).toLocaleString("es-DO")}.` : `Te quedan RD$${(budget - total).toLocaleString("es-DO")}.`}
        </p>
      </Card>

      <SectionTitle>Añadir gasto</SectionTitle>
      <Card className="space-y-3">
        <div className="grid grid-cols-[1fr_1.5fr] gap-2">
          <Field label="Monto (RD$)">
            <input className={inputCls} type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Dónde / qué">
            <input className={inputCls} placeholder="Súper, colmado…" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
        <Button
          className="w-full"
          disabled={!Number(amount)}
          onClick={() => {
            add({ date: dateKey(), amount: Number(amount), note });
            setAmount("");
            setNote("");
          }}
        >
          <Plus className="h-4 w-4" /> Guardar
        </Button>
      </Card>

      <SectionTitle>Historial</SectionTitle>
      {spending.length === 0 ? (
        <Card className="text-sm text-muted">Anota lo que gastas en comida para compararlo con tu presupuesto.</Card>
      ) : (
        <Card className="divide-y divide-line !py-1">
          {[...spending].reverse().slice(0, 30).map((x) => (
            <div key={x.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-20 text-muted">{fmtDate(x.date, false)}</span>
              <span className="flex-1 truncate">{x.note || "Comida"}</span>
              <b>RD${x.amount.toLocaleString("es-DO")}</b>
              <button onClick={() => remove(x.id)} className="text-muted" aria-label="Eliminar">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

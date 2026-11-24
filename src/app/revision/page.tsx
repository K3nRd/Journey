"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useApp } from "@/lib/store";
import { completionFor, useCurrentWeight, useTargets } from "@/lib/hooks";
import { addDays, dateKey, fmtDate, weekStart } from "@/lib/date";
import { avg, weeklyRate, calorieAdvice } from "@/lib/progress";
import { toggleItem } from "@/lib/actions";
import { PageHeader, Card, Button, Field, SectionTitle, Bar, inputCls } from "@/components/ui";

export default function Revision() {
  const s = useApp();
  const t = useTargets();
  const { series } = useCurrentWeight();
  // La revisión del domingo cubre la semana que termina hoy (lunes a domingo)
  const ws = weekStart(dateKey());
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const existing = s.reviews.find((r) => r.weekStart === ws);
  const [good, setGood] = useState(existing?.good ?? "");
  const [bad, setBad] = useState(existing?.bad ?? "");
  const [change, setChange] = useState(existing?.change ?? "");
  const [saved, setSaved] = useState(false);

  const sum = useMemo(() => {
    const comp = days.filter((d) => d <= dateKey()).map((d) => completionFor(s.checks, s.profile, s.overrides, d));
    const wk = s.workouts.filter((w) => w.finishedAt && days.includes(w.date)).length;
    const expected = days.filter((d) => s.profile.gymDays.includes(new Date(d + "T12:00").getDay())).length;
    const ww = s.weights.filter((w) => days.includes(w.date));
    const waist = s.waists.filter((w) => days.includes(w.date)).at(-1);
    const water = avg(days.map((d) => s.metrics[d]?.water).filter((x): x is number => !!x));
    const spent = s.spending.filter((x) => days.includes(x.date)).reduce((a, x) => a + x.amount, 0);
    return { adherence: avg(comp) ?? 0, wk, expected, ww, waist, water, spent };
  }, [s, days]);

  const advice = calorieAdvice(weeklyRate(series));

  return (
    <div>
      <PageHeader title="Revisión semanal" subtitle={`Semana del ${fmtDate(ws, false)}`} back="/progreso" />
      <Card className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Checklist cumplido</span>
            <b>{Math.round(sum.adherence * 100)}%</b>
          </div>
          <Bar value={sum.adherence} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-surface-2 p-2.5">
            <div className="text-xs text-muted">Entrenamientos</div>
            <b>
              {sum.wk} de {sum.expected}
            </b>
          </div>
          <div className="rounded-xl bg-surface-2 p-2.5">
            <div className="text-xs text-muted">Pesajes</div>
            <b>{sum.ww.length ? sum.ww.map((w) => w.value).join(" · ") : "—"}</b>
          </div>
          <div className="rounded-xl bg-surface-2 p-2.5">
            <div className="text-xs text-muted">Cintura</div>
            <b>{sum.waist ? `${sum.waist.value}"` : "—"}</b>
          </div>
          <div className="rounded-xl bg-surface-2 p-2.5">
            <div className="text-xs text-muted">Gasto comida</div>
            <b>{sum.spent ? `RD$${sum.spent.toLocaleString("es-DO")}` : "—"}</b>
          </div>
        </div>
        {advice && <p className="rounded-xl bg-accent-soft p-3 text-sm">{advice.message}</p>}
        <p className="text-xs text-muted">Meta actual: {t.kcal.toLocaleString("es-DO")} kcal. Puedes ajustarla en Progreso.</p>
      </Card>

      <SectionTitle>Tus 3 preguntas</SectionTitle>
      <div className="space-y-3">
        <Field label="✅ ¿Qué salió bien esta semana?">
          <textarea className={`${inputCls} h-20 py-2`} value={good} onChange={(e) => setGood(e.target.value)} />
        </Field>
        <Field label="⚠️ ¿Qué te costó o fallaste?">
          <textarea className={`${inputCls} h-20 py-2`} value={bad} onChange={(e) => setBad(e.target.value)} />
        </Field>
        <Field label="🎯 ¿Qué vas a cambiar la próxima semana?" hint="Una sola cosa concreta. Ej.: «dejar la merienda lista la noche antes».">
          <textarea className={`${inputCls} h-20 py-2`} value={change} onChange={(e) => setChange(e.target.value)} />
        </Field>
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            s.addReview({ weekStart: ws, good, bad, change });
            toggleItem(dateKey(), { id: "revision" }, undefined, true);
            setSaved(true);
          }}
        >
          <Check className="h-5 w-5" /> {saved ? "¡Guardada!" : "Guardar revisión"}
        </Button>
      </div>

      {s.reviews.length > 0 && (
        <>
          <SectionTitle>Revisiones anteriores</SectionTitle>
          <div className="space-y-2">
            {[...s.reviews].reverse().map((r) => (
              <Card key={r.weekStart} className="space-y-1 text-sm">
                <div className="font-semibold">Semana del {fmtDate(r.weekStart, false)}</div>
                {r.good && <p>✅ {r.good}</p>}
                {r.bad && <p>⚠️ {r.bad}</p>}
                {r.change && <p className="text-accent-text">🎯 {r.change}</p>}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

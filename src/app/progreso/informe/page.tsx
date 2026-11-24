"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { completionFor } from "@/lib/hooks";
import { addDays, dateKey, fmtDate } from "@/lib/date";
import { trend, avg, lastNDays } from "@/lib/progress";
import { prsIn, volume } from "@/lib/workout";
import { getExercise } from "@/data/exercises";
import { PageHeader, Card, Segmented, SectionTitle, Bar } from "@/components/ui";

export default function Informe() {
  const s = useApp();
  const [range, setRange] = useState<7 | 30>(30);
  const r = useMemo(() => {
    const end = dateKey();
    const start = addDays(end, -(range - 1));
    const days = lastNDays(range);
    const inR = (d: string) => d >= start && d <= end;
    const tw = trend(s.weights);
    const before = [...tw].filter((x) => x.date < start).at(-1) ?? tw.find((x) => inR(x.date));
    const after = [...tw].filter((x) => inR(x.date)).at(-1);
    const ws = s.waists.filter((x) => inR(x.date));
    const waistBefore = [...s.waists].filter((x) => x.date < start).at(-1) ?? ws[0];
    const waistAfter = ws.at(-1);
    const wk = s.workouts.filter((w) => w.finishedAt && inR(w.date));
    const done: typeof s.workouts = s.workouts.filter((w) => w.finishedAt && w.date < start);
    const prs: { exId: string; weight: number; reps: number; date: string }[] = [];
    for (const w of [...wk].sort((a, b) => a.startedAt - b.startedAt)) {
      prs.push(...prsIn(done, w).map((p) => ({ ...p, date: w.date })));
      done.push(w);
    }
    const comp = days.map((d) => completionFor(s.checks, s.profile, s.overrides, d));
    const m = days.map((d) => s.metrics[d]).filter(Boolean);
    const sleepH = m
      .filter((x) => x!.sleepBed && x!.sleepWake)
      .map((x) => {
        const [bh, bm] = x!.sleepBed!.split(":").map(Number);
        const [wh, wm] = x!.sleepWake!.split(":").map(Number);
        let mins = wh * 60 + wm - (bh * 60 + bm);
        if (mins <= 0) mins += 1440;
        return mins / 60;
      });
    const kcal = days.map((d) => (s.foodLog[d] ?? []).reduce((a, e) => a + e.kcal, 0)).filter((k) => k > 0);
    const prot = days.map((d) => (s.foodLog[d] ?? []).reduce((a, e) => a + e.protein, 0)).filter((k) => k > 0);
    const spent = s.spending.filter((x) => inR(x.date)).reduce((a, x) => a + x.amount, 0);
    return {
      start,
      end,
      weightChange: before && after ? after.value - before.value : null,
      waistChange: waistBefore && waistAfter ? waistAfter.value - waistBefore.value : null,
      workouts: wk.length,
      expected: days.filter((d) => s.profile.gymDays.includes(new Date(d + "T12:00").getDay())).length,
      volume: wk.reduce((a, w) => a + volume(w), 0),
      prs,
      adherence: avg(comp) ?? 0,
      sleep: avg(sleepH),
      energy: avg(m.map((x) => x!.energy).filter((x): x is number => !!x)),
      mood: avg(m.map((x) => x!.mood).filter((x): x is number => !!x)),
      kcal: avg(kcal),
      prot: avg(prot),
      steps: avg(m.map((x) => x!.steps).filter((x): x is number => !!x)),
      water: avg(m.map((x) => x!.water).filter((x): x is number => !!x)),
      spent,
    };
  }, [s, range]);

  const fmt = (n: number | null, suf: string, dec = 1) => (n === null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(dec)} ${suf}`);

  return (
    <div>
      <PageHeader title="Informe" subtitle={`${fmtDate(r.start, false)} – ${fmtDate(r.end, false)}`} back="/progreso" />
      <Segmented value={range} onChange={setRange} options={[{ value: 7, label: "7 días" }, { value: 30, label: "30 días" }]} />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card className="!p-3">
          <div className="text-xs text-muted">Peso (tendencia)</div>
          <div className={`text-2xl font-bold ${r.weightChange !== null && r.weightChange < 0 ? "text-good" : ""}`}>{fmt(r.weightChange, "lb")}</div>
        </Card>
        <Card className="!p-3">
          <div className="text-xs text-muted">Cintura</div>
          <div className={`text-2xl font-bold ${r.waistChange !== null && r.waistChange < 0 ? "text-good" : ""}`}>{fmt(r.waistChange, "pulg", 2)}</div>
        </Card>
        <Card className="!p-3">
          <div className="text-xs text-muted">Entrenamientos</div>
          <div className="text-2xl font-bold">
            {r.workouts}
            <span className="text-sm font-normal text-muted">/{r.expected}</span>
          </div>
        </Card>
        <Card className="!p-3">
          <div className="text-xs text-muted">Récords</div>
          <div className="text-2xl font-bold text-warn">{r.prs.length}</div>
        </Card>
      </div>

      <SectionTitle>Hábitos</SectionTitle>
      <Card className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>Cumplimiento del checklist</span>
            <b>{Math.round(r.adherence * 100)}%</b>
          </div>
          <Bar value={r.adherence} />
        </div>
        <Row label="Sueño promedio" value={r.sleep ? `${r.sleep.toFixed(1)} h` : "—"} ok={r.sleep !== null && r.sleep >= 7} />
        <Row label="Energía promedio" value={r.energy ? `${r.energy.toFixed(1)} / 5` : "—"} />
        <Row label="Ánimo promedio" value={r.mood ? `${r.mood.toFixed(1)} / 5` : "—"} />
        <Row label="Pasos promedio" value={r.steps ? Math.round(r.steps).toLocaleString("es-DO") : "—"} ok={r.steps !== null && r.steps >= s.profile.stepsGoal} />
        <Row label="Agua promedio" value={r.water ? `${r.water.toFixed(1)} vasos` : "—"} ok={r.water !== null && r.water >= s.profile.waterGoalGlasses} />
      </Card>

      <SectionTitle>Nutrición</SectionTitle>
      <Card className="space-y-3">
        <Row label="Calorías registradas (prom.)" value={r.kcal ? `${Math.round(r.kcal).toLocaleString("es-DO")} kcal` : "—"} />
        <Row label="Proteína registrada (prom.)" value={r.prot ? `${Math.round(r.prot)} g` : "—"} />
        <Row label="Gasto en comida" value={r.spent ? `RD$${r.spent.toLocaleString("es-DO")}` : "—"} />
      </Card>

      <SectionTitle>Fuerza</SectionTitle>
      <Card>
        <Row label="Volumen total" value={`${Math.round(r.volume).toLocaleString("es-DO")} lb`} />
        {r.prs.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            {r.prs.slice(-8).map((p, i) => (
              <div key={i} className="flex justify-between">
                <span>🏆 {getExercise(p.exId).name}</span>
                <span className="text-muted">
                  {p.weight}×{p.reps}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={ok ? "font-semibold text-good" : "font-semibold"}>{value}</span>
    </div>
  );
}

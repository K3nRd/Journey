"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine, Scatter } from "recharts";
import { Camera, FileBarChart, Plus, Trash2, ClipboardCheck, TrendingDown, Target } from "lucide-react";
import { useApp } from "@/lib/store";
import { useCurrentWeight, useTargets, completionFor } from "@/lib/hooks";
import { dateKey, fmtDate, daysBetween } from "@/lib/date";
import { weeklyRate, projection, calorieAdvice, achievements, streak, trend as trendOf } from "@/lib/progress";
import { prsIn } from "@/lib/workout";
import { toggleItem } from "@/lib/actions";
import { PageHeader, Card, Button, Sheet, SectionTitle, Badge, Segmented, inputCls, cx } from "@/components/ui";

export default function Progreso() {
  const p = useApp((s) => s.profile);
  const weights = useApp((s) => s.weights);
  const waists = useApp((s) => s.waists);
  const workouts = useApp((s) => s.workouts);
  const reviews = useApp((s) => s.reviews);
  const photos = useApp((s) => s.photos);
  const checks = useApp((s) => s.checks);
  const overrides = useApp((s) => s.overrides);
  const calorieHistory = useApp((s) => s.calorieHistory);
  const setCalorieTarget = useApp((s) => s.setCalorieTarget);
  const { trend, series } = useCurrentWeight();
  const t = useTargets();
  const [add, setAdd] = useState<"peso" | "cintura" | null>(null);
  const [chart, setChart] = useState<"peso" | "cintura">("peso");

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("registrar");
    if (r === "peso" || r === "cintura") setAdd(r);
  }, []);

  const rate = weeklyRate(series);
  const proj = projection(trend, p.goalWeightLb, rate);
  const lastAdjust = calorieHistory.at(-1)?.date ?? p.startDate;
  const canAdjust = daysBetween(lastAdjust, dateKey()) >= 14 && daysBetween(p.startDate, dateKey()) >= 14;
  const goal = p.goal ?? "perder";
  const advice = calorieAdvice(rate, goal, trend);
  const change = trend - p.startWeightLb;
  const span = p.goalWeightLb - p.startWeightLb;
  const pct = Math.abs(span) < 1 ? (Math.abs(change) <= 2 ? 1 : 0.5) : Math.max(0, Math.min(1, change / span));
  const onTrack = goal === "ganar" ? change >= 0 : goal === "perder" ? change <= 0 : Math.abs(change) <= 2;

  const finished = workouts.filter((w) => w.finishedAt);
  const prCount = useMemo(() => {
    let n = 0;
    const done: typeof finished = [];
    for (const w of [...finished].sort((a, b) => a.startedAt - b.startedAt)) {
      n += prsIn(done, w).length;
      done.push(w);
    }
    return n;
  }, [finished]);
  const strk = useMemo(() => streak((k) => completionFor(checks, p, overrides, k)), [checks, p, overrides]);
  const ach = achievements({
    goal,
    startWeight: p.startWeightLb,
    currentTrend: weights.length ? trend : null,
    goalWeight: p.goalWeightLb,
    workouts: finished.length,
    startWaist: waists[0]?.value ?? p.startWaistIn,
    currentWaist: waists.at(-1)?.value,
    streak: strk,
    reviews: reviews.length,
    photos: photos.length,
    prs: prCount,
  });
  const unlocked = ach.filter((a) => a.done).length;

  const data = useMemo(() => {
    if (chart === "peso") {
      const map = new Map(series.map((s) => [s.date, s.value]));
      return [...weights].sort((a, b) => a.date.localeCompare(b.date)).map((w) => ({ date: w.date, real: w.value, tendencia: map.get(w.date) }));
    }
    const tw = trendOf(waists, 0.5);
    return waists.map((w, i) => ({ date: w.date, real: w.value, tendencia: tw[i]?.value }));
  }, [chart, weights, waists, series]);

  return (
    <div>
      <PageHeader title="Progreso" subtitle={`Semana ${Math.floor(daysBetween(p.startDate, dateKey()) / 7) + 1}`} />

      <Card>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-muted">Peso (tendencia)</div>
            <div className="text-4xl font-bold">{trend.toFixed(1)}<span className="text-base font-normal text-muted"> lb</span></div>
          </div>
          <div className="text-right">
            <div className={cx("text-lg font-bold", onTrack ? "text-good" : "text-warn")}>
              {change > 0 ? "+" : change < 0 ? "−" : ""}
              {Math.abs(change).toFixed(1)} lb
            </div>
            <div className="text-xs text-muted">desde {p.startWeightLb} lb</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>{p.startWeightLb}</span>
            <span>{goal === "mantener" ? (Math.abs(change) <= 2 ? "En tu rango (±2 lb)" : "Fuera de tu rango") : `${Math.round(pct * 100)}% de la meta`}</span>
            <span>{p.goalWeightLb}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-surface-2 p-2.5">
            <div className="flex items-center gap-1 text-xs text-muted">
              <TrendingDown className="h-3.5 w-3.5" /> Ritmo
            </div>
            <div className="font-semibold">{rate === null ? "Faltan datos" : `${rate > 0 ? "+" : ""}${rate.toFixed(2)} lb/sem`}</div>
          </div>
          <div className="rounded-xl bg-surface-2 p-2.5">
            <div className="flex items-center gap-1 text-xs text-muted">
              <Target className="h-3.5 w-3.5" /> Llegas a {p.goalWeightLb}
            </div>
            <div className="font-semibold">{proj ? fmtDate(proj, false) + " " + proj.slice(0, 4) : "—"}</div>
          </div>
        </div>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => setAdd("peso")}>
          <Plus className="h-4 w-4" /> Peso
        </Button>
        <Button variant="secondary" onClick={() => setAdd("cintura")}>
          <Plus className="h-4 w-4" /> Cintura
        </Button>
      </div>

      <Card className="mt-3 !p-3">
        <Segmented value={chart} onChange={setChart} options={[{ value: "peso", label: "Peso" }, { value: "cintura", label: "Cintura" }]} />
        {data.length < 2 ? (
          <p className="py-10 text-center text-sm text-muted">Registra al menos 2 medidas para ver la gráfica.</p>
        ) : (
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d) => fmtDate(d, false)} tick={{ fontSize: 11, fill: "var(--muted)" }} minTickGap={24} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11, fill: "var(--muted)" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} labelFormatter={(d) => fmtDate(String(d))} />
                {chart === "peso" && <ReferenceLine y={p.goalWeightLb} stroke="var(--good)" strokeDasharray="4 4" />}
                <Area type="monotone" dataKey="tendencia" stroke="var(--accent)" fill="var(--accent-soft)" strokeWidth={2.5} name="Tendencia" />
                <Scatter dataKey="real" fill="var(--muted)" name="Medida" />
                <Line type="monotone" dataKey="real" stroke="transparent" dot={{ r: 2.5, fill: "var(--muted)" }} name="Real" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="mt-1 text-[11px] text-muted">
          {chart === "peso"
            ? "La línea verde es tu tendencia: ignora los cambios diarios por agua y sal. Fíjate en ella, no en un solo día."
            : "Mide siempre a la altura del ombligo, relajado, el mismo día de la semana."}
        </p>
      </Card>

      {/* Ajuste de calorías */}
      <SectionTitle>Calorías</SectionTitle>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">Meta actual</div>
            <div className="text-2xl font-bold">{t.kcal.toLocaleString("es-DO")} kcal</div>
          </div>
          <Badge>Gasto estimado {t.tdee.toLocaleString("es-DO")}</Badge>
        </div>
        {advice ? (
          <div className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
            <p>{advice.message}</p>
            {advice.delta !== 0 &&
              (canAdjust ? (
                <Button size="sm" className="mt-2" onClick={() => setCalorieTarget(t.kcal + advice.delta, advice.message)}>
                  Aplicar: {t.kcal + advice.delta} kcal
                </Button>
              ) : (
                <p className="mt-1 text-xs text-muted">Se puede ajustar cada 2 semanas para no cambiar por ruido.</p>
              ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Con 2–3 semanas de pesajes, la app te dirá si conviene ajustar.</p>
        )}
        {p.calorieTarget && (
          <button className="mt-2 text-xs text-muted underline" onClick={() => setCalorieTarget(undefined, "Restablecida")}>
            Volver a la meta calculada ({t.suggestedKcal} kcal)
          </button>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Link href="/progreso/fotos" className="card flex flex-col items-center gap-1 !p-3 text-center">
          <Camera className="h-5 w-5 text-accent-text" />
          <span className="text-xs font-medium">Fotos</span>
        </Link>
        <Link href="/revision" className="card flex flex-col items-center gap-1 !p-3 text-center">
          <ClipboardCheck className="h-5 w-5 text-accent-text" />
          <span className="text-xs font-medium">Revisión</span>
        </Link>
        <Link href="/progreso/informe" className="card flex flex-col items-center gap-1 !p-3 text-center">
          <FileBarChart className="h-5 w-5 text-accent-text" />
          <span className="text-xs font-medium">Informe</span>
        </Link>
      </div>

      <SectionTitle action={<span className="text-xs text-muted">{unlocked}/{ach.length}</span>}>Logros</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {ach.map((a) => (
          <div key={a.id} className={cx("card flex flex-col items-center !p-2.5 text-center", !a.done && "opacity-35 grayscale")} title={a.desc}>
            <span className="text-2xl">{a.emoji}</span>
            <span className="mt-1 text-[11px] font-semibold leading-tight">{a.title}</span>
          </div>
        ))}
      </div>

      <SectionTitle>Registros</SectionTitle>
      <EntriesList />

      <AddEntry kind={add} onClose={() => setAdd(null)} />
    </div>
  );
}

function EntriesList() {
  const weights = useApp((s) => s.weights);
  const waists = useApp((s) => s.waists);
  const removeWeight = useApp((s) => s.removeWeight);
  const removeWaist = useApp((s) => s.removeWaist);
  const rows = [
    ...weights.map((w) => ({ ...w, kind: "peso" as const })),
    ...waists.map((w) => ({ ...w, kind: "cintura" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  if (!rows.length) return <Card className="text-sm text-muted">Sin registros todavía.</Card>;
  return (
    <Card className="divide-y divide-line !py-1">
      {rows.slice(0, 20).map((r) => (
        <div key={r.kind + r.date} className="flex items-center gap-3 py-2 text-sm">
          <span className="w-24 text-muted">{fmtDate(r.date, false)}</span>
          <span className="flex-1">{r.kind === "peso" ? `${r.value} lb` : `${r.value}" cintura`}</span>
          <button onClick={() => (r.kind === "peso" ? removeWeight(r.date) : removeWaist(r.date))} className="text-muted" aria-label="Eliminar">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </Card>
  );
}

function AddEntry({ kind, onClose }: { kind: "peso" | "cintura" | null; onClose: () => void }) {
  const addWeight = useApp((s) => s.addWeight);
  const addWaist = useApp((s) => s.addWaist);
  const { last } = useCurrentWeight();
  const lastWaist = useApp((s) => s.waists.at(-1)?.value ?? s.profile.startWaistIn);
  const [v, setV] = useState("");
  const [date, setDate] = useState(dateKey());
  useEffect(() => {
    if (kind) setV(String(kind === "peso" ? last : lastWaist ?? ""));
  }, [kind, last, lastWaist]);
  return (
    <Sheet open={Boolean(kind)} onClose={onClose} title={kind === "peso" ? "Registrar peso" : "Registrar cintura"}>
      <div className="space-y-3">
        <div className="relative">
          <input className={inputCls} type="number" inputMode="decimal" step="0.1" value={v} onChange={(e) => setV(e.target.value)} autoFocus />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">{kind === "peso" ? "lb" : "pulg"}</span>
        </div>
        <input className={inputCls} type="date" value={date} max={dateKey()} onChange={(e) => setDate(e.target.value)} />
        <p className="text-xs text-muted">
          {kind === "peso" ? "En ayunas, después de ir al baño, con poca ropa." : "Cinta a la altura del ombligo, sin apretar, al final de una exhalación normal."}
        </p>
        <Button
          className="w-full"
          onClick={() => {
            const n = Number(v);
            if (n > 0) {
              if (kind === "peso") {
                addWeight(date, n);
                toggleItem(date, { id: "pesaje" }, undefined, true);
              } else {
                addWaist(date, n);
                toggleItem(date, { id: "cintura" }, undefined, true);
              }
            }
            onClose();
          }}
        >
          Guardar
        </Button>
      </div>
    </Sheet>
  );
}

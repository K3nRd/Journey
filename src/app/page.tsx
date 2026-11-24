"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronRight, Droplets, Footprints, Minus, Plus, Play, Scale, Zap, Clock } from "lucide-react";
import { EMPTY_OBJ, EMPTY_ARR, useApp } from "@/lib/store";
import { useDay, useNow, useTargets, useCurrentWeight, completionFor } from "@/lib/hooks";
import { fmt12, fmtDate, toMin, nowMin, fmtDuration, DAY_NAMES } from "@/lib/date";
import { Card, Ring, SectionTitle, Badge, Bar, Sheet, Button, cx, inputCls } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { MealCard } from "@/components/MealCard";
import { ExercisePreview } from "@/components/ExercisePreview";
import { getExercise } from "@/data/exercises";
import { PHASE_INFO, sessionExercises } from "@/lib/workout";
import { toggleItem } from "@/lib/actions";
import { streak } from "@/lib/progress";
import { InstallBanner } from "@/components/InstallBanner";
import type { TimelineItem } from "@/lib/types";

export default function Dashboard() {
  const now = useNow(30000);
  const day = useDay();
  const profile = useApp((s) => s.profile);
  const checks = useApp((s) => s.checks);
  const overrides = useApp((s) => s.overrides);
  const metrics = useApp((s) => s.metrics[day.key] ?? EMPTY_OBJ);
  const setMetric = useApp((s) => s.setMetric);
  const t = useTargets();
  const dayChecks = checks[day.key] ?? EMPTY_OBJ;
  const checkable = day.timeline.filter((i) => i.checkable);
  const done = checkable.filter((i) => dayChecks[i.id]).length;
  const pct = checkable.length ? done / checkable.length : 0;
  const nm = nowMin(now);

  const strk = useMemo(
    () => streak((k) => completionFor(checks, profile, overrides, k)),
    [checks, profile, overrides],
  );

  // Bloque actual y siguiente
  const { current, next } = useMemo(() => {
    const wake = toMin(profile.wakeTime);
    const norm = (t: string) => {
      const m = toMin(t);
      return m < wake - 120 ? m + 1440 : m;
    };
    const n = nm < wake - 120 ? nm + 1440 : nm;
    let current: TimelineItem | undefined;
    let next: TimelineItem | undefined;
    for (const it of day.timeline) {
      const start = norm(it.time);
      const end = it.end ? norm(it.end) : start + 30;
      if (start <= n && n < end && (it.kind === "gym" || it.kind === "work" || it.kind === "cardio")) current = it;
      if (start > n && !next && !(dayChecks[it.id] && it.checkable)) next = it;
    }
    if (!current) {
      // lo último que empezó y sigue pendiente (máx 90 min)
      const pending = day.timeline.filter((it) => it.checkable && !dayChecks[it.id] && norm(it.time) <= n && n - norm(it.time) < 90);
      current = pending.at(-1);
    }
    return { current, next, nNorm: n, norm };
  }, [day.timeline, nm, profile.wakeTime, dayChecks]);

  const hour = now.getHours();
  const greet = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const phase = PHASE_INFO[day.phase];
  const eaten = useApp((s) => s.foodLog[day.key] ?? EMPTY_ARR);
  const eatenKcal = eaten.reduce((a, e) => a + e.kcal, 0);
  const eatenProt = eaten.reduce((a, e) => a + e.protein, 0);
  const isWeighDay = [1, 3, 5].includes(day.weekday) && profile.habits.pesaje;
  const weighedToday = useApp((s) => s.weights.some((w) => w.date === day.key));

  return (
    <div className="safe-top pt-4">
      <InstallBanner />
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{fmtDate(day.key)}</p>
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {greet}
            {profile.name ? `, ${profile.name.split(" ")[0]}` : ""}
          </h1>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge tone="accent">Semana {day.week}</Badge>
            {day.session.type === "fuerza" && <Badge tone={day.phase === "normal" ? "neutral" : "warn"}>{phase.label}</Badge>}
            {strk > 0 && <Badge tone="warn">🔥 {strk} {strk === 1 ? "día" : "días"}</Badge>}
          </div>
        </div>
        <Ring value={pct} size={68} stroke={7}>
          <span className="text-base">{Math.round(pct * 100)}%</span>
        </Ring>
      </div>

      {/* Ahora */}
      <NowCard current={current} next={next} nm={nm} dayKey={day.key} />

      {/* Rápidos */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card className="!p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Droplets className="h-4 w-4 text-info" /> Agua
          </div>
          <div className="mt-1 flex items-center justify-between">
            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-surface-2"
              onClick={() => setMetric(day.key, { water: Math.max(0, (metrics.water ?? 0) - 1) })}
              aria-label="Quitar vaso"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="text-center">
              <span className="text-xl font-bold">{metrics.water ?? 0}</span>
              <span className="text-sm text-muted">/{profile.waterGoalGlasses}</span>
            </div>
            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-info/20 text-info"
              onClick={() => setMetric(day.key, { water: (metrics.water ?? 0) + 1 })}
              aria-label="Añadir vaso"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2">
            <Bar value={(metrics.water ?? 0) / profile.waterGoalGlasses} tone="info" />
          </div>
        </Card>
        <Link href="/registro" className="card block !p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Zap className="h-4 w-4 text-warn" /> Comido hoy
          </div>
          <div className="mt-1 text-xl font-bold">
            {eatenKcal.toLocaleString("es-DO")}
            <span className="text-sm font-normal text-muted"> / {t.kcal.toLocaleString("es-DO")}</span>
          </div>
          <div className="text-xs text-muted">
            <span className="text-accent">{eatenProt} g</span> de {t.protein} g proteína
          </div>
          <div className="mt-2">
            <Bar value={eatenKcal / t.kcal} tone="warn" />
          </div>
        </Link>
      </div>

      {isWeighDay && !weighedToday && <WeighCard dayKey={day.key} />}

      {/* Línea de tiempo */}
      <SectionTitle action={<span className="text-xs text-muted">{done}/{checkable.length} completado</span>}>Tu rutina de hoy</SectionTitle>
      <Timeline items={day.timeline} nm={nm} dayKey={day.key} wake={profile.wakeTime} />

      {/* Comida */}
      <SectionTitle action={<Link href="/nutricion" className="text-sm text-accent">Ver semana</Link>}>Tu comida de hoy</SectionTitle>
      <Card className="mb-3 !p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Plan del día</span>
          <span>
            <b>{Math.round(day.menu.reduce((a, m) => a + m.macros.kcal, 0)).toLocaleString("es-DO")}</b> kcal ·{" "}
            <b className="text-accent">{Math.round(day.menu.reduce((a, m) => a + m.macros.protein, 0))} g</b> proteína
          </span>
        </div>
      </Card>
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
              eaten={Boolean(item && dayChecks[item.id])}
              onToggle={() => item && toggleItem(day.key, item, m)}
            />
          );
        })}
      </div>

      {/* Entrenamiento */}
      <SectionTitle action={<Link href="/entreno" className="text-sm text-accent">Semana</Link>}>Entrenamiento de hoy</SectionTitle>
      <WorkoutCard day={day} />

      {/* Métricas rápidas */}
      <SectionTitle>Cómo te sientes</SectionTitle>
      <QuickMetrics dayKey={day.key} />
    </div>
  );
}

function NowCard({ current, next, nm, dayKey }: { current?: TimelineItem; next?: TimelineItem; nm: number; dayKey: string }) {
  const until = next ? (toMin(next.time) - nm + 1440) % 1440 : null;
  const focus = current ?? next;
  if (!focus) {
    return (
      <Card className="mt-4 border-accent/40 bg-accent-soft">
        <div className="text-sm font-semibold">✨ ¡Día completado!</div>
        <p className="text-sm text-muted">Descansa bien. Mañana seguimos.</p>
      </Card>
    );
  }
  const isNow = Boolean(current);
  return (
    <div className="card mt-4 overflow-hidden !p-0">
      <div className="flex items-center gap-3 p-4">
        <div className={cx("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", isNow ? "pulse-now bg-accent text-accent-ink" : "bg-surface-2 text-accent")}>
          <Icon name={focus.icon} className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            {isNow ? "Ahora" : `En ${fmtDuration(until ?? 0)}`} · {fmt12(focus.time)}
          </div>
          <div className="truncate font-semibold">{focus.title}</div>
          {focus.desc && <div className="truncate text-sm text-muted">{focus.desc}</div>}
        </div>
        {focus.checkable && (
          <button
            onClick={() => toggleItem(dayKey, focus)}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-line"
            aria-label="Marcar como hecho"
          >
            <Check className="h-5 w-5 text-muted" />
          </button>
        )}
      </div>
      {(focus.kind === "gym" || focus.kind === "cardio") && (
        <Link href="/entreno/hoy" className="flex items-center justify-center gap-2 bg-accent py-3 font-semibold text-accent-ink">
          <Play className="h-5 w-5" /> Empezar entrenamiento
        </Link>
      )}
      {current && next && current.id !== next.id && (
        <div className="flex items-center gap-2 border-t border-line px-4 py-2 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" /> Después: {next.title} · {fmt12(next.time)}
        </div>
      )}
    </div>
  );
}

function Timeline({ items, nm, dayKey, wake }: { items: TimelineItem[]; nm: number; dayKey: string; wake: string }) {
  const checks = useApp((s) => s.checks[dayKey] ?? EMPTY_OBJ);
  const w = toMin(wake);
  const norm = (m: number) => (m < w - 120 ? m + 1440 : m);
  const n = norm(nm);
  const nowIdx = items.findIndex((it) => norm(toMin(it.time)) > n);
  return (
    <div className="card !p-2">
      {items.map((it, idx) => {
        const start = norm(toMin(it.time));
        const end = it.end ? norm(toMin(it.end)) : start;
        const past = end < n && !(start <= n && n < end);
        const active = start <= n && n < (it.end ? end : start + 30);
        const done = checks[it.id];
        const showNow = idx === nowIdx;
        return (
          <div key={it.id}>
            {showNow && (
              <div className="flex items-center gap-2 px-2 py-1">
                <span className="text-[11px] font-bold text-accent">{fmt12(`${String(Math.floor(nm / 60)).padStart(2, "0")}:${String(nm % 60).padStart(2, "0")}`)}</span>
                <div className="h-0.5 flex-1 rounded bg-accent" />
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
            )}
            <div className={cx("flex items-center gap-3 rounded-xl px-2 py-2", active && "bg-accent-soft", past && !done && it.checkable && "opacity-60", done && "opacity-50")}>
              <div className="w-16 shrink-0 text-right text-xs tabular-nums text-muted">{fmt12(it.time)}</div>
              <div className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-lg", active ? "bg-accent text-accent-ink" : "bg-surface-2 text-accent")}>
                <Icon name={it.icon} className="h-4 w-4" />
              </div>
              {it.href ? (
                <Link href={it.href} className="min-w-0 flex-1">
                  <div className={cx("truncate text-sm font-medium", done && "line-through")}>{it.title}</div>
                  {it.end && <div className="text-xs text-muted">hasta {fmt12(it.end)}</div>}
                </Link>
              ) : (
                <div className="min-w-0 flex-1">
                  <div className={cx("truncate text-sm font-medium", done && "line-through")}>{it.title}</div>
                  {it.end && <div className="text-xs text-muted">hasta {fmt12(it.end)}</div>}
                </div>
              )}
              {it.checkable && !it.meal && (
                <button
                  onClick={() => toggleItem(dayKey, it)}
                  className={cx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition",
                    done ? "border-accent bg-accent text-accent-ink" : "border-line",
                  )}
                  aria-label={done ? "Desmarcar" : "Marcar como hecho"}
                >
                  {done && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
              )}
              {it.meal && (
                <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full border-2", done ? "border-accent bg-accent text-accent-ink" : "border-line border-dashed")}>
                  {done && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkoutCard({ day }: { day: ReturnType<typeof useDay> }) {
  const s = day.session;
  if (s.type === "descanso") {
    return (
      <Card className="text-center">
        <div className="text-3xl">😴</div>
        <div className="mt-1 font-semibold">Día de descanso</div>
        <p className="text-sm text-muted">El músculo crece cuando descansas. Camina suave y duerme bien.</p>
      </Card>
    );
  }
  const list = sessionExercises(s, day.phase, false);
  return (
    <div className="card overflow-hidden !p-0">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-lg font-bold">{s.title}</div>
            <div className="text-sm text-muted">{s.focus}</div>
          </div>
          <Badge tone={day.phase === "normal" ? "neutral" : "warn"}>{PHASE_INFO[day.phase].rir}</Badge>
        </div>
      </div>
      <div className="divide-y divide-line border-t border-line">
        {list.map((e, i) => {
          const ex = getExercise(e.exId);
          return (
            <Link key={e.exId} href={`/ejercicio/${e.exId}`} className="flex items-center gap-3 px-4 py-2.5 active:bg-surface-2">
              <ExercisePreview id={e.exId} size="sm" speed={1000 + i * 90} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold leading-snug">{ex.name}</div>
                <div className="text-xs text-muted">
                  {e.sets > 1 ? `${e.sets} series × ` : ""}
                  {e.reps}
                  {e.restSec ? ` · descanso ${e.restSec >= 60 ? `${Math.round((e.restSec / 60) * 10) / 10} min` : `${e.restSec} s`}` : ""}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          );
        })}
      </div>
      <Link href="/entreno/hoy" className="flex items-center justify-center gap-2 bg-accent py-3.5 font-semibold text-accent-ink">
        <Play className="h-5 w-5" /> Ver calentamiento y empezar
      </Link>
    </div>
  );
}

function WeighCard({ dayKey }: { dayKey: string }) {
  const addWeight = useApp((s) => s.addWeight);
  const { last } = useCurrentWeight();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<string>(String(last));
  return (
    <>
      <button onClick={() => setOpen(true)} className="card mt-3 flex w-full items-center gap-3 !p-3 text-left">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
          <Scale className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Hoy toca pesarte</div>
          <div className="text-xs text-muted">En ayunas, después del baño.</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={`Peso · ${DAY_NAMES[new Date().getDay()]}`}>
        <input type="number" inputMode="decimal" step="0.1" className={inputCls} value={v} onChange={(e) => setV(e.target.value)} autoFocus />
        <Button
          className="mt-3 w-full"
          onClick={() => {
            const n = Number(v);
            if (n > 50) {
              addWeight(dayKey, n);
              toggleItem(dayKey, { id: "pesaje" }, undefined, true);
            }
            setOpen(false);
          }}
        >
          Guardar {v} lb
        </Button>
      </Sheet>
    </>
  );
}

function QuickMetrics({ dayKey }: { dayKey: string }) {
  const m = useApp((s) => s.metrics[dayKey] ?? EMPTY_OBJ);
  const setMetric = useApp((s) => s.setMetric);
  const stepsGoal = useApp((s) => s.profile.stepsGoal);
  const items: { key: "energy" | "hunger" | "mood"; label: string; emojis: string[] }[] = [
    { key: "energy", label: "Energía", emojis: ["😫", "😕", "😐", "🙂", "⚡"] },
    { key: "hunger", label: "Hambre", emojis: ["😌", "🙂", "😐", "😋", "🤤"] },
    { key: "mood", label: "Ánimo", emojis: ["😞", "😕", "😐", "🙂", "😄"] },
  ];
  return (
    <Card className="space-y-3">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-2">
          <span className="w-16 text-sm text-muted">{it.label}</span>
          <div className="flex flex-1 justify-between">
            {it.emojis.map((e, i) => (
              <button
                key={i}
                onClick={() => setMetric(dayKey, { [it.key]: i + 1 })}
                className={cx("grid h-10 w-10 place-items-center rounded-full text-xl transition", m[it.key] === i + 1 ? "scale-110 bg-accent-soft ring-2 ring-accent" : "opacity-60")}
                aria-label={`${it.label} ${i + 1}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="flex w-16 items-center gap-1 text-sm text-muted">
          <Footprints className="h-4 w-4" /> Pasos
        </span>
        <input
          type="number"
          inputMode="numeric"
          placeholder={`Meta ${stepsGoal.toLocaleString("es-DO")}`}
          value={m.steps ?? ""}
          onChange={(e) => setMetric(dayKey, { steps: e.target.value ? Number(e.target.value) : undefined })}
          className="h-10 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-sm"
        />
      </div>
    </Card>
  );
}

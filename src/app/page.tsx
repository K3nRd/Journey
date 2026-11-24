"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ChevronRight, Droplets, Flame, Footprints, Minus, Plus, Play, Scale, Beef, ArrowUpRight, Settings2 } from "lucide-react";
import { EMPTY_OBJ, EMPTY_ARR, useApp } from "@/lib/store";
import { useDay, useNow, useTargets, useCurrentWeight, completionFor } from "@/lib/hooks";
import { fmt12, fmtDate, toMin, nowMin, fmtDuration, pad } from "@/lib/date";
import { Card, Ring, SectionTitle, Badge, Bar, Sheet, Button, IconTile, cx, inputCls } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { MealCard } from "@/components/MealCard";
import { ExercisePreview } from "@/components/ExercisePreview";
import { JourneyPath } from "@/components/JourneyPath";
import { getExercise } from "@/data/exercises";
import { PHASE_INFO, sessionExercises } from "@/lib/workout";
import { toggleItem } from "@/lib/actions";
import { streak } from "@/lib/progress";
import { InstallBanner } from "@/components/InstallBanner";
import { GUIDE } from "@/data/guide";
import type { TimelineItem } from "@/lib/types";

const KIND_TONE: Record<TimelineItem["kind"], "accent" | "food" | "violet" | "info" | "neutral"> = {
  habit: "accent",
  meal: "food",
  work: "neutral",
  gym: "accent",
  cardio: "accent",
  sleep: "violet",
  walk: "info",
  break: "info",
  track: "violet",
};

export default function Dashboard() {
  const now = useNow(30000);
  const day = useDay();
  const profile = useApp((s) => s.profile);
  const checks = useApp((s) => s.checks);
  const overrides = useApp((s) => s.overrides);
  const metrics = useApp((s) => s.metrics[day.key] ?? EMPTY_OBJ);
  const setMetric = useApp((s) => s.setMetric);
  const eaten = useApp((s) => s.foodLog[day.key] ?? EMPTY_ARR);
  const weighedToday = useApp((s) => s.weights.some((w) => w.date === day.key));
  const t = useTargets();
  const { trend } = useCurrentWeight();
  const dayChecks: Record<string, boolean> = checks[day.key] ?? EMPTY_OBJ;
  const checkable = day.timeline.filter((i) => i.checkable);
  const done = checkable.filter((i) => dayChecks[i.id]).length;
  const pct = checkable.length ? done / checkable.length : 0;
  const nm = nowMin(now);

  const strk = useMemo(() => streak((k) => completionFor(checks, profile, overrides, k)), [checks, profile, overrides]);

  const { current, next } = useMemo(() => {
    const wake = toMin(profile.wakeTime);
    const norm = (x: string) => {
      const m = toMin(x);
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
      const pending = day.timeline.filter((it) => it.checkable && !dayChecks[it.id] && norm(it.time) <= n && n - norm(it.time) < 90);
      current = pending.at(-1);
    }
    return { current, next };
  }, [day.timeline, nm, profile.wakeTime, dayChecks]);

  const hour = now.getHours();
  const greet = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const eatenKcal = eaten.reduce((a: number, e: { kcal: number }) => a + e.kcal, 0);
  const eatenProt = eaten.reduce((a: number, e: { protein: number }) => a + e.protein, 0);
  const isWeighDay = [1, 3, 5].includes(day.weekday) && profile.habits.pesaje;
  const lost = profile.startWeightLb - trend;
  const water = metrics.water ?? 0;

  return (
    <div className="safe-top pt-5">
      <InstallBanner />

      {/* Encabezado */}
      <header className="rise flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium capitalize text-muted">{fmtDate(day.key)}</p>
          <h1 className="font-display mt-0.5 text-[30px] font-bold leading-[1.05]">
            {greet}
            {profile.name ? (
              <>
                ,<br />
                <span className="grad-text">{profile.name.split(" ")[0]}</span>
              </>
            ) : null}
          </h1>
        </div>
        <Link href="/ajustes" className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface" aria-label="Ajustes">
          <Settings2 className="h-5 w-5 text-muted" />
        </Link>
      </header>

      {/* Hero: el camino */}
      <Link href="/progreso" className="tap card grad-soft rise relative mt-5 block overflow-hidden p-5" style={{ animationDelay: "60ms" }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Tu journey</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-display text-[44px] font-bold leading-none tabular-nums">{trend.toFixed(1)}</span>
              <span className="text-sm font-medium text-muted">lb</span>
            </div>
            <div className="mt-1 text-[13px] text-muted">
              {lost > 0.05 ? (
                <>
                  <span className="font-semibold text-accent-text">−{lost.toFixed(1)} lb</span> desde el inicio
                </>
              ) : (
                <>Punto de partida · meta {profile.goalWeightLb} lb</>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge tone="accent">Semana {day.week}</Badge>
            {strk > 0 && (
              <Badge tone="warn">
                <Flame className="h-3 w-3" /> {strk} {strk === 1 ? "día" : "días"}
              </Badge>
            )}
            {day.session.type === "fuerza" && day.phase !== "normal" && <Badge>{PHASE_INFO[day.phase].label}</Badge>}
          </div>
        </div>
        <JourneyPath start={profile.startWeightLb} goal={profile.goalWeightLb} current={trend} className="mt-4" />
        <ArrowUpRight className="absolute right-4 top-4 hidden h-4 w-4 text-muted" />
      </Link>

      {/* Ahora */}
      <NowCard current={current} next={next} nm={nm} dayKey={day.key} pct={pct} done={done} total={checkable.length} />

      {/* Indicadores rápidos */}
      <div className="rise mt-3 grid grid-cols-3 gap-2.5" style={{ animationDelay: "140ms" }}>
        <div className="card !rounded-[1.25rem] p-3">
          <div className="flex items-center justify-between">
            <Droplets className="h-4 w-4 text-sky" />
            <span className="text-[11px] text-muted">/{profile.waterGoalGlasses}</span>
          </div>
          <div className="font-display mt-1.5 text-2xl font-bold leading-none">{water}</div>
          <div className="text-[11px] text-muted">vasos de agua</div>
          <div className="mt-2 flex gap-1">
            <button className="tap grid h-7 flex-1 place-items-center rounded-full bg-surface-2" onClick={() => setMetric(day.key, { water: Math.max(0, water - 1) })} aria-label="Quitar vaso">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button className="tap grid h-7 flex-1 place-items-center rounded-full bg-sky-soft text-sky" onClick={() => setMetric(day.key, { water: water + 1 })} aria-label="Añadir vaso">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <Link href="/registro" className="tap card !rounded-[1.25rem] block p-3">
          <div className="flex items-center justify-between">
            <Flame className="h-4 w-4 text-food" />
            <span className="text-[11px] text-muted">/{(t.kcal / 1000).toFixed(1)}k</span>
          </div>
          <div className="font-display mt-1.5 text-2xl font-bold leading-none">{eatenKcal.toLocaleString("es-DO")}</div>
          <div className="text-[11px] text-muted">kcal comidas</div>
          <div className="mt-3.5">
            <Bar value={eatenKcal / t.kcal} tone="food" />
          </div>
        </Link>
        <Link href="/registro" className="tap card !rounded-[1.25rem] block p-3">
          <div className="flex items-center justify-between">
            <Beef className="h-4 w-4 text-accent-text" />
            <span className="text-[11px] text-muted">/{t.protein}g</span>
          </div>
          <div className="font-display mt-1.5 text-2xl font-bold leading-none">{eatenProt}</div>
          <div className="text-[11px] text-muted">g proteína</div>
          <div className="mt-3.5">
            <Bar value={eatenProt / t.protein} />
          </div>
        </Link>
      </div>

      {isWeighDay && !weighedToday && <WeighCard dayKey={day.key} />}

      {/* Rutina */}
      <SectionTitle
        action={
          <span className="text-[13px] text-muted">
            <b className="text-fg">{done}</b>/{checkable.length} hechos
          </span>
        }
      >
        Tu día
      </SectionTitle>
      <Timeline items={day.timeline} nm={nm} dayKey={day.key} wake={profile.wakeTime} />

      {/* Comidas */}
      <SectionTitle action={<Link href="/nutricion" className="text-[13px] font-semibold text-accent-text">Semana →</Link>}>Lo que comes hoy</SectionTitle>
      <div className="-mt-1 mb-3 flex items-center gap-2 text-[13px] text-muted">
        <span>
          <b className="text-fg">{Math.round(day.menu.reduce((a, m) => a + m.macros.kcal, 0)).toLocaleString("es-DO")}</b> kcal
        </span>
        <span className="h-1 w-1 rounded-full bg-muted" />
        <span>
          <b className="text-accent-text">{Math.round(day.menu.reduce((a, m) => a + m.macros.protein, 0))} g</b> proteína
        </span>
        <span className="h-1 w-1 rounded-full bg-muted" />
        <span>3 comidas</span>
      </div>
      <div className="no-scrollbar snap-x-mandatory -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {day.menu.map((m) => {
          const item = day.timeline.find((i) => i.meal === m.slot);
          return (
            <div key={m.slot} className="snap-start w-[86%] shrink-0">
              <MealCard
                meal={m}
                weekday={day.weekday}
                time={item ? fmt12(item.time) : undefined}
                restDay={day.session.type !== "fuerza"}
                eaten={Boolean(item && dayChecks[item.id])}
                onToggle={() => item && toggleItem(day.key, item, m)}
              />
            </div>
          );
        })}
      </div>

      {/* Entrenamiento */}
      <SectionTitle action={<Link href="/entreno" className="text-[13px] font-semibold text-accent-text">Semana →</Link>}>Tu entrenamiento</SectionTitle>
      <WorkoutCard day={day} />

      {/* Dato del día */}
      <DailyTip dayKey={day.key} />

      {/* Cómo te sientes */}
      <SectionTitle>¿Cómo te sientes?</SectionTitle>
      <QuickMetrics dayKey={day.key} />
    </div>
  );
}

function NowCard({
  current,
  next,
  nm,
  dayKey,
  pct,
  done,
  total,
}: {
  current?: TimelineItem;
  next?: TimelineItem;
  nm: number;
  dayKey: string;
  pct: number;
  done: number;
  total: number;
}) {
  const focus = current ?? next;
  const until = focus && !current ? (toMin(focus.time) - nm + 1440) % 1440 : null;
  return (
    <div className="card rise mt-3 overflow-hidden !p-0" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center gap-4 p-4">
        <Ring value={pct} size={64} stroke={6}>
          <div className="text-center leading-none">
            <div className="font-display text-[17px] font-bold">{Math.round(pct * 100)}%</div>
            <div className="mt-0.5 text-[9px] text-muted">
              {done}/{total}
            </div>
          </div>
        </Ring>
        {focus ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em]">
              {current ? (
                <>
                  <span className="pulse-now h-2 w-2 rounded-full bg-accent" />
                  <span className="text-accent-text">Ahora</span>
                </>
              ) : (
                <span className="text-muted">En {fmtDuration(until ?? 0)}</span>
              )}
              <span className="font-medium normal-case tracking-normal text-muted">· {fmt12(focus.time)}</span>
            </div>
            <div className="font-display mt-0.5 truncate text-[18px] font-bold leading-tight">{focus.title}</div>
            {focus.desc && <div className="truncate text-[13px] text-muted">{focus.desc}</div>}
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-bold">¡Día completado! ✨</div>
            <div className="text-[13px] text-muted">Descansa bien. Mañana seguimos.</div>
          </div>
        )}
        {focus?.checkable && !focus.meal && (
          <button onClick={() => toggleItem(dayKey, focus)} className="tap grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-line-strong" aria-label="Marcar como hecho">
            <Check className="h-5 w-5 text-muted" />
          </button>
        )}
      </div>
      {focus && (focus.kind === "gym" || focus.kind === "cardio") && (
        <Link href="/entreno/hoy" className="tap grad flex items-center justify-center gap-2 py-3.5 text-[15px] font-semibold text-accent-ink">
          <Play className="h-5 w-5 fill-current" /> Empezar entrenamiento
        </Link>
      )}
      {current && next && current.id !== next.id && (
        <div className="flex items-center gap-2 border-t border-line px-4 py-2.5 text-[12px] text-muted">
          <ChevronRight className="h-3.5 w-3.5" /> Después: <span className="font-medium text-fg">{next.title}</span> · {fmt12(next.time)}
        </div>
      )}
    </div>
  );
}

function Timeline({ items, nm, dayKey, wake }: { items: TimelineItem[]; nm: number; dayKey: string; wake: string }) {
  const checks = useApp((s) => s.checks[dayKey] ?? EMPTY_OBJ) as Record<string, boolean>;
  const w = toMin(wake);
  const norm = (m: number) => (m < w - 120 ? m + 1440 : m);
  const n = norm(nm);
  const nowIdx = items.findIndex((it) => norm(toMin(it.time)) > n);
  return (
    <div className="card relative !px-3 !py-2">
      {items.map((it, idx) => {
        const start = norm(toMin(it.time));
        const end = it.end ? norm(toMin(it.end)) : start;
        const active = start <= n && n < (it.end ? end : start + 30);
        const past = !active && start < n;
        const isDone = Boolean(checks[it.id]);
        const tone = KIND_TONE[it.kind];
        const last = idx === items.length - 1;
        return (
          <div key={it.id}>
            {idx === nowIdx && (
              <div className="relative flex items-center gap-2 py-1 pl-[4.25rem]">
                <span className="absolute left-[4.6rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
                <div className="ml-3 h-[2px] flex-1 rounded-full grad" />
                <span className="font-display text-[11px] font-bold text-accent-text">{fmt12(`${pad(Math.floor(nm / 60))}:${pad(nm % 60)}`)}</span>
              </div>
            )}
            <div className={cx("relative flex items-center gap-3 rounded-2xl py-2 pr-1", active && "bg-accent-soft", past && !isDone && it.checkable && "opacity-55")}>
              {/* Hora */}
              <div className={cx("w-14 shrink-0 text-right text-[12px] tabular-nums", active ? "font-semibold text-fg" : "text-muted")}>{fmt12(it.time)}</div>
              {/* Nodo + línea del camino */}
              <div className="relative flex w-9 shrink-0 justify-center self-stretch">
                {!last && <span className={cx("absolute top-1/2 h-[calc(100%+16px)] w-[2px]", isDone || past ? "bg-accent/40" : "bg-line")} />}
                <span
                  className={cx(
                    "relative z-[1] my-auto grid h-9 w-9 place-items-center rounded-full border transition",
                    isDone ? "grad pop border-transparent text-accent-ink" : active ? "pulse-now border-accent bg-surface text-accent-text" : "border-line bg-surface-2",
                    !isDone && !active && (tone === "food" ? "text-food" : tone === "violet" ? "text-violet" : tone === "info" ? "text-sky" : tone === "neutral" ? "text-muted" : "text-accent-text"),
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon name={it.icon} className="h-4 w-4" />}
                </span>
              </div>
              {/* Contenido */}
              {it.href ? (
                <Link href={it.href} className="min-w-0 flex-1">
                  <div className={cx("truncate text-[14px] font-medium", isDone && "text-muted line-through")}>{it.title}</div>
                  {it.end && <div className="text-[11px] text-muted">hasta {fmt12(it.end)}</div>}
                </Link>
              ) : (
                <div className="min-w-0 flex-1">
                  <div className={cx("truncate text-[14px] font-medium", isDone && "text-muted line-through")}>{it.title}</div>
                  {it.end && <div className="text-[11px] text-muted">hasta {fmt12(it.end)}</div>}
                </div>
              )}
              {it.checkable && (
                <button
                  onClick={() => toggleItem(dayKey, it)}
                  className={cx("tap grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition", isDone ? "border-accent/50 text-accent-text" : "border-line")}
                  aria-label={isDone ? "Desmarcar" : "Marcar como hecho"}
                >
                  {isDone && <Check className="h-4 w-4" strokeWidth={3} />}
                </button>
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
      <Card className="flex items-center gap-4">
        <IconTile tone="violet" size="lg">
          <span className="text-2xl">😴</span>
        </IconTile>
        <div>
          <div className="font-display text-lg font-bold">Día de descanso</div>
          <p className="text-[13px] text-muted">El músculo crece cuando descansas. Camina suave y duerme bien.</p>
        </div>
      </Card>
    );
  }
  const list = sessionExercises(s, day.phase, false);
  const totalSets = list.reduce((a, e) => a + e.sets, 0);
  return (
    <div className="card overflow-hidden !p-0">
      {/* Portada con el primer ejercicio */}
      <div className="relative">
        <ExercisePreview id={list[0].exId} size="lg" className="!rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="mb-1.5 flex gap-1.5">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">{list.length} ejercicios</span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">{totalSets} series</span>
            <span className="rounded-full bg-[#c8f135] px-2.5 py-1 text-[11px] font-bold text-[#0a1100]">{PHASE_INFO[day.phase].label}</span>
          </div>
          <div className="font-display text-[26px] font-bold leading-tight">{s.title}</div>
          <div className="text-[13px] text-white/70">{s.focus}</div>
        </div>
      </div>
      <div className="divide-y divide-line">
        {list.map((e, i) => {
          const ex = getExercise(e.exId);
          return (
            <Link key={e.exId} href={`/ejercicio/${e.exId}`} className="tap flex items-center gap-3 px-4 py-3">
              <span className="font-display w-4 text-center text-sm font-bold text-muted">{i + 1}</span>
              <ExercisePreview id={e.exId} size="sm" speed={1000 + i * 90} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold leading-snug">{ex.name}</div>
                <div className="mt-0.5 text-[12px] text-muted">
                  {e.sets > 1 ? `${e.sets} × ` : ""}
                  {e.reps}
                  {e.restSec ? ` · ${e.restSec >= 60 ? `${Math.round((e.restSec / 60) * 10) / 10} min` : `${e.restSec} s`} descanso` : ""}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted" />
            </Link>
          );
        })}
      </div>
      <div className="p-3">
        <Link href="/entreno/hoy" className="tap grad glow flex h-13 items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-accent-ink">
          <Play className="h-5 w-5 fill-current" /> Calentar y empezar
        </Link>
      </div>
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
      <button onClick={() => setOpen(true)} className="tap card mt-3 flex w-full items-center gap-3 !p-3.5 text-left">
        <IconTile tone="violet">
          <Scale className="h-5 w-5" />
        </IconTile>
        <div className="flex-1">
          <div className="text-[14px] font-semibold">Hoy toca pesarte</div>
          <div className="text-[12px] text-muted">En ayunas, después del baño.</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Peso de hoy">
        <div className="relative">
          <input type="number" inputMode="decimal" step="0.1" className={cx(inputCls, "font-display h-20 text-center text-4xl font-bold")} value={v} onChange={(e) => setV(e.target.value)} autoFocus />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted">lb</span>
        </div>
        <Button
          size="lg"
          className="mt-4 w-full"
          onClick={() => {
            const n = Number(v);
            if (n > 50) {
              addWeight(dayKey, n);
              toggleItem(dayKey, { id: "pesaje" }, undefined, true);
            }
            setOpen(false);
          }}
        >
          Guardar
        </Button>
      </Sheet>
    </>
  );
}

function QuickMetrics({ dayKey }: { dayKey: string }) {
  const m = useApp((s) => s.metrics[dayKey] ?? EMPTY_OBJ) as Record<string, number | undefined>;
  const setMetric = useApp((s) => s.setMetric);
  const stepsGoal = useApp((s) => s.profile.stepsGoal);
  const items: { key: "energy" | "hunger" | "mood"; label: string; emojis: string[] }[] = [
    { key: "energy", label: "Energía", emojis: ["😫", "😕", "😐", "🙂", "⚡"] },
    { key: "hunger", label: "Hambre", emojis: ["😌", "🙂", "😐", "😋", "🤤"] },
    { key: "mood", label: "Ánimo", emojis: ["😞", "😕", "😐", "🙂", "😄"] },
  ];
  return (
    <Card className="space-y-4">
      {items.map((it) => (
        <div key={it.key}>
          <div className="mb-2 text-[13px] font-semibold text-muted">{it.label}</div>
          <div className="flex justify-between gap-1.5">
            {it.emojis.map((e, i) => {
              const on = m[it.key] === i + 1;
              return (
                <button
                  key={i}
                  onClick={() => setMetric(dayKey, { [it.key]: i + 1 })}
                  className={cx("tap grid h-12 flex-1 place-items-center rounded-2xl border text-[22px] transition", on ? "pop border-accent bg-accent-soft" : "border-line bg-surface-2 opacity-70 grayscale-[40%]")}
                  aria-label={`${it.label} ${i + 1}`}
                >
                  {e}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-muted">
          <Footprints className="h-4 w-4" /> Pasos de hoy
        </div>
        <input
          type="number"
          inputMode="numeric"
          placeholder={`Meta: ${stepsGoal.toLocaleString("es-DO")}`}
          value={m.steps ?? ""}
          onChange={(e) => setMetric(dayKey, { steps: e.target.value ? Number(e.target.value) : undefined })}
          className={inputCls}
        />
      </div>
    </Card>
  );
}

function DailyTip({ dayKey }: { dayKey: string }) {
  const all = GUIDE.flatMap((s) => s.items);
  const n = dayKey.split("-").reduce((a, x) => a + Number(x), 0);
  const tip = all[n % all.length];
  return (
    <Link href="/guia" className="tap card mt-8 flex items-center gap-3 !p-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-2xl">{tip.emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-accent-text">Dato del día</span>
        <span className="block text-[15px] font-semibold leading-snug">
          {tip.title}: {tip.number}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[12px] text-muted">{tip.how}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
    </Link>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ChevronUp,
  Info,
  Play,
  Plus,
  RefreshCw,
  Timer,
  Trophy,
  X,
  Calculator,
  Flame,
  Minus,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader, Card, Button, Badge, Sheet, Toggle, SectionTitle, cx } from "@/components/ui";
import { ExercisePreview } from "@/components/ExercisePreview";
import { ExerciseSheet } from "@/components/ExerciseSheet";
import { PlateSheet, Stepper } from "@/components/PlateCalc";
import { getExercise } from "@/data/exercises";
import { dayPlanByKey, type DayPlan, type PlanExercise } from "@/data/workouts";
import { dateKey, uid, fmtDuration } from "@/lib/date";
import {
  sessionForDate,
  phaseFor,
  PHASE_INFO,
  sessionExercises,
  suggestWeight,
  lastLogFor,
  prsIn,
  isBarbell,
  warmupSets,
  sessionPlan,
  liftingMinutes,
  DURATION_OPTIONS,
  fmtMinutes,
  hrZones,
  volume,
} from "@/lib/workout";
import { toggleItem } from "@/lib/actions";
import type { WorkoutLog } from "@/lib/types";

const MODE_LABEL = { express: "Express", corta: "Sesión corta", completa: "Sesión completa", extendida: "Sesión extendida (+1 serie en los principales)" } as const;

export default function SessionPage() {
  const params = useParams<{ dia: string }>();
  const router = useRouter();
  const profile = useApp((s) => s.profile);
  const today = dateKey();
  const plan: DayPlan | undefined = params.dia === "hoy" ? sessionForDate(profile, today) : dayPlanByKey(params.dia);
  const workouts = useApp((s) => s.workouts);
  const activeId = useApp((s) => s.activeWorkoutId);
  const active = workouts.find((w) => w.id === activeId && !w.finishedAt);
  const [shortPick, setShort] = useState<boolean | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [summary, setSummary] = useState<WorkoutLog | null>(null);
  const phase = phaseFor(profile, today);

  if (summary) return <Summary log={summary} onClose={() => router.push("/")} />;

  if (active && (active.dayKey === plan?.key || params.dia === "hoy")) {
    const p = dayPlanByKey(active.dayKey)!;
    return <ActiveSession plan={p} log={active} phase={phase} onFinish={setSummary} />;
  }

  if (!plan || plan.type === "descanso") {
    return (
      <div>
        <PageHeader title="Descanso" back="/entreno" />
        <Card className="text-center">
          <div className="text-4xl">😴</div>
          <p className="mt-2 font-semibold">Hoy no toca entrenar</p>
          <p className="text-sm text-muted">Camina, estira y duerme bien. Mañana vuelves con todo.</p>
        </Card>
      </div>
    );
  }

  const timePlan = sessionPlan(plan, phase, profile.gymDurationMin);
  const manual = shortPick !== null && plan.type === "fuerza";
  const short = manual ? shortPick : plan.type === "fuerza" && timePlan.short;
  const list = plan.type !== "fuerza" ? sessionExercises(plan, phase, false) : manual ? sessionExercises(plan, phase, short) : timePlan.exercises;
  const cardioMin = plan.type === "fuerza" && !manual ? timePlan.cardioMin : 0;
  const mobilityMin = plan.type === "fuerza" && !manual ? timePlan.mobilityMin : 0;
  const hr = hrZones(profile.age);
  const start = () => {
    const w: WorkoutLog = {
      id: uid(),
      date: today,
      dayKey: plan.key,
      startedAt: Date.now(),
      short,
      exercises: list.map((e) => {
        const sug = suggestWeight(workouts, e.exId, e.reps, phase);
        return {
          exId: e.exId,
          planExId: e.exId,
          sets: Array.from({ length: e.sets }, () => ({ weight: sug.weight, reps: 0, done: false })),
        };
      }),
    };
    useApp.getState().startWorkout(w);
  };

  return (
    <div>
      <PageHeader title={plan.title} subtitle={plan.focus} back="/entreno" />
      {active && (
        <Card className="mb-3 border-warn/40 text-sm">
          Tienes otro entrenamiento sin terminar.{" "}
          <button className="font-semibold text-accent-text" onClick={() => useApp.getState().discardWorkout(active.id)}>
            Descartarlo
          </button>
        </Card>
      )}
      <Card className="mb-3">
        <div className="flex items-center gap-2">
          <Badge tone={phase === "normal" ? "accent" : "warn"}>{PHASE_INFO[phase].label}</Badge>
          <span className="text-xs text-muted">{PHASE_INFO[phase].rir}</span>
        </div>
        <p className="mt-1.5 text-sm text-muted">{PHASE_INFO[phase].desc}</p>
        {plan.type === "fuerza" && (
          <div className="mt-2 space-y-2 border-t border-line pt-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Tiempo que tienes hoy</div>
                <div className="text-xs text-muted">
                  {manual ? (short ? "Sesión corta elegida" : "Sesión completa elegida") : MODE_LABEL[timePlan.mode]}: pesas ≈
                  {fmtMinutes(manual ? liftingMinutes(list) + 15 : timePlan.estimated)}
                  {cardioMin > 0 && ` + ${cardioMin} min cardio`}
                  {mobilityMin > 0 && ` + ${mobilityMin} min movilidad`}
                </div>
              </div>
              <select
                className="h-10 rounded-xl border border-line bg-surface-2 px-2 text-[16px]"
                value={profile.gymDurationMin}
                onChange={(e) => {
                  setShort(null);
                  useApp.getState().setProfile({ gymDurationMin: Number(e.target.value) });
                }}
                aria-label="Duración del entrenamiento"
              >
                {DURATION_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {fmtMinutes(m)}
                  </option>
                ))}
              </select>
            </div>
            <Toggle checked={short} onChange={setShort} label="Sesión corta" desc="Solo los ejercicios principales" />
          </div>
        )}
      </Card>

      {plan.warmup.length > 0 && (
        <>
          <SectionTitle>1 · Calentamiento (8–10 min)</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {plan.warmup.map((w) => (
              <button key={w.exId} onClick={() => setInfo(w.exId)} className="card overflow-hidden !p-0 text-left">
                <ExercisePreview id={w.exId} size="md" className="!rounded-none" />
                <div className="p-2">
                  <div className="text-xs font-semibold leading-tight">{getExercise(w.exId).name}</div>
                  <div className="text-[11px] text-muted">{w.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <SectionTitle>{plan.warmup.length ? "2 · " : ""}Ejercicios ({list.length})</SectionTitle>
      <p className="-mt-1 mb-2 text-xs text-muted">Toca un ejercicio para ver la técnica completa antes de empezar.</p>
      <div className="space-y-2">
        {list.map((e) => {
          const ex = getExercise(e.exId);
          const last = lastLogFor(workouts, e.exId);
          const sug = suggestWeight(workouts, e.exId, e.reps, phase);
          return (
            <button key={e.exId} onClick={() => setInfo(e.exId)} className="card flex w-full items-center gap-3 !p-2.5 text-left">
              <ExercisePreview id={e.exId} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold leading-snug">{ex.name}</div>
                <div className="text-xs text-muted">
                  {e.sets} × {e.reps} · {e.restSec}s descanso
                </div>
                {last && sug.weight > 0 && (
                  <div className={cx("text-xs", sug.trend === "subir" ? "text-good" : "text-muted")}>
                    {sug.trend === "subir" ? "↑ " : ""}
                    Sugerido: {sug.weight} lb
                  </div>
                )}
              </div>
              <Info className="h-4 w-4 text-muted" />
            </button>
          );
        })}
      </div>

      {cardioMin > 0 && (
        <>
          <SectionTitle>{plan.warmup.length ? "3 · " : ""}Cardio zona 2 ({cardioMin} min)</SectionTitle>
          <Card className="space-y-1.5 text-sm">
            <p>
              Caminadora inclinada, bicicleta, elíptica o escaladora a ritmo constante: <b>{hr.zones[0].range} latidos/min</b> (puedes
              conversar con frases completas).
            </p>
            <p className="text-xs text-muted">
              Va después de las pesas para no cansarte antes de levantar. Mejora tu corazón y ayuda a quemar grasa sin afectar tu recuperación.
            </p>
          </Card>
        </>
      )}

      {mobilityMin > 0 && (
        <>
          <SectionTitle>{cardioMin > 0 ? "4 · " : "3 · "}Movilidad y abdomen ({mobilityMin} min)</SectionTitle>
          <Card className="space-y-1 text-sm">
            <p>2–3 vueltas, 45 s cada ejercicio con 15 s de pausa:</p>
            <p className="text-muted">Plancha · Dead bug · Puente de glúteo · Gato-camello · Círculos de cadera · Estiramiento de flexor de cadera</p>
          </Card>
        </>
      )}

      {plan.cooldown.length > 0 && (
        <>
          <SectionTitle>{plan.warmup.length ? `${3 + (cardioMin > 0 ? 1 : 0) + (mobilityMin > 0 ? 1 : 0)} · ` : ""}Estiramiento final (5 min)</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {plan.cooldown.map((w) => (
              <button key={w.exId} onClick={() => setInfo(w.exId)} className="card overflow-hidden !p-0 text-left">
                <ExercisePreview id={w.exId} size="md" className="!rounded-none" />
                <div className="p-2">
                  <div className="text-xs font-semibold leading-tight">{getExercise(w.exId).name}</div>
                  <div className="text-[11px] text-muted">{w.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      {plan.cardioFinisher && cardioMin === 0 && <p className="mt-3 text-center text-xs text-muted">Extra: {plan.cardioFinisher}</p>}

      <div className="safe-bottom sticky bottom-20 z-10 mt-5">
        <Button size="lg" className="w-full shadow-lg" onClick={start}>
          <Play className="h-5 w-5" /> Empezar entrenamiento
        </Button>
      </div>
      <ExerciseSheet id={info} onClose={() => setInfo(null)} />
    </div>
  );
}

// ───────────────────────── Sesión activa ─────────────────────────

function ActiveSession({
  plan,
  log,
  phase,
  onFinish,
}: {
  plan: DayPlan;
  log: WorkoutLog;
  phase: ReturnType<typeof phaseFor>;
  onFinish: (l: WorkoutLog) => void;
}) {
  const workouts = useApp((s) => s.workouts);
  const update = useApp((s) => s.updateWorkout);
  const [idx, setIdx] = useState(() => {
    const i = log.exercises.findIndex((e) => e.sets.some((s) => !s.done));
    return i < 0 ? 0 : i;
  });
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [swapFor, setSwapFor] = useState<number | null>(null);
  const [plateFor, setPlateFor] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const elapsed = useElapsed(log.startedAt);
  useWakeLock();

  const planFor = (exIdx: number): PlanExercise => {
    const e = log.exercises[exIdx];
    return plan.exercises.find((p) => p.exId === e.planExId) ?? { exId: e.exId, sets: e.sets.length, reps: "8-12", restSec: 90 };
  };

  const cur = log.exercises[idx];
  const curPlan = planFor(idx);
  const ex = getExercise(cur.exId);
  const last = lastLogFor(workouts.filter((w) => w.id !== log.id), cur.exId);
  const sug = suggestWeight(workouts.filter((w) => w.id !== log.id), cur.exId, curPlan.reps, phase);
  const repTarget = curPlan.reps.match(/\d+/g)?.map(Number) ?? [];
  const defaultReps = repTarget.length ? repTarget[repTarget.length - 1] : 10;

  const setField = (si: number, field: "weight" | "reps", v: number) =>
    update(log.id, (w) => ({
      ...w,
      exercises: w.exercises.map((e, i) =>
        i !== idx ? e : { ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, [field]: v } : j > si && field === "weight" && !s.done ? { ...s, weight: v } : s)) },
      ),
    }));

  const toggleSet = (si: number) => {
    const s = cur.sets[si];
    const done = !s.done;
    update(log.id, (w) => ({
      ...w,
      exercises: w.exercises.map((e, i) =>
        i !== idx ? e : { ...e, sets: e.sets.map((x, j) => (j === si ? { ...x, done, reps: x.reps || defaultReps } : x)) },
      ),
    }));
    if (done && curPlan.restSec > 0) {
      const lastSet = si === cur.sets.length - 1;
      setRestEnd(Date.now() + (lastSet ? Math.max(60, curPlan.restSec) : curPlan.restSec) * 1000);
      if (lastSet && idx < log.exercises.length - 1) setTimeout(() => setIdx(idx + 1), 600);
    }
  };

  const addSet = () =>
    update(log.id, (w) => ({
      ...w,
      exercises: w.exercises.map((e, i) =>
        i !== idx ? e : { ...e, sets: [...e.sets, { weight: e.sets.at(-1)?.weight ?? 0, reps: 0, done: false }] },
      ),
    }));

  const removeSet = () =>
    update(log.id, (w) => ({
      ...w,
      exercises: w.exercises.map((e, i) => (i !== idx || e.sets.length <= 1 ? e : { ...e, sets: e.sets.slice(0, -1) })),
    }));

  const swapTo = (newId: string) => {
    const s2 = suggestWeight(workouts, newId, curPlan.reps, phase);
    update(log.id, (w) => ({
      ...w,
      exercises: w.exercises.map((e, i) =>
        i !== swapFor ? e : { ...e, exId: newId, sets: e.sets.map((s) => (s.done ? s : { ...s, weight: s2.weight })) },
      ),
    }));
    setSwapFor(null);
  };

  const finish = () => {
    const st = useApp.getState();
    const finalLog = st.workouts.find((w) => w.id === log.id)!;
    st.finishWorkout(log.id);
    const k = finalLog.date;
    toggleItem(k, { id: plan.type === "cardio" ? "cardio" : "gym" }, undefined, true);
    onFinish({ ...finalLog, finishedAt: Date.now() });
  };

  const totalSets = log.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = log.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);

  return (
    <div className="pb-40">
      <header className="safe-top sticky top-0 z-20 -mx-4 bg-bg/90 px-4 pb-2 pt-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate font-bold">{plan.title}</div>
            <div className="text-xs text-muted">
              {fmtDuration(elapsed / 60)} · {doneSets}/{totalSets} series
            </div>
          </div>
          <Button size="sm" onClick={() => setConfirmEnd(true)}>
            Terminar
          </Button>
        </div>
        <div className="mt-2 flex gap-1">
          {log.exercises.map((e, i) => {
            const d = e.sets.filter((s) => s.done).length;
            return (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cx("h-1.5 flex-1 rounded-full", i === idx ? "bg-fg" : d === e.sets.length ? "bg-accent" : d > 0 ? "bg-accent/50" : "bg-surface-3")}
                aria-label={`Ejercicio ${i + 1}`}
              />
            );
          })}
        </div>
      </header>

      <div className="mt-2">
        <ExercisePreview id={cur.exId} size="lg" labels />
        <div className="mt-3 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted">
              Ejercicio {idx + 1} de {log.exercises.length}
              {cur.exId !== cur.planExId && " · alternativa"}
            </div>
            <h2 className="text-xl font-bold leading-tight">{ex.name}</h2>
            <div className="text-sm text-muted">
              {curPlan.reps} reps · descanso {curPlan.restSec}s
            </div>
          </div>
          <button onClick={() => setShowInfo((v) => !v)} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2" aria-label="Técnica">
            {showInfo ? <ChevronUp className="h-5 w-5" /> : <Info className="h-5 w-5" />}
          </button>
        </div>

        {showInfo && (
          <Card className="mt-3 space-y-2 text-sm">
            <ol className="list-decimal space-y-1 pl-4 text-fg/90">
              {ex.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div className="text-bad/90">
              {ex.mistakes.map((m) => (
                <div key={m}>✕ {m}</div>
              ))}
            </div>
          </Card>
        )}

        <div className={cx("mt-3 rounded-xl p-3 text-sm", sug.trend === "subir" ? "bg-good/10 text-good" : sug.trend === "bajar" ? "bg-warn/10 text-warn" : "bg-surface-2 text-muted")}>
          {sug.message}
          {last && (
            <div className="mt-1 text-xs opacity-80">
              Última vez: {last.sets.filter((s) => s.done).map((s) => `${s.weight}×${s.reps}`).join(", ")}
            </div>
          )}
        </div>

        {ex.heavy && !cur.sets.some((s) => s.done) && warmupSets(cur.sets[0]?.weight || sug.weight, isBarbell(cur.exId)).length > 0 && (
          <div className="mt-3 rounded-xl border border-line p-3 text-sm">
            <div className="font-semibold">Series de aproximación</div>
            <p className="mt-0.5 text-xs text-muted">Antes de tu peso de trabajo, sube de a poco. Descansa 60 s entre cada una; no cuentan como series.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {warmupSets(cur.sets[0]?.weight || sug.weight, isBarbell(cur.exId)).map((w, i) => (
                <span key={i} className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold">
                  {w.weight} lb × {w.reps}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Series */}
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-[2.5rem_1fr_1fr_3rem] gap-2 px-1 text-[11px] font-semibold uppercase text-muted">
            <span>Serie</span>
            <span>{ex.timed ? "Peso/Nivel" : "Peso (lb)"}</span>
            <span>{ex.timed ? "Min/seg" : "Reps"}</span>
            <span />
          </div>
          {cur.sets.map((s, si) => (
            <div key={si} className={cx("grid grid-cols-[2.5rem_1fr_1fr_3rem] items-center gap-2 rounded-xl p-1", s.done && "bg-accent-soft")}>
              <span className="text-center font-bold text-muted">{si + 1}</span>
              <Stepper value={s.weight} step={ex.increment ?? 5} onChange={(v) => setField(si, "weight", v)} />
              <Stepper value={s.reps || 0} placeholder={String(defaultReps)} step={1} onChange={(v) => setField(si, "reps", v)} />
              <button
                onClick={() => toggleSet(si)}
                className={cx("grid h-11 w-11 place-items-center rounded-xl border-2", s.done ? "border-transparent grad text-accent-ink" : "border-line")}
                aria-label={s.done ? "Desmarcar serie" : "Completar serie"}
              >
                <Check className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={addSet}>
              <Plus className="h-4 w-4" /> Serie
            </Button>
            <Button variant="ghost" size="sm" onClick={removeSet}>
              <Minus className="h-4 w-4" /> Serie
            </Button>
            <div className="flex-1" />
            {isBarbell(cur.exId) && (
              <Button variant="secondary" size="sm" onClick={() => setPlateFor(cur.sets.find((s) => !s.done)?.weight ?? cur.sets[0].weight)}>
                <Calculator className="h-4 w-4" /> Discos
              </Button>
            )}
            {(ex.alternatives?.length ?? 0) > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setSwapFor(idx)}>
                <RefreshCw className="h-4 w-4" /> Cambiar
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
            Anterior
          </Button>
          {idx < log.exercises.length - 1 ? (
            <Button variant="secondary" className="flex-1" onClick={() => setIdx(idx + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => setConfirmEnd(true)}>
              Terminar
            </Button>
          )}
        </div>
        {idx === log.exercises.length - 1 && plan.cooldown.length > 0 && (
          <Card className="mt-4">
            <div className="mb-2 text-sm font-semibold">Estiramiento final</div>
            <div className="space-y-2">
              {plan.cooldown.map((c) => (
                <div key={c.exId} className="flex items-center gap-3">
                  <ExercisePreview id={c.exId} size="xs" />
                  <div className="text-sm">
                    {getExercise(c.exId).name} <span className="text-muted">· {c.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {restEnd && <RestTimer end={restEnd} onDone={() => setRestEnd(null)} onAdd={(s) => setRestEnd((e) => (e ?? Date.now()) + s * 1000)} />}

      <Sheet open={swapFor !== null} onClose={() => setSwapFor(null)} title="¿Máquina ocupada? Cambia por:">
        <div className="space-y-2">
          {swapFor !== null &&
            [log.exercises[swapFor].planExId, ...(getExercise(log.exercises[swapFor].planExId).alternatives ?? [])]
              .filter((id, i, a) => a.indexOf(id) === i && id !== log.exercises[swapFor].exId)
              .map((id) => (
                <button key={id} onClick={() => swapTo(id)} className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2 p-2 text-left">
                  <ExercisePreview id={id} size="sm" />
                  <div>
                    <div className="text-sm font-semibold">{getExercise(id).name}</div>
                    <div className="text-xs text-muted">
                      {id === log.exercises[swapFor].planExId ? "Original del plan · " : ""}
                      {getExercise(id).equipment}
                    </div>
                  </div>
                </button>
              ))}
        </div>
      </Sheet>

      <PlateSheet weight={plateFor} onClose={() => setPlateFor(null)} />

      <Sheet open={confirmEnd} onClose={() => setConfirmEnd(false)} title="¿Terminar entrenamiento?">
        <p className="text-sm text-muted">
          Completaste {doneSets} de {totalSets} series en {fmtDuration(elapsed / 60)}.
        </p>
        <div className="mt-4 space-y-2">
          <Button className="w-full" onClick={finish}>
            <Check className="h-5 w-5" /> Guardar y terminar
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => setConfirmEnd(false)}>
            Seguir entrenando
          </Button>
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              useApp.getState().discardWorkout(log.id);
              setConfirmEnd(false);
            }}
          >
            <X className="h-4 w-4" /> Descartar sin guardar
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function RestTimer({ end, onDone, onAdd }: { end: number; onDone: () => void; onAdd: (s: number) => void }) {
  const [now, setNow] = useState(Date.now());
  const fired = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, Math.ceil((end - now) / 1000));
  useEffect(() => {
    if (left === 0 && !fired.current) {
      fired.current = true;
      try {
        navigator.vibrate?.([250, 120, 250]);
        const ctx = new AudioContext();
        [0, 0.25].forEach((d) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = 880;
          g.gain.setValueAtTime(0.25, ctx.currentTime + d);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d + 0.2);
          o.connect(g).connect(ctx.destination);
          o.start(ctx.currentTime + d);
          o.stop(ctx.currentTime + d + 0.2);
        });
      } catch {}
      setTimeout(onDone, 1500);
    }
    if (left > 0) fired.current = false;
  }, [left, onDone]);
  const m = Math.floor(left / 60);
  const s = left % 60;
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-16 z-30 px-4">
      <div className={cx("mx-auto flex max-w-lg items-center gap-3 rounded-2xl border p-3 shadow-2xl", left === 0 ? "border-transparent grad text-accent-ink" : "border-line bg-surface")}>
        <Timer className="h-6 w-6" />
        <div className="flex-1">
          <div className="text-xs opacity-70">{left === 0 ? "¡A la siguiente serie!" : "Descanso"}</div>
          <div className="text-2xl font-bold tabular-nums">
            {m}:{String(s).padStart(2, "0")}
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => onAdd(30)}>
          +30s
        </Button>
        <Button size="sm" variant="secondary" onClick={onDone}>
          Saltar
        </Button>
      </div>
    </div>
  );
}

function Summary({ log, onClose }: { log: WorkoutLog; onClose: () => void }) {
  const workouts = useApp((s) => s.workouts);
  const prs = prsIn(workouts, log);
  const dur = Math.round(((log.finishedAt ?? Date.now()) - log.startedAt) / 60000);
  const sets = log.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  return (
    <div className="safe-top pt-10 text-center">
      <div className="text-6xl">💪</div>
      <h1 className="mt-3 text-2xl font-bold">¡Entrenamiento completado!</h1>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <Card className="!p-3">
          <div className="text-xl font-bold">{dur}</div>
          <div className="text-xs text-muted">minutos</div>
        </Card>
        <Card className="!p-3">
          <div className="text-xl font-bold">{sets}</div>
          <div className="text-xs text-muted">series</div>
        </Card>
        <Card className="!p-3">
          <div className="text-xl font-bold">{Math.round(volume(log) / 100) / 10}k</div>
          <div className="text-xs text-muted">lb volumen</div>
        </Card>
      </div>
      {prs.length > 0 && (
        <Card className="mt-4 border-warn/40 text-left">
          <div className="mb-2 flex items-center gap-2 font-semibold text-warn">
            <Trophy className="h-5 w-5" /> ¡{prs.length} récord{prs.length > 1 ? "s" : ""} nuevo{prs.length > 1 ? "s" : ""}!
          </div>
          {prs.map((p) => (
            <div key={p.exId} className="text-sm">
              {getExercise(p.exId).name}: <b>{p.weight} lb × {p.reps}</b>
            </div>
          ))}
        </Card>
      )}
      <Card className="mt-4 text-left text-sm text-muted">
        <div className="mb-1 flex items-center gap-2 font-semibold text-fg">
          <Flame className="h-4 w-4 text-accent-text" /> Ahora
        </div>
        Cena post-entreno dentro de la próxima hora: proteína + carbohidrato. Tu receta de hoy está en el inicio.
      </Card>
      <div className="mt-6 space-y-2">
        <Button size="lg" className="w-full" onClick={onClose}>
          Volver al inicio
        </Button>
        <Link href="/entreno" className="block py-2 text-sm text-muted">
          Ver historial
        </Link>
      </div>
    </div>
  );
}

function useElapsed(start: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);
  return Math.max(0, (now - start) / 1000);
}

/** Mantiene la pantalla encendida durante el entrenamiento. */
function useWakeLock() {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const req = async () => {
      try {
        lock = await (navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request("screen") ?? null;
      } catch {}
    };
    req();
    const vis = () => document.visibilityState === "visible" && req();
    document.addEventListener("visibilitychange", vis);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      lock?.release().catch(() => {});
    };
  }, []);
}


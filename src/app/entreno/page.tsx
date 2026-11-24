"use client";

import Link from "next/link";
import { ChevronRight, History, Calculator, Pill, HeartPulse } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader, Card, Badge, SectionTitle, cx } from "@/components/ui";
import { ExercisePreview } from "@/components/ExercisePreview";
import { addDays, dateKey, DAY_NAMES, fmtDate, weekStart, parseKey } from "@/lib/date";
import { sessionForDate, phaseFor, PHASE_INFO, weekNumber, volume, setsByMuscle, doneSetsByMuscle, TRACKED_MUSCLES, hrZones } from "@/lib/workout";
import { dayPlanByKey, programFor } from "@/data/workouts";
import { getExercise } from "@/data/exercises";
import { WARNING_SIGNS } from "@/data/extras";

export default function Entreno() {
  const profile = useApp((s) => s.profile);
  const workouts = useApp((s) => s.workouts);
  const today = dateKey();
  const ws = weekStart(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const phase = phaseFor(profile, today);
  const info = PHASE_INFO[phase];
  const finished = workouts.filter((w) => w.finishedAt).sort((a, b) => b.startedAt - a.startedAt);
  const program = programFor(profile.gymDays.length);
  const weekSessions = days.map((k) => sessionForDate(profile, k)).filter((s) => s.type === "fuerza");
  const planned = setsByMuscle(weekSessions.flatMap((s) => s.exercises.map((e) => ({ exId: e.exId, sets: e.sets }))));
  const done = doneSetsByMuscle(workouts, days[0], days[6]);
  const hr = hrZones(profile.age);

  return (
    <div>
      <PageHeader title="Entrenamiento" subtitle={`Semana ${weekNumber(profile, today)} · ${info.label}`} />
      <Card className={cx("mb-4", phase !== "normal" && "border-warn/40")}>
        <div className="flex items-center gap-2">
          <Badge tone={phase === "normal" ? "accent" : "warn"}>{info.label}</Badge>
          <span className="text-xs text-muted">{info.rir}</span>
        </div>
        <p className="mt-2 text-sm text-muted">{info.desc}</p>
      </Card>

      <div className="space-y-2">
        {days.map((k) => {
          const s = sessionForDate(profile, k);
          const isToday = k === today;
          const log = workouts.find((w) => w.date === k && w.finishedAt);
          return (
            <Link
              key={k}
              href={s.type === "descanso" ? "#" : isToday ? "/entreno/hoy" : `/entreno/${s.key}`}
              className={cx("card flex items-center gap-3 !p-3", isToday && "border-accent")}
            >
              <div className={cx("w-12 shrink-0 text-center", isToday ? "text-accent-text" : "text-muted")}>
                <div className="text-[11px] font-semibold uppercase">{DAY_NAMES[parseKey(k).getDay()].slice(0, 3)}</div>
                <div className="text-lg font-bold">{parseKey(k).getDate()}</div>
              </div>
              {s.exercises[0] ? <ExercisePreview id={s.exercises[0].exId} size="xs" /> : <div className="grid h-12 w-16 place-items-center rounded-lg bg-surface-2 text-xl">😴</div>}
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{s.title}</div>
                <div className="truncate text-xs text-muted">{s.type === "descanso" ? "Recuperación" : `${s.exercises.length} ejercicios · ${s.focus}`}</div>
              </div>
              {log ? <Badge tone="good">✓ Hecho</Badge> : isToday ? <Badge tone="accent">Hoy</Badge> : null}
              {s.type !== "descanso" && <ChevronRight className="h-4 w-4 text-muted" />}
            </Link>
          );
        })}
      </div>

      <Card className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted">Tu programa</div>
        <div className="mt-1 font-display text-lg font-bold">{program.name}</div>
        <p className="mt-1 text-sm text-muted">{program.why} Se ajusta solo si cambias tus días de gimnasio en Ajustes.</p>
      </Card>

      <SectionTitle>Series por músculo esta semana</SectionTitle>
      <Card className="space-y-2">
        <p className="text-xs text-muted">
          Para ganar músculo, la evidencia apunta a unas <b className="text-fg">10–20 series por músculo a la semana</b>. La barra se llena con lo que
          registras; la marca gris es lo planificado.
        </p>
        {TRACKED_MUSCLES.map((m) => {
          const max = 22;
          const d = Math.round(done[m] * 2) / 2;
          const pl = Math.round(planned[m] * 2) / 2;
          return (
            <div key={m} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 capitalize">{m}</span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                <div className="absolute inset-y-0 left-[45.45%] w-[45.45%] bg-good/15" />
                <div className={cx("absolute inset-y-0 left-0 rounded-full", d >= 10 ? "bg-good" : "bg-accent")} style={{ width: `${Math.min(100, (d / max) * 100)}%` }} />
                <div className="absolute inset-y-0 w-0.5 bg-muted" style={{ left: `${Math.min(100, (pl / max) * 100)}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right tabular-nums text-muted">
                {d}/{pl}
              </span>
            </div>
          );
        })}
      </Card>

      <SectionTitle>Zonas de cardio</SectionTitle>
      <Card className="space-y-2">
        <p className="text-xs text-muted">Frecuencia máxima estimada: {hr.max} latidos/min (fórmula de Tanaka). Úsalo con reloj o el agarre de la caminadora.</p>
        {hr.zones.map((z) => (
          <div key={z.name} className="flex items-center gap-3 text-sm">
            <Badge tone={z.color}>{z.range}</Badge>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{z.name}</div>
              <div className="text-xs text-muted">{z.talk}</div>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted">Si tomas medicamentos para la presión o el corazón, estas cifras no aplican: guíate por cómo te sientes.</p>
      </Card>

      <SectionTitle>Herramientas</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/entreno/discos" className="card flex flex-col gap-1 !p-3">
          <Calculator className="h-5 w-5 text-accent-text" />
          <span className="text-sm font-semibold">Calculadora de discos</span>
          <span className="text-xs text-muted">Qué poner en la barra</span>
        </Link>
        <Link href="/entreno/ejercicios" className="card flex flex-col gap-1 !p-3">
          <History className="h-5 w-5 text-accent-text" />
          <span className="text-sm font-semibold">Ejercicios y récords</span>
          <span className="text-xs text-muted">Biblioteca y progreso</span>
        </Link>
        <Link href="/suplementos" className="card flex flex-col gap-1 !p-3">
          <Pill className="h-5 w-5 text-accent-text" />
          <span className="text-sm font-semibold">Suplementos</span>
          <span className="text-xs text-muted">Creatina, proteína y más</span>
        </Link>
        <Link href="/guia" className="card flex flex-col gap-1 !p-3">
          <HeartPulse className="h-5 w-5 text-accent-text" />
          <span className="text-sm font-semibold">Guía de salud</span>
          <span className="text-xs text-muted">Lo que dice la ciencia</span>
        </Link>
      </div>

      <SectionTitle>Historial</SectionTitle>
      {finished.length === 0 ? (
        <Card className="text-sm text-muted">Tus entrenamientos aparecerán aquí.</Card>
      ) : (
        <div className="space-y-2">
          {finished.slice(0, 15).map((w) => {
            const dur = w.finishedAt ? Math.round((w.finishedAt - w.startedAt) / 60000) : 0;
            const sets = w.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
            return (
              <div key={w.id} className="card !p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{sessionTitle(w.dayKey)}</div>
                  <div className="text-xs text-muted">{fmtDate(w.date)}</div>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {dur} min · {sets} series · {Math.round(volume(w)).toLocaleString("es-DO")} lb de volumen
                  {w.short ? " · sesión corta" : ""}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {w.exercises
                    .filter((e) => e.sets.some((s) => s.done))
                    .map((e) => (
                      <span key={e.exId} className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">
                        {getExercise(e.exId).name.split(" ").slice(0, 3).join(" ")}
                      </span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SectionTitle>Señales para parar</SectionTitle>
      <Card className="space-y-1.5 text-sm text-muted">
        {WARNING_SIGNS.map((w) => (
          <p key={w}>⚠️ {w}</p>
        ))}
        <p className="pt-1 text-xs">Si aparece alguna, detente y consulta a un médico o fisioterapeuta.</p>
      </Card>
    </div>
  );
}

function sessionTitle(key: string) {
  return dayPlanByKey(key)?.title ?? key;
}

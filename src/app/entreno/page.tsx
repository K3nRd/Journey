"use client";

import Link from "next/link";
import { ChevronRight, History, Calculator } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader, Card, Badge, SectionTitle, cx } from "@/components/ui";
import { ExercisePreview } from "@/components/ExercisePreview";
import { addDays, dateKey, DAY_NAMES, fmtDate, weekStart, parseKey } from "@/lib/date";
import { sessionForDate, phaseFor, PHASE_INFO, weekNumber, volume } from "@/lib/workout";
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
              <div className={cx("w-12 shrink-0 text-center", isToday ? "text-accent" : "text-muted")}>
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

      <SectionTitle>Herramientas</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/entreno/discos" className="card flex flex-col gap-1 !p-3">
          <Calculator className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold">Calculadora de discos</span>
          <span className="text-xs text-muted">Qué poner en la barra</span>
        </Link>
        <Link href="/entreno/ejercicios" className="card flex flex-col gap-1 !p-3">
          <History className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold">Ejercicios y récords</span>
          <span className="text-xs text-muted">Biblioteca y progreso</span>
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
  const map: Record<string, string> = {
    lunes: "Pecho y tríceps",
    martes: "Espalda y bíceps",
    miercoles: "Piernas",
    jueves: "Hombros y torso",
    viernes: "Piernas y abdomen",
    sabado: "Cardio y movilidad",
  };
  return map[key] ?? key;
}

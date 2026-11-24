"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { getExercise } from "@/data/exercises";
import { useApp } from "@/lib/store";
import { e1rm } from "@/lib/workout";
import { fmtDate } from "@/lib/date";
import { PageHeader, Card, SectionTitle } from "@/components/ui";
import { ExerciseInfo } from "@/components/ExerciseSheet";
import { ExercisePreview } from "@/components/ExercisePreview";
import Link from "next/link";

export default function ExercisePage() {
  const { id } = useParams<{ id: string }>();
  const ex = getExercise(id);
  const workouts = useApp((s) => s.workouts);
  const history = useMemo(
    () =>
      workouts
        .filter((w) => w.finishedAt)
        .flatMap((w) =>
          w.exercises
            .filter((e) => e.exId === id && e.sets.some((s) => s.done))
            .map((e) => {
              const done = e.sets.filter((s) => s.done);
              const best = done.reduce((m, s) => Math.max(m, e1rm(s.weight, s.reps)), 0);
              const top = done.reduce((m, s) => Math.max(m, s.weight), 0);
              return { date: w.date, sets: done, best: Math.round(best), top };
            }),
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [workouts, id],
  );
  const record = history.reduce((m, h) => Math.max(m, h.best), 0);

  return (
    <div>
      <PageHeader title={ex.name} back />
      <ExerciseInfo id={id} showLink={false} />

      <SectionTitle>Tu progreso</SectionTitle>
      {history.length === 0 ? (
        <Card className="text-sm text-muted">Aún no has registrado este ejercicio.</Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="!p-3">
              <div className="text-xs text-muted">1RM estimado (récord)</div>
              <div className="text-2xl font-bold text-warn">{record} lb</div>
            </Card>
            <Card className="!p-3">
              <div className="text-xs text-muted">Sesiones</div>
              <div className="text-2xl font-bold">{history.length}</div>
            </Card>
          </div>
          {history.length > 1 && (
            <Card className="mt-3 !p-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d) => fmtDate(d, false)} tick={{ fontSize: 11, fill: "var(--muted)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} labelFormatter={(d) => fmtDate(String(d))} />
                    <Line type="monotone" dataKey="best" name="1RM est." stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="top" name="Peso máx." stroke="var(--info)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
          <div className="mt-3 space-y-2">
            {[...history].reverse().slice(0, 10).map((h, i) => (
              <Card key={i} className="!p-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{fmtDate(h.date)}</span>
                  <span className={h.best === record ? "text-warn" : "text-muted"}>{h.best === record ? "🏆 " : ""}{h.best} lb 1RM</span>
                </div>
                <div className="mt-1 text-xs text-muted">{h.sets.map((s) => `${s.weight}×${s.reps}`).join("  ·  ")}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {(ex.alternatives?.length ?? 0) > 0 && (
        <>
          <SectionTitle>Alternativas</SectionTitle>
          <div className="space-y-2">
            {ex.alternatives!.map((a) => (
              <Link key={a} href={`/ejercicio/${a}`} className="card flex items-center gap-3 !p-2.5">
                <ExercisePreview id={a} size="sm" />
                <div className="text-sm font-semibold">{getExercise(a).name}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

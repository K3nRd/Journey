"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Trophy } from "lucide-react";
import { ALL_EXERCISES, type Muscle } from "@/data/exercises";
import { useApp } from "@/lib/store";
import { bestE1rm } from "@/lib/workout";
import { PageHeader, Chip, inputCls } from "@/components/ui";
import { ExercisePreview } from "@/components/ExercisePreview";

const GROUPS: (Muscle | "todos")[] = ["todos", "pecho", "espalda", "hombros", "bíceps", "tríceps", "cuádriceps", "isquiotibiales", "glúteos", "pantorrillas", "abdomen", "cardio", "movilidad"];

export default function Biblioteca() {
  const workouts = useApp((s) => s.workouts);
  const [q, setQ] = useState("");
  const [g, setG] = useState<(typeof GROUPS)[number]>("todos");
  const list = useMemo(
    () =>
      ALL_EXERCISES.filter((e) => (g === "todos" || e.muscles.includes(g)) && e.name.toLowerCase().includes(q.toLowerCase())),
    [q, g],
  );
  return (
    <div>
      <PageHeader title="Ejercicios" subtitle={`${ALL_EXERCISES.length} con fotos de inicio y final`} back="/entreno" />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input className={`${inputCls} pl-9`} placeholder="Buscar ejercicio" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
        {GROUPS.map((x) => (
          <Chip key={x} active={g === x} onClick={() => setG(x)} className="capitalize">
            {x}
          </Chip>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {list.map((e) => {
          const best = bestE1rm(workouts, e.id);
          return (
            <Link key={e.id} href={`/ejercicio/${e.id}`} className="card flex items-center gap-3 !p-2.5">
              <ExercisePreview id={e.id} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{e.name}</div>
                <div className="truncate text-xs capitalize text-muted">{e.muscles.join(", ")}</div>
              </div>
              {best > 0 && (
                <span className="flex items-center gap-1 text-xs text-warn">
                  <Trophy className="h-3.5 w-3.5" /> {Math.round(best)}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[11px] text-muted">Trofeo = 1RM estimado (lb). Fotos: free-exercise-db (dominio público).</p>
    </div>
  );
}

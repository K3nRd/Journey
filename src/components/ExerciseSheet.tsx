"use client";

import { getExercise } from "@/data/exercises";
import { ExercisePreview } from "./ExercisePreview";
import { Badge, Sheet } from "./ui";
import Link from "next/link";

export function ExerciseInfo({ id, showLink = true }: { id: string; showLink?: boolean }) {
  const ex = getExercise(id);
  return (
    <div className="space-y-4">
      <ExercisePreview id={id} size="lg" labels />
      <div className="flex flex-wrap gap-1.5">
        {ex.muscles.map((m) => (
          <Badge key={m} tone="accent">
            {m}
          </Badge>
        ))}
        {ex.equipment && <Badge>{ex.equipment}</Badge>}
      </div>
      {ex.steps.length > 0 && (
        <div>
          <h4 className="mb-1.5 text-sm font-semibold">Técnica</h4>
          <ol className="space-y-1.5">
            {ex.steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-bold text-accent-text">{i + 1}</span>
                <span className="text-fg/90">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {ex.mistakes.length > 0 && (
        <div>
          <h4 className="mb-1.5 text-sm font-semibold">Errores que debes evitar</h4>
          <ul className="space-y-1">
            {ex.mistakes.map((m) => (
              <li key={m} className="flex gap-2 text-sm text-fg/90">
                <span className="text-bad">✕</span> {m}
              </li>
            ))}
          </ul>
        </div>
      )}
      {ex.tip && <p className="rounded-xl bg-info/10 p-3 text-sm text-info">💡 {ex.tip}</p>}
      {showLink && (
        <Link href={`/ejercicio/${id}`} className="block text-center text-sm text-accent-text">
          Ver historial y récords →
        </Link>
      )}
    </div>
  );
}

export function ExerciseSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  return (
    <Sheet open={Boolean(id)} onClose={onClose} title={id ? getExercise(id).name : ""}>
      {id && <ExerciseInfo id={id} />}
    </Sheet>
  );
}

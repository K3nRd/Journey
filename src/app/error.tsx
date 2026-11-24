"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="grid min-h-[80dvh] place-items-center text-center">
      <div className="max-w-xs space-y-4">
        <div className="text-5xl">🧭</div>
        <h1 className="font-display text-2xl font-bold">Algo se desvió del camino</h1>
        <p className="text-sm text-muted">Ocurrió un error inesperado. Tus datos están a salvo en tu teléfono.</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => retry()} className="tap grad glow inline-flex h-12 items-center justify-center gap-2 rounded-full font-semibold text-accent-ink">
            <RotateCcw className="h-4 w-4" /> Intentar de nuevo
          </button>
          <Link href="/" className="h-11 leading-[2.75rem] text-sm text-muted">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

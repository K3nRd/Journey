"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/cloud";

/** Regreso desde Google: Supabase completa la sesión y Providers redirige al inicio. */
export default function AuthCallback() {
  const status = useAuth((s) => s.status);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const e = p.get("error_description") ?? p.get("error");
    if (e) setError(e);
  }, []);

  return (
    <div className="grid min-h-dvh place-items-center text-center">
      <div className="max-w-xs space-y-3">
        <div className="font-display text-3xl font-bold grad-text">journey</div>
        {error ? (
          <>
            <p className="text-sm text-bad">No se pudo iniciar sesión con Google: {error}</p>
            <Link href="/login" className="text-sm text-accent-text underline">
              Volver a intentarlo
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted">{status === "signedOut" ? "Completando el inicio de sesión…" : "Entrando…"}</p>
        )}
      </div>
    </div>
  );
}

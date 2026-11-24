"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/cloud";
import { isIOS, isStandalone } from "@/lib/push-client";

/** Regreso desde Google: Supabase completa la sesión y Providers redirige al inicio. */
export default function AuthCallback() {
  const status = useAuth((s) => s.status);
  const [error, setError] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);
  const [iosOutside, setIosOutside] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const e = p.get("error_description") ?? p.get("error");
    if (e) setError(e);
    setIosOutside(isIOS() && !isStandalone());
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const failed = error || (slow && status === "signedOut");

  return (
    <div className="grid min-h-dvh place-items-center text-center">
      <div className="max-w-xs space-y-3">
        <div className="font-display text-3xl font-bold grad-text">journey</div>
        {failed ? (
          <>
            <p className="text-sm text-bad">{error ? `No se pudo iniciar sesión con Google: ${error}` : "No se pudo completar el inicio de sesión con Google."}</p>
            {iosOutside && (
              <p className="rounded-xl bg-surface-2 p-3 text-sm text-muted">
                En iPhone, Google a veces se abre fuera de la app. Cierra esta ventana, abre Journey desde el ícono y entra con tu correo y
                contraseña.
              </p>
            )}
            <Link href="/login" className="inline-block text-sm text-accent-text underline">
              Volver a intentarlo
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted">Completando el inicio de sesión…</p>
        )}
      </div>
    </div>
  );
}

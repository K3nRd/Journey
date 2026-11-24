"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Download, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { isIOS, isStandalone, serverStatus } from "@/lib/push-client";

export function InstallBanner() {
  const dismissed = useApp((s) => s.installDismissed);
  const dismiss = useApp((s) => s.dismissInstall);
  const pushEnabled = useApp((s) => s.pushEnabled);
  const [state, setState] = useState<"install" | "push" | null>(null);

  useEffect(() => {
    if (dismissed) return;
    if (!isStandalone()) {
      setState("install");
      return;
    }
    if (!pushEnabled) serverStatus().then((s) => s.push && setState("push"));
  }, [dismissed, pushEnabled]);

  if (!state || dismissed) return null;
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent-soft p-3">
      {state === "install" ? <Download className="h-5 w-5 shrink-0 text-accent" /> : <Bell className="h-5 w-5 shrink-0 text-accent" />}
      <Link href="/ajustes#notificaciones" className="min-w-0 flex-1 text-sm">
        {state === "install" ? (
          <>
            <b>Instala la app</b> en tu pantalla de inicio
            {isIOS() ? " (Compartir → Añadir a pantalla de inicio)" : ""} para recibir recordatorios con el teléfono bloqueado.
          </>
        ) : (
          <>
            <b>Activa los recordatorios</b> para que te lleguen aunque la app esté cerrada.
          </>
        )}
      </Link>
      <button onClick={dismiss} className="grid h-8 w-8 place-items-center rounded-full" aria-label="Cerrar aviso">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

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
    <div className="rise mb-4 flex items-center gap-3 rounded-[1.25rem] border border-line bg-surface p-3 shadow-lg">
      <span className="grad grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-accent-ink">{state === "install" ? <Download className="h-5 w-5" /> : <Bell className="h-5 w-5" />}</span>
      <Link href="/ajustes#notificaciones" className="min-w-0 flex-1 text-[13px] leading-snug">
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

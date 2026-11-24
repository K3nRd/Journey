"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Download, Upload, RotateCcw, Send, Pencil, Trash2, Check, LogOut } from "lucide-react";
import { deleteAccount, resetLocal, signOut, useAuth } from "@/lib/cloud";
import { useApp, exportableState, DEFAULT_PROFILE } from "@/lib/store";
import { buildTimeline, buildWeeklyReminders, REMINDER_KINDS } from "@/lib/schedule";
import { dateKey, fmt12 } from "@/lib/date";
import {
  enablePush,
  disablePush,
  sendTestPush,
  serverStatus,
  isIOS,
  isAndroid,
  isStandalone,
  isPushSupported,
  pushDiagnostics,
  type ServerStatus,
} from "@/lib/push-client";
import { PageHeader, Card, Button, Toggle, Segmented, SectionTitle, Badge, Field, Sheet, inputCls } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function Ajustes() {
  const s = useApp();
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [msg, setMsg] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [env, setEnv] = useState({ ios: false, android: false, standalone: false, supported: false });
  const [confirmReset, setConfirmReset] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [diag, setDiag] = useState<ReturnType<typeof pushDiagnostics>>(null);
  const user = useAuth((x) => x.user);
  const auth = useAuth((x) => x.status);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    serverStatus().then(setStatus);
    setEnv({ ios: isIOS(), android: isAndroid(), standalone: isStandalone(), supported: isPushSupported() });
    setDiag(pushDiagnostics());
  }, []);

  const flash = (tone: "good" | "bad", text: string) => {
    setMsg({ tone, text });
    setTimeout(() => setMsg(null), 5000);
  };

  const timeline = buildTimeline(s.profile, dateKey(), { overrides: s.overrides });

  const [pushMsg, setPushMsg] = useState<{ tone: "good" | "bad"; text: string } | null>(null);
  const [step, setStep] = useState<string | null>(null);

  const turnOn = async () => {
    setPushMsg(null);
    setBusy(true);
    try {
      const r = await enablePush(s.deviceId, buildWeeklyReminders(s.profile, s.overrides), setStep);
      if (r.ok) {
        s.setPushEnabled(true);
        s.setProfile({ remindersEnabled: true });
        setPushMsg({ tone: "good", text: "¡Recordatorios activados! Toca «Enviar prueba» y bloquea el teléfono." });
      } else setPushMsg({ tone: "bad", text: r.error ?? "No se pudo activar." });
    } finally {
      setBusy(false);
      setStep(null);
      setDiag(pushDiagnostics());
    }
  };

  const testPush = async () => {
    setPushMsg(null);
    setBusy(true);
    try {
      const r = await sendTestPush(s.deviceId);
      setPushMsg(
        r.ok
          ? { tone: "good", text: "Enviada. Bloquea el teléfono: debe llegar en unos segundos." }
          : { tone: "bad", text: r.error ?? "Falló el envío." },
      );
      if (!r.ok && /no está registrado/.test(r.error ?? "")) s.setPushEnabled(false);
    } catch {
      setPushMsg({ tone: "bad", text: "Sin conexión con el servidor. Inténtalo de nuevo." });
    } finally {
      setBusy(false);
    }
  };

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(exportableState(useApp.getState()), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `journey-respaldo-${dateKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importFile = async (f?: File) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!data.profile) throw new Error();
      s.importData({ ...data, deviceId: s.deviceId, pushEnabled: s.pushEnabled });
      flash("good", "Datos restaurados.");
    } catch {
      flash("bad", "El archivo no es un respaldo válido.");
    }
  };

  return (
    <div>
      <PageHeader title="Ajustes" back="/mas" />
      {msg && (
        <div className={`mb-3 rounded-xl p-3 text-sm ${msg.tone === "good" ? "bg-good/15 text-good" : "bg-bad/15 text-bad"}`}>{msg.text}</div>
      )}

      <Card className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-accent text-lg font-bold text-accent-ink">
          {(s.profile.name || "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{s.profile.name || "Sin nombre"}</div>
          <div className="text-xs text-muted">
            {s.profile.age} años · {s.profile.startWeightLb} → {s.profile.goalWeightLb} lb
          </div>
        </div>
        <Link href="/onboarding" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-surface-2 px-3 text-sm">
          <Pencil className="h-4 w-4" /> Editar
        </Link>
      </Card>
      <p className="mt-1.5 text-xs text-muted">«Editar» repite las preguntas iniciales: horario, gimnasio, comida y hábitos.</p>

      {user && (
        <>
          <SectionTitle>Cuenta</SectionTitle>
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{user.email}</div>
                <div className="text-xs text-muted">
                  Correo y contraseña
                  {s.lastSyncAt ? ` · guardado ${new Date(s.lastSyncAt).toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit" })}` : ""}
                </div>
              </div>
              <Badge tone="good">
                <Check className="h-3 w-3" /> Sincronizado
              </Badge>
            </div>
            <p className="text-xs text-muted">Tus datos se guardan solos en tu cuenta. Las fotos de progreso se quedan solo en este teléfono.</p>
            <Button
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                if (s.pushEnabled) await disablePush(s.deviceId).catch(() => {});
                await signOut();
                location.assign(`${location.origin}/login`);
              }}
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </Button>
          </Card>
        </>
      )}

      <SectionTitle
        action={
          Object.keys(s.overrides).length > 0 && (
            <button className="text-xs text-accent-text" onClick={() => Object.keys(s.overrides).forEach((k) => s.setOverride(k, null))}>
              Restablecer horas
            </button>
          )
        }
      >
        Horario de hoy
      </SectionTitle>
      <Card className="divide-y divide-line !p-0">
        {timeline.map((it) => (
          <div key={it.id} className="flex items-center gap-3 px-3 py-2">
            <Icon name={it.icon} className="h-4 w-4 shrink-0 text-accent-text" />
            <span className="min-w-0 flex-1 truncate text-sm">
              {it.title}
              {s.overrides[it.id] && <span className="ml-1 text-[10px] text-warn">editado</span>}
            </span>
            <input
              type="time"
              value={it.time}
              onChange={(e) => e.target.value && s.setOverride(it.id, e.target.value)}
              className="w-[6.5rem] rounded-lg bg-surface-2 px-2 py-1 text-right text-sm"
              aria-label={`Hora de ${it.title}`}
            />
          </div>
        ))}
      </Card>
      <p className="mt-1.5 text-xs text-muted">Los cambios aplican todos los días. Las demás horas se recalculan desde tus respuestas.</p>

      {/* Notificaciones */}
      <div id="notificaciones" />
      <SectionTitle>Notificaciones</SectionTitle>
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Estado</span>
          {!status ? (
            <Badge>Comprobando…</Badge>
          ) : !status.push ? (
            <Badge tone="warn">Servidor sin configurar</Badge>
          ) : s.pushEnabled ? (
            <Badge tone="good">Activas en este teléfono</Badge>
          ) : (
            <Badge>Desactivadas</Badge>
          )}
        </div>

        {status && !status.push && (
          <p className="text-sm text-muted">
            Falta conectar Supabase y las claves VAPID en Vercel. Sigue los pasos del archivo <b className="text-fg">README.md</b> (unos 10 minutos, gratis).
          </p>
        )}

        {env.ios && !env.standalone && (
          <p className="rounded-xl bg-warn/10 p-3 text-sm text-warn">
            En iPhone: abre en Safari → Compartir → <b>Añadir a pantalla de inicio</b>, y activa los avisos desde la app instalada (iOS 16.4+).
          </p>
        )}
        {env.android && !env.standalone && (
          <p className="rounded-xl bg-info/10 p-3 text-sm text-info">Recomendado: Chrome → ⋮ → Instalar app. En Samsung/Xiaomi quita el ahorro de batería a Chrome.</p>
        )}

        {status?.push &&
          (s.pushEnabled ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={testPush} disabled={busy}>
                <Send className="h-4 w-4" /> {busy ? "Enviando…" : "Enviar prueba"}
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  await disablePush(s.deviceId);
                  s.setPushEnabled(false);
                  s.setProfile({ remindersEnabled: false });
                }}
              >
                <BellOff className="h-4 w-4" /> Desactivar
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={turnOn} disabled={busy}>
              <Bell className="h-4 w-4" /> {busy ? step ?? "Activando…" : "Activar recordatorios"}
            </Button>
          ))}

        {pushMsg && (
          <p className={`rounded-xl p-3 text-sm ${pushMsg.tone === "good" ? "bg-good/12 text-good" : "bg-bad/12 text-bad"}`}>{pushMsg.text}</p>
        )}

        {diag && (
          <details className="text-xs text-muted">
            <summary className="cursor-pointer">Diagnóstico</summary>
            <ul className="mt-2 space-y-0.5">
              <li>App instalada (pantalla de inicio): {diag.instalada ? "sí" : "no"}</li>
              <li>Service worker: {diag.serviceWorker ? "sí" : "no"}</li>
              <li>Push disponible: {diag.pushManager ? "sí" : "no"}</li>
              <li>Notificaciones disponibles: {diag.notificaciones ? "sí" : "no"}</li>
              <li>Permiso: {diag.permiso}</li>
              <li>Claves configuradas: {diag.clave ? "sí" : "no"}</li>
              <li>Servidor: {status ? (status.push ? "listo" : "sin configurar") : "comprobando…"}</li>
            </ul>
          </details>
        )}

        <div className="divide-y divide-line border-t border-line">
          {REMINDER_KINDS.map((k) => (
            <Toggle
              key={k.id}
              checked={s.profile.reminderKinds[k.id] ?? true}
              onChange={(v) => s.setProfile({ reminderKinds: { ...s.profile.reminderKinds, [k.id]: v } })}
              label={k.label}
              desc={k.desc}
            />
          ))}
        </div>
        <p className="text-xs text-muted">No te avisa de lo que ya marcaste como hecho. En Android puedes tocar «✅ Hecho» o «⏰ En 15 min» desde la notificación.</p>
      </Card>

      <SectionTitle>Apariencia</SectionTitle>
      <Segmented
        value={s.theme}
        onChange={s.setTheme}
        options={[
          { value: "dark", label: "Oscuro" },
          { value: "light", label: "Claro" },
          { value: "system", label: "Automático" },
        ]}
      />

      <SectionTitle>Respaldo en archivo</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={exportFile}>
          <Download className="h-4 w-4" /> Exportar
        </Button>
        <Button variant="secondary" onClick={() => file.current?.click()}>
          <Upload className="h-4 w-4" /> Importar
        </Button>
        <input ref={file} type="file" accept="application/json" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} />
      </div>

      <SectionTitle>Zona de cuidado</SectionTitle>
      <div className="space-y-2">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            s.setProfile({ startDate: dateKey() });
            flash("good", "Plan reiniciado: vuelves a la semana 1 (adaptación).");
          }}
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar plan desde hoy (semana 1)
        </Button>
        <Button variant="danger" className="w-full" onClick={() => setConfirmReset(true)}>
          <Trash2 className="h-4 w-4" /> Borrar mi cuenta y mis datos
        </Button>
      </div>

      <SectionTitle>Créditos</SectionTitle>
      <Card className="space-y-1 text-xs text-muted">
        <p>Fotos de ejercicios: free-exercise-db (dominio público).</p>
        <p>Productos escaneados: Open Food Facts (ODbL).</p>
        <p>Valores nutricionales aproximados basados en USDA FoodData Central. Esta app no sustituye el consejo médico.</p>
        <p>
          <Link href="/legal" className="text-accent-text underline">
            Términos, privacidad y aviso médico
          </Link>
          {" · "}
          <Link href="/salud" className="text-accent-text underline">
            Cuestionario de salud
          </Link>
        </p>
        <p className="pt-1">Hora de dormir actual: {fmt12(s.profile.sleepTime)} · Despertar: {fmt12(s.profile.wakeTime)}</p>
      </Card>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="¿Borrar tu cuenta?">
        <p className="text-sm text-muted">
          Se borran para siempre tu cuenta, tu perfil, registros, entrenamientos y recordatorios, en este teléfono y en el servidor. Exporta un
          respaldo antes si quieres conservar algo. No se puede deshacer.
        </p>
        {deleteError && <p className="mt-3 rounded-xl bg-bad/12 p-3 text-sm text-bad">{deleteError}</p>}
        <Button
          variant="danger"
          className="mt-4 w-full"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setDeleteError(null);
            if (s.pushEnabled) await disablePush(s.deviceId).catch(() => {});
            if (auth === "unconfigured") {
              resetLocal();
              location.assign(`${location.origin}/onboarding`);
              return;
            }
            const r = await deleteAccount();
            setBusy(false);
            if (r.error) setDeleteError(r.error);
            else location.assign(`${location.origin}/login`);
          }}
        >
          {busy ? "Borrando…" : "Sí, borrar mi cuenta"}
        </Button>
      </Sheet>
    </div>
  );
}

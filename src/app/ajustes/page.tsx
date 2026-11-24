"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Cloud, Download, Upload, RotateCcw, Send, Pencil, Trash2, Check } from "lucide-react";
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
  const [code, setCode] = useState(s.syncCode ?? "");
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    serverStatus().then(setStatus);
    setEnv({ ios: isIOS(), android: isAndroid(), standalone: isStandalone(), supported: isPushSupported() });
  }, []);

  const flash = (tone: "good" | "bad", text: string) => {
    setMsg({ tone, text });
    setTimeout(() => setMsg(null), 5000);
  };

  const timeline = buildTimeline(s.profile, dateKey(), { overrides: s.overrides });

  const turnOn = async () => {
    setBusy(true);
    const r = await enablePush(s.deviceId, buildWeeklyReminders(s.profile, s.overrides));
    if (r.ok) {
      s.setPushEnabled(true);
      s.setProfile({ remindersEnabled: true });
      flash("good", "Recordatorios activados. Prueba con «Enviar prueba».");
    } else flash("bad", r.error ?? "No se pudo activar.");
    setBusy(false);
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

  const cloudUpload = async () => {
    if (code.length < 8) return flash("bad", "El código debe tener al menos 8 caracteres.");
    s.setSyncCode(code);
    const r = await fetch("/api/sync", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-sync-code": code },
      body: JSON.stringify(exportableState(useApp.getState())),
    }).catch(() => null);
    if (r?.ok) {
      s.markSynced();
      flash("good", "Copia guardada en la nube. Se actualizará sola.");
    } else flash("bad", (await r?.json().catch(() => null))?.error ?? "No se pudo conectar.");
  };

  const cloudRestore = async () => {
    if (code.length < 8) return flash("bad", "Escribe tu código (mínimo 8 caracteres).");
    const r = await fetch("/api/sync", { headers: { "x-sync-code": code } }).catch(() => null);
    if (!r?.ok) return flash("bad", (await r?.json().catch(() => null))?.error ?? "No se pudo conectar.");
    const { data } = await r.json();
    s.importData({ ...data, deviceId: s.deviceId, pushEnabled: s.pushEnabled, syncCode: code });
    flash("good", "Datos restaurados desde la nube.");
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
              <Button
                variant="secondary"
                onClick={async () => {
                  const r = await sendTestPush(s.deviceId);
                  flash(r.ok ? "good" : "bad", r.ok ? "Enviada. Bloquea el teléfono y espera unos segundos." : r.error ?? "Falló el envío.");
                }}
              >
                <Send className="h-4 w-4" /> Enviar prueba
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
            <Button className="w-full" onClick={turnOn} disabled={busy || (env.ios && !env.supported)}>
              <Bell className="h-4 w-4" /> {busy ? "Activando…" : "Activar recordatorios"}
            </Button>
          ))}

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

      <SectionTitle>Copia en la nube</SectionTitle>
      <Card className="space-y-3">
        <p className="text-sm text-muted">
          Elige un código secreto (mínimo 8 caracteres). Con él recuperas tus datos si cambias de teléfono. Las fotos no se suben.
        </p>
        <Field label="Código de sincronización">
          <input className={inputCls} value={code} onChange={(e) => setCode(e.target.value.trim())} placeholder="Ej.: mi-plan-2026-xyz" autoComplete="off" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={cloudUpload} disabled={!status?.sync}>
            <Cloud className="h-4 w-4" /> Guardar
          </Button>
          <Button variant="secondary" onClick={cloudRestore} disabled={!status?.sync}>
            <Download className="h-4 w-4" /> Restaurar
          </Button>
        </div>
        {s.lastSyncAt && (
          <p className="flex items-center gap-1 text-xs text-good">
            <Check className="h-3.5 w-3.5" /> Última copia: {new Date(s.lastSyncAt).toLocaleString("es-DO")}
          </p>
        )}
        {status && !status.sync && <p className="text-xs text-warn">Disponible cuando conectes Supabase.</p>}
      </Card>

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
          <Trash2 className="h-4 w-4" /> Borrar todos mis datos
        </Button>
      </div>

      <SectionTitle>Créditos</SectionTitle>
      <Card className="space-y-1 text-xs text-muted">
        <p>Fotos de ejercicios: free-exercise-db (dominio público).</p>
        <p>Productos escaneados: Open Food Facts (ODbL).</p>
        <p>Recetas de internet: TheMealDB.</p>
        <p>Valores nutricionales aproximados basados en USDA FoodData Central. Esta app no sustituye el consejo médico.</p>
        <p className="pt-1">Hora de dormir actual: {fmt12(s.profile.sleepTime)} · Despertar: {fmt12(s.profile.wakeTime)}</p>
      </Card>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="¿Borrar todo?">
        <p className="text-sm text-muted">Se borran perfil, registros, entrenamientos y ajustes de este teléfono. Exporta un respaldo antes si lo quieres conservar.</p>
        <Button
          variant="danger"
          className="mt-4 w-full"
          onClick={async () => {
            if (s.pushEnabled) await disablePush(s.deviceId);
            useApp.setState({
              onboarded: false,
              profile: { ...DEFAULT_PROFILE, startDate: dateKey() },
              overrides: {},
              checks: {},
              metrics: {},
              weights: [],
              waists: [],
              workouts: [],
              activeWorkoutId: undefined,
              foodLog: {},
              menuSwaps: {},
              favorites: [],
              savedExternal: [],
              prices: {},
              reviews: [],
              spending: [],
              photos: [],
              shoppingChecked: {},
              pushEnabled: false,
              syncCode: undefined,
              lastSyncAt: undefined,
              calorieHistory: [],
            });
            location.assign(`${location.origin}/onboarding`);
          }}
        >
          Sí, borrar todo
        </Button>
      </Sheet>
    </div>
  );
}

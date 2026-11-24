"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bell, Check, Share, PlusSquare, MoreVertical, Smartphone } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button, Card, Chip, Field, Segmented, Toggle, Badge, inputCls, cx } from "@/components/ui";
import { DayPicker, HeightInput, NumInput, TimeInput } from "@/components/forms";
import { EXCLUDABLE, PANTRY_CHOICES } from "@/data/foods";
import { DURATION_OPTIONS, fmtMinutes } from "@/lib/workout";
import { buildTimeline, buildWeeklyReminders, REMINDER_KINDS } from "@/lib/schedule";
import { menuForDay, targets } from "@/lib/nutrition";
import { GOAL_INFO } from "@/lib/meals";
import { dateKey, fmt12, DAY_NAMES, addDays } from "@/lib/date";
import { Icon } from "@/components/Icon";
import { JourneyPath } from "@/components/JourneyPath";
import { Logo } from "@/components/Logo";
import { HealthStep } from "@/components/HealthStep";
import { MealsPicker } from "@/components/MealsPicker";
import { validateBody, validateGym, validateHealth, validateSchedule, bmi, minHealthyWeightLb, maxGainWeightLb, type Errors } from "@/lib/validation";
import { enablePush, isAndroid, isIOS, isPushSupported, isStandalone, serverStatus } from "@/lib/push-client";
import type { HabitId } from "@/lib/types";

const STEPS = ["Bienvenida", "Tu cuerpo", "Tu salud", "Tu horario", "Gimnasio", "Alimentación", "Hábitos", "Recordatorios", "Resumen"];

const HABITS: { id: HabitId; label: string; desc: string }[] = [
  { id: "agua", label: "Agua al despertar", desc: "Un vaso de agua antes de cualquier otra cosa" },
  { id: "caminar", label: "Caminar todos los días", desc: "Una caminata corta en el trabajo o 30 min libres" },
  { id: "pausas", label: "Pausas activas", desc: "Levantarte cada 2 horas si trabajas sentado" },
  { id: "organizar", label: "Organizar tu espacio", desc: "Tender la cama y ordenar 10 minutos" },
  { id: "desconectar", label: "Tiempo para desconectar", desc: "Un rato sin trabajo ni pantallas" },
  { id: "telefono", label: "Soltar el teléfono antes de dormir", desc: "1 hora antes de acostarte" },
  { id: "pesaje", label: "Pesarte 3 veces por semana", desc: "Lunes, miércoles y viernes en ayunas" },
  { id: "sueno", label: "Registrar tu sueño", desc: "A qué hora dormiste y cómo te sentiste" },
];

export default function Onboarding() {
  const router = useRouter();
  const p = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const finish = useApp((s) => s.finishOnboarding);
  const onboarded = useApp((s) => s.onboarded);
  const overrides = useApp((s) => s.overrides);
  const setOverride = useApp((s) => s.setOverride);
  const deviceId = useApp((s) => s.deviceId);
  const setPushEnabled = useApp((s) => s.setPushEnabled);
  const pushEnabled = useApp((s) => s.pushEnabled);
  const [step, setStep] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const [tried, setTried] = useState(false);
  const errors: Errors =
    step === 0
      ? p.name.trim()
        ? {}
        : { name: "Escribe tu nombre." }
      : step === 1
        ? validateBody(p)
        : step === 2
          ? validateHealth(p)
          : step === 3
            ? validateSchedule(p)
            : step === 4
              ? validateGym(p)
              : {};
  const err = (k: string) =>
    tried && errors[k] ? (
      <p data-error className="mt-1.5 text-[13px] font-medium text-bad">
        {errors[k]}
      </p>
    ) : null;

  const next = () => {
    if (Object.keys(errors).length) {
      setTried(true);
      setTimeout(() => document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setTried(false);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const prev = () => {
    setTried(false);
    setStep((s) => Math.max(0, s - 1));
  };

  const done = () => {
    const bodyErr = Object.keys(validateBody(p)).length > 0;
    if (bodyErr || Object.keys(validateHealth(p)).length) {
      setStep(bodyErr ? 1 : 2);
      setTried(true);
      return;
    }
    finish();
    router.replace("/");
  };


  return (
    <div className="safe-top flex min-h-dvh flex-col pt-4">
      <div className="mb-4 flex items-center gap-3">
        {step > 0 ? (
          <button onClick={prev} className="-ml-2 grid h-10 w-10 place-items-center rounded-full active:bg-surface-2" aria-label="Atrás">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-8" />
        )}
        <div className="flex flex-1 gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={cx("h-1.5 flex-1 rounded-full transition-all duration-500", i <= step ? "grad" : "bg-surface-3")} />
          ))}
        </div>
        {onboarded ? (
          <button onClick={() => router.replace("/ajustes")} className="text-sm text-muted">
            Cerrar
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-text">
        Paso {step + 1} de {STEPS.length} · {STEPS[step]}
      </p>

      <div className="flex-1 py-3">
        {step === 0 && (
          <div className="space-y-5">
            <div className="pt-4">
              <Logo />
            </div>
            <div className="card grad-soft p-5">
              <JourneyPath start={200} goal={170} current={186} />
            </div>
            <h1 className="font-display text-[34px] font-bold leading-[1.05]">
              Tu transformación, <span className="grad-text">paso a paso.</span>
            </h1>
            <p className="text-muted">
              Te haré unas preguntas para armar tu rutina diaria, tu entrenamiento y tu menú. Todo se puede cambiar después en
              Ajustes.
            </p>
            <Field label="¿Cómo te llamas?">
              <input
                className={inputCls}
                value={p.name}
                autoFocus
                placeholder="Tu nombre"
                onChange={(e) => setProfile({ name: e.target.value })}
              />
              {err("name")}
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h1 className="font-display text-[28px] font-bold leading-tight">Tu cuerpo</h1>
            <p className="text-sm text-muted">Con esto calculamos tus calorías, tu proteína y una meta saludable.</p>
            <Field label="¿Cuál es tu objetivo?">
              <div className="grid grid-cols-3 gap-2">
                {(["perder", "mantener", "ganar"] as const).map((g) => {
                  const on = (p.goal ?? "perder") === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setProfile({
                          goal: g,
                          mealsPerDay: undefined,
                          calorieTarget: undefined,
                          ...(g === "mantener" ? { goalWeightLb: p.startWeightLb } : p.goal === "mantener" ? { goalWeightLb: 0 } : {}),
                        })
                      }
                      className={cx(
                        "tap flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition",
                        on ? "border-transparent grad text-accent-ink" : "border-line bg-surface-2",
                      )}
                    >
                      <span className="text-2xl">{GOAL_INFO[g].emoji}</span>
                      <span className="text-[13px] font-semibold leading-tight">{GOAL_INFO[g].label}</span>
                    </button>
                  );
                })}
              </div>
              <span className="mt-1.5 block text-xs text-muted">{GOAL_INFO[p.goal ?? "perder"].desc}.</span>
            </Field>
            <Field label="Sexo">
              <Segmented value={p.sex} onChange={(v) => setProfile({ sex: v })} options={[{ value: "m", label: "Masculino" }, { value: "f", label: "Femenino" }]} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Edad">
                <NumInput value={p.age} onChange={(v) => setProfile({ age: v ?? 0 })} suffix="años" />
                {err("age")}
              </Field>
              <Field label="Nivel">
                <select className={inputCls} value={p.level} onChange={(e) => setProfile({ level: e.target.value as typeof p.level })}>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </Field>
            </div>
            <Field label="Estatura">
              <HeightInput cm={p.heightCm} onChange={(cm) => setProfile({ heightCm: cm })} />
              {err("height")}
            </Field>
            <div className={cx("grid gap-3", (p.goal ?? "perder") !== "mantener" ? "grid-cols-2" : "grid-cols-1")}>
              <Field label="Peso actual">
                <NumInput
                  value={p.startWeightLb}
                  onChange={(v) => setProfile({ startWeightLb: v ?? 0, ...(p.goal === "mantener" ? { goalWeightLb: v ?? 0 } : {}) })}
                  suffix="lb"
                  step={0.1}
                />
                {err("weight")}
              </Field>
              {(p.goal ?? "perder") !== "mantener" && (
                <Field label="Peso meta">
                  <NumInput value={p.goalWeightLb} onChange={(v) => setProfile({ goalWeightLb: v ?? 0 })} suffix="lb" step={0.1} />
                </Field>
              )}
            </div>
            {err("goal")}
            {p.heightCm >= 120 && p.startWeightLb >= 80 && (
              <p className="-mt-1 text-xs text-muted">
                IMC actual {bmi(p.startWeightLb, p.heightCm).toFixed(1)} ·{" "}
                {p.goal === "ganar"
                  ? `meta razonable hasta ${maxGainWeightLb(p.heightCm)} lb. Lo ideal es subir 0.25–0.5 lb por semana para que sea músculo.`
                  : p.goal === "mantener"
                    ? "mantendrás tu peso mientras ganas fuerza y mejoras tu composición."
                    : `meta mínima saludable para tu estatura: ${minHealthyWeightLb(p.heightCm)} lb. Lo recomendable es bajar entre 0.5 y 1 % de tu peso por semana.`}
              </p>
            )}
            <Field label="Medida de cintura (opcional)" hint="A la altura del ombligo, relajado.">
              <NumInput value={p.startWaistIn} onChange={(v) => setProfile({ startWaistIn: v })} suffix="pulg" step={0.25} placeholder="Ej. 40" />
              {err("waist")}
            </Field>
            <Field label="¿Vienes de una pausa de entrenamiento?">
              <Segmented
                value={p.returningFromBreak ? "si" : "no"}
                onChange={(v) => setProfile({ returningFromBreak: v === "si" })}
                options={[
                  { value: "no", label: "No / empiezo" },
                  { value: "si", label: "Sí, retomo" },
                ]}
              />
            </Field>
          </div>
        )}

        {step === 2 && <HealthStep showErrors={tried} />}

        {step === 3 && (
          <div className="space-y-4">
            <h1 className="font-display text-[28px] font-bold leading-tight">Tu horario</h1>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Me levanto a las">
                <TimeInput value={p.wakeTime} onChange={(v) => setProfile({ wakeTime: v })} />
              </Field>
              <Field label="Quiero dormir a las">
                <TimeInput value={p.sleepTime} onChange={(v) => setProfile({ sleepTime: v })} />
              </Field>
            </div>
            <SleepHint wake={p.wakeTime} sleep={p.sleepTime} />
            {err("sleep")}
            <Field label="Días que trabajo">
              <DayPicker value={p.workDays} onChange={(v) => setProfile({ workDays: v })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Entro a trabajar">
                <TimeInput value={p.workStart} onChange={(v) => setProfile({ workStart: v })} />
              </Field>
              <Field label="Salgo del trabajo">
                <TimeInput value={p.workEnd} onChange={(v) => setProfile({ workEnd: v })} />
              </Field>
            </div>
            {err("work")}
            <Field label="En el trabajo estoy…">
              <Segmented
                value={p.workType}
                onChange={(v) => setProfile({ workType: v })}
                options={[
                  { value: "sentado", label: "Sentado" },
                  { value: "mixto", label: "Mixto" },
                  { value: "de pie", label: "De pie" },
                ]}
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h1 className="font-display text-[28px] font-bold leading-tight">Gimnasio</h1>
            <Field label="Días de gimnasio" hint="Las 5 rutinas se reparten en orden en los días que marques.">
              <DayPicker value={p.gymDays} onChange={(v) => setProfile({ gymDays: v })} />
              {err("gym")}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Llego al gym a las">
                <TimeInput value={p.gymTime} onChange={(v) => setProfile({ gymTime: v })} />
              </Field>
              <Field label="Tiempo para entrenar">
                <select className={inputCls} value={p.gymDurationMin} onChange={(e) => setProfile({ gymDurationMin: Number(e.target.value) })}>
                  {DURATION_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {fmtMinutes(m)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="-mt-2 text-xs text-muted">
              {p.gymDurationMin <= 45
                ? "Con poco tiempo hacemos la sesión corta: solo los ejercicios principales."
                : p.gymDurationMin <= 90
                  ? "Tiempo ideal: calentamiento, pesas completas y estiramiento."
                  : p.gymDurationMin < 120
                    ? "El tiempo extra se convierte en cardio de zona 2 al final: más de 75–90 min de pesas rinde poco."
                    : "Sesión extendida: +1 serie en los ejercicios principales, cardio de zona 2 y un bloque de movilidad y abdomen."}
              {p.gymDurationMin > 120 && " Con sesiones tan largas, duerme 7–9 h, come suficiente y respeta los días de descanso."}
            </p>
            <Card className="!p-2">
              <Toggle
                checked={p.saturdayCardio}
                onChange={(v) => setProfile({ saturdayCardio: v })}
                label="Sábado: cardio y movilidad opcional"
                desc="Caminata o bicicleta 30–40 min + estiramientos"
              />
            </Card>
            <Card className="text-sm text-muted">
              Las primeras <b className="text-fg">2 semanas son de adaptación</b>: una serie menos y pesos cómodos,{" "}
              {p.returningFromBreak ? "para que tu cuerpo se readapte después de la pausa." : "para aprender la técnica y que tu cuerpo se acostumbre."}
            </Card>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h1 className="font-display text-[28px] font-bold leading-tight">Alimentación</h1>
            <MealsPicker />
            <Field label="Presupuesto semanal de comida">
              <NumInput value={p.budgetWeekly} onChange={(v) => setProfile({ budgetWeekly: v ?? 0 })} suffix="RD$" step={100} />
            </Field>
            <Field label="No como…">
              <div className="flex flex-wrap gap-2">
                {EXCLUDABLE.map((e) => (
                  <Chip
                    key={e.id}
                    active={p.excludedFoods.includes(e.id)}
                    onClick={() =>
                      setProfile({
                        excludedFoods: p.excludedFoods.includes(e.id) ? p.excludedFoods.filter((x) => x !== e.id) : [...p.excludedFoods, e.id],
                      })
                    }
                  >
                    {p.excludedFoods.includes(e.id) && <Check className="h-4 w-4" />} {e.label}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label="Ya tengo en casa" hint="No se incluirán en la lista de compras.">
              <div className="flex flex-wrap gap-2">
                {PANTRY_CHOICES.map((e) => (
                  <Chip
                    key={e.id}
                    active={p.pantry.includes(e.id)}
                    onClick={() => setProfile({ pantry: p.pantry.includes(e.id) ? p.pantry.filter((x) => x !== e.id) : [...p.pantry, e.id] })}
                  >
                    {p.pantry.includes(e.id) && <Check className="h-4 w-4" />} {e.label}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h1 className="font-display text-[28px] font-bold leading-tight">Tus hábitos</h1>
            <p className="text-sm text-muted">Activa lo que quieras en tu checklist diario.</p>
            <Card className="divide-y divide-line !py-1">
              {HABITS.map((h) => (
                <Toggle
                  key={h.id}
                  checked={p.habits[h.id]}
                  onChange={(v) => setProfile({ habits: { ...p.habits, [h.id]: v } })}
                  label={h.label}
                  desc={h.desc}
                />
              ))}
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Meta de agua">
                <NumInput value={p.waterGoalGlasses} onChange={(v) => setProfile({ waterGoalGlasses: v ?? 8 })} suffix="vasos" />
              </Field>
              <Field label="Meta de pasos">
                <NumInput value={p.stepsGoal} onChange={(v) => setProfile({ stepsGoal: v ?? 8000 })} suffix="pasos" step={500} />
              </Field>
            </div>
          </div>
        )}

        {step === 7 && (
          <RemindersStep
            onEnable={async () => {
              const r = await enablePush(deviceId, buildWeeklyReminders(p, overrides));
              if (r.ok) {
                setPushEnabled(true);
                setProfile({ remindersEnabled: true });
              }
              return r;
            }}
            enabled={pushEnabled}
          />
        )}

        {step === 8 && <Summary overrides={overrides} setOverride={setOverride} />}
      </div>

      <div className="safe-bottom sticky bottom-0 -mx-4 bg-bg/90 px-4 pt-3 backdrop-blur">
        {step < STEPS.length - 1 ? (
          <Button size="lg" className="w-full" onClick={next}>
            {step === 7 && !pushEnabled ? "Ahora no, continuar" : "Continuar"} <ArrowRight className="h-5 w-5" />
          </Button>
        ) : (
          <Button size="lg" className="w-full" onClick={done}>
            {onboarded ? "Guardar cambios" : "¡Empezar!"} <Check className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SleepHint({ wake, sleep }: { wake: string; sleep: string }) {
  const [wh, wm] = wake.split(":").map(Number);
  const [sh, sm] = sleep.split(":").map(Number);
  let mins = wh * 60 + wm - (sh * 60 + sm);
  if (mins <= 0) mins += 1440;
  const h = mins / 60;
  const ok = h >= 7 && h <= 9;
  return (
    <p className={cx("-mt-2 text-xs", ok ? "text-good" : "text-warn")}>
      {ok ? "✓" : "⚠️"} {h.toFixed(1).replace(".0", "")} horas de sueño {ok ? "— perfecto (7–9 h)." : "— la meta es entre 7 y 9 horas."}
    </p>
  );
}

function RemindersStep({ onEnable, enabled }: { onEnable: () => Promise<{ ok: boolean; error?: string }>; enabled: boolean }) {
  const p = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const [status, setStatus] = useState<{ push: boolean } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [env, setEnv] = useState({ ios: false, android: false, standalone: false, supported: false });
  useEffect(() => {
    serverStatus().then(setStatus);
    setEnv({ ios: isIOS(), android: isAndroid(), standalone: isStandalone(), supported: isPushSupported() });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-[28px] font-bold leading-tight">Recordatorios</h1>
      <p className="text-sm text-muted">Te llegan al celular aunque la app esté cerrada y el teléfono bloqueado.</p>

      <Card className="divide-y divide-line !py-1">
        {REMINDER_KINDS.map((k) => (
          <Toggle
            key={k.id}
            checked={p.reminderKinds[k.id] ?? true}
            onChange={(v) => setProfile({ reminderKinds: { ...p.reminderKinds, [k.id]: v } })}
            label={k.label}
            desc={k.desc}
          />
        ))}
      </Card>

      {env.ios && !env.standalone && (
        <Card className="space-y-3 border-warn/40">
          <div className="flex items-center gap-2 font-semibold">
            <Smartphone className="h-5 w-5 text-warn" /> Primero instala la app (iPhone)
          </div>
          <ol className="space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <span className="font-bold text-fg">1.</span> Abre esta página en <b className="text-fg">Safari</b>.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-fg">2.</span> Toca <Share className="inline h-4 w-4 text-info" /> <b className="text-fg">Compartir</b>.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-fg">3.</span> Elige <PlusSquare className="inline h-4 w-4" /> <b className="text-fg">Añadir a pantalla de inicio</b>.
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-fg">4.</span> Abre Journey desde el ícono y activa los recordatorios en Ajustes.
            </li>
          </ol>
          <p className="text-xs text-muted">Necesitas iOS 16.4 o más reciente. Apple solo permite notificaciones a apps instaladas.</p>
        </Card>
      )}

      {env.android && !env.standalone && (
        <Card className="space-y-2 text-sm text-muted">
          <div className="font-semibold text-fg">Recomendado: instala la app</div>
          <p>
            En Chrome toca <MoreVertical className="inline h-4 w-4" /> → <b className="text-fg">Instalar app</b> o <b className="text-fg">Añadir a pantalla de inicio</b>.
          </p>
          <p>
            Si tu teléfono es Samsung, Xiaomi u Oppo: Ajustes → Aplicaciones → Chrome → Batería → <b className="text-fg">Sin restricciones</b>, para que los avisos no se retrasen.
          </p>
        </Card>
      )}

      {status && !status.push ? (
        <Card className="text-sm text-muted">
          <Badge tone="warn">Pendiente</Badge>
          <p className="mt-2">
            Las notificaciones se activan cuando conectes Supabase y las claves en Vercel (las instrucciones están en el README). Mientras, el
            checklist funciona igual dentro de la app.
          </p>
        </Card>
      ) : enabled ? (
        <Card className="flex items-center gap-3 border-good/40">
          <Check className="h-6 w-6 text-good" />
          <div className="text-sm">Recordatorios activados en este teléfono.</div>
        </Card>
      ) : (
        (env.supported || !env.ios) && (
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            disabled={busy || !status}
            onClick={async () => {
              setBusy(true);
              const r = await onEnable();
              setMsg(r.ok ? null : r.error ?? "No se pudo activar");
              setBusy(false);
            }}
          >
            <Bell className="h-5 w-5" /> {busy ? "Activando…" : "Activar recordatorios"}
          </Button>
        )
      )}
      {msg && <p className="text-sm text-bad">{msg}</p>}
    </div>
  );
}

function Summary({ overrides, setOverride }: { overrides: Record<string, string>; setOverride: (id: string, t: string | null) => void }) {
  const p = useApp((s) => s.profile);
  const t = targets(p, p.startWeightLb);
  // Mostramos el próximo día laborable con gimnasio como ejemplo
  const sample = useMemo(() => {
    let k = dateKey();
    for (let i = 0; i < 7; i++) {
      const wd = new Date(k + "T12:00").getDay();
      if (p.gymDays.includes(wd)) break;
      k = addDays(k, 1);
    }
    return k;
  }, [p.gymDays]);
  const tl = buildTimeline(p, sample, { overrides });
  const wd = new Date(sample + "T12:00").getDay();
  const goal = p.goal ?? "perder";
  const diff = Math.abs(p.startWeightLb - p.goalWeightLb);
  const meals = menuForDay(wd, undefined, p, t.kcal);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-[28px] font-bold leading-tight">Tu plan, {p.name || "campeón"}</h1>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs text-muted">Calorías diarias</div>
          <div className="font-display text-3xl font-bold">{t.kcal.toLocaleString("es-DO")}</div>
          <div className="text-xs text-muted">gasto estimado {t.tdee.toLocaleString("es-DO")}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted">Proteína diaria</div>
          <div className="font-display text-3xl font-bold text-accent-text">{t.protein}–{Math.round(t.protein * 1.2)}<span className="text-base"> g</span></div>
          <div className="text-xs text-muted">{goal === "ganar" ? "para construir músculo" : "para conservar músculo"}</div>
        </Card>
      </div>
      <Card className="text-sm text-muted">
        {goal === "perder" && (
          <>
            Meta: bajar <b className="text-fg">{diff} lb</b> a un ritmo de 0.5–1 % de tu peso por semana (déficit moderado del 20 %).
          </>
        )}
        {goal === "ganar" && (
          <>
            Meta: subir <b className="text-fg">{diff} lb</b> poco a poco, 0.25–0.5 lb por semana (10 % más de lo que gastas), para que sea músculo.
          </>
        )}
        {goal === "mantener" && <>Meta: mantener tu peso comiendo lo que gastas, mientras ganas fuerza.</>}{" "}
        Cada 2 semanas la app revisa tu tendencia real y te sugiere ajustar las calorías.
      </Card>

      <div>
        <div className="mb-2 text-sm font-semibold">
          Tus comidas: {meals.length} al día <span className="font-normal text-muted">(porciones ya calculadas)</span>
        </div>
        <Card className="divide-y divide-line !p-0">
          {meals.map((m) => {
            const it = tl.find((x) => x.meal === m.slot);
            return (
              <div key={m.slot} className="flex items-center gap-3 px-3 py-2.5">
                <span className="text-xl">{m.recipe.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{it?.title}</div>
                  <div className="truncate text-xs text-muted">{m.recipe.name}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold">{it ? fmt12(it.time) : ""}</div>
                  <div className="text-muted">
                    {Math.round(m.macros.kcal)} kcal · {Math.round(m.macros.protein)} g
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold">
          Ejemplo: tu {DAY_NAMES[wd].toLowerCase()} <span className="font-normal text-muted">(toca una hora para cambiarla)</span>
        </div>
        <Card className="divide-y divide-line !p-0">
          {tl.map((it) => (
            <div key={it.id} className="flex items-center gap-3 px-3 py-2">
              <Icon name={it.icon} className="h-5 w-5 shrink-0 text-accent-text" />
              <div className="min-w-0 flex-1 truncate text-sm">{it.title}</div>
              <input
                type="time"
                value={it.time}
                onChange={(e) => e.target.value && setOverride(it.id, e.target.value)}
                className="w-[6.5rem] rounded-lg bg-surface-2 px-2 py-1 text-right text-sm"
                aria-label={`Hora de ${it.title}`}
              />
            </div>
          ))}
        </Card>
        <p className="mt-2 text-xs text-muted">
          Horas en formato del teléfono. Ej.: despertar {fmt12(p.wakeTime)}, gimnasio {fmt12(p.gymTime)}.
        </p>
      </div>
    </div>
  );
}


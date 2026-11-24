"use client";

import Link from "next/link";
import { Check, HeartPulse, Lock, ShieldAlert } from "lucide-react";
import { useApp } from "@/lib/store";
import { HEALTH_QUESTIONS, validateHealth } from "@/lib/validation";
import { Card, cx } from "./ui";
import type { HealthScreening } from "@/lib/types";

const EMPTY: HealthScreening = { answers: {}, flagged: false, doctorAck: false, disclaimerAcceptedAt: "", dataConsentAt: undefined };

/** Cuestionario de salud (basado en PAR-Q+) y aceptación del aviso médico. */
export function HealthStep({ showErrors }: { showErrors: boolean }) {
  const p = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const h = p.health ?? EMPTY;
  const questions = HEALTH_QUESTIONS.filter((q) => !q.onlyFemale || p.sex === "f");
  const errors = showErrors ? validateHealth(p) : {};

  const update = (patch: Partial<HealthScreening>) => {
    const next = { ...h, ...patch };
    next.flagged = questions.some((q) => next.answers[q.id]);
    if (!next.flagged) next.doctorAck = false;
    setProfile({ health: next });
  };

  const eatingDisorder = h.answers.alimentacion;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-[28px] font-bold leading-tight">Tu salud</h1>
      <p className="text-sm text-muted">
        Antes de empezar un plan de ejercicio y alimentación, responde con sinceridad. Tus respuestas solo las ves tú.
      </p>

      <div className="space-y-2">
        {questions.map((q) => {
          const v = h.answers[q.id];
          return (
            <Card key={q.id} className="!p-3.5">
              <p className="text-[14px] leading-snug">{q.text}</p>
              <div className="mt-2.5 flex gap-2">
                {[
                  { label: "No", value: false },
                  { label: "Sí", value: true },
                ].map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => update({ answers: { ...h.answers, [q.id]: o.value } })}
                    className={cx(
                      "tap h-10 flex-1 rounded-full border text-sm font-semibold transition",
                      v === o.value
                        ? o.value
                          ? "border-transparent bg-warn text-black"
                          : "border-transparent bg-fg text-bg"
                        : "border-line bg-surface-2 text-muted",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      {errors.answers && (
        <p data-error className="text-[13px] font-medium text-bad">
          {errors.answers}
        </p>
      )}

      {h.flagged && (
        <Card className="space-y-3 border-warn/50">
          <div className="flex items-center gap-2 font-semibold text-warn">
            <ShieldAlert className="h-5 w-5" /> Consulta a tu médico antes de empezar
          </div>
          <p className="text-sm text-muted">
            Por tus respuestas, lo responsable es que un médico revise tu caso antes de empezar el entrenamiento y el déficit de calorías.
            Puedes seguir usando Journey, pero ajusta el plan con lo que te indique.
          </p>
          {eatingDisorder && (
            <p className="rounded-xl bg-warn/10 p-3 text-sm text-warn">
              Contar calorías y pesarse a menudo puede no ser adecuado si tienes o tuviste un trastorno alimentario. Te recomendamos
              hacerlo acompañado de un profesional de salud.
            </p>
          )}
          <CheckRow checked={h.doctorAck} onChange={(v) => update({ doctorAck: v })}>
            He consultado o consultaré con un médico, y asumo la responsabilidad de usar este plan.
          </CheckRow>
          {errors.doctor && (
            <p data-error className="text-[13px] font-medium text-bad">
              {errors.doctor}
            </p>
          )}
        </Card>
      )}

      <Card className="space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <HeartPulse className="h-5 w-5 text-accent-text" /> Aviso importante
        </div>
        <p className="text-sm text-muted">
          Journey da información general sobre ejercicio, alimentación y hábitos. <b className="text-fg">No es consejo médico</b> ni sustituye a un
          médico, nutricionista o entrenador. Las calorías y cantidades son estimaciones. Si sientes dolor en el pecho, mareo o dolor en una
          articulación, detente y busca atención.
        </p>
        <CheckRow
          checked={Boolean(h.disclaimerAcceptedAt)}
          onChange={(v) => update({ disclaimerAcceptedAt: v ? new Date().toISOString() : "" })}
        >
          Entiendo y acepto el aviso, los{" "}
          <Link href="/legal" className="text-accent-text underline" target="_blank">
            términos y la privacidad
          </Link>
          .
        </CheckRow>
        {errors.disclaimer && (
          <p data-error className="text-[13px] font-medium text-bad">
            {errors.disclaimer}
          </p>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <Lock className="h-5 w-5 text-accent-text" /> Tus datos de salud
        </div>
        <p className="text-sm text-muted">
          Tu peso, medidas, respuestas de salud, comidas, sueño y entrenamientos son datos sensibles. Los usamos{" "}
          <b className="text-fg">solo para armar y ajustar tu plan</b>, se guardan en tu cuenta (servidores de Supabase y Vercel en EE. UU.), no se
          venden ni se comparten, y puedes borrarlos cuando quieras desde Ajustes.
        </p>
        <CheckRow checked={Boolean(h.dataConsentAt)} onChange={(v) => update({ dataConsentAt: v ? new Date().toISOString() : undefined })}>
          Autorizo de forma expresa que Journey guarde y use mis datos de salud para estos fines.
        </CheckRow>
        {errors.consent && (
          <p data-error className="text-[13px] font-medium text-bad">
            {errors.consent}
          </p>
        )}
      </Card>
    </div>
  );
}

function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "tap mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition",
          checked ? "grad border-transparent text-accent-ink" : "border-line-strong",
        )}
      >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>
      <span className="text-sm leading-snug">{children}</span>
    </label>
  );
}

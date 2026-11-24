"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, ShieldAlert, Ban, Info } from "lucide-react";
import { useApp } from "@/lib/store";
import { useCurrentWeight, useTargets } from "@/lib/hooks";
import { menuForDay } from "@/lib/nutrition";
import { SUPPLEMENTS, NOT_NEEDED, doctorFlags, type Supplement } from "@/data/supplements";
import { PageHeader, Card, Badge, SectionTitle, cx } from "@/components/ui";

const VERDICT: Record<Supplement["verdict"], { label: string; tone: "good" | "info" | "neutral" }> = {
  recomendado: { label: "Recomendado", tone: "good" },
  util: { label: "Útil", tone: "info" },
  "segun-caso": { label: "Según tu caso", tone: "neutral" },
};

export default function Suplementos() {
  const profile = useApp((s) => s.profile);
  const swaps = useApp((s) => s.menuSwaps);
  const setProfile = useApp((s) => s.setProfile);
  const t = useTargets();
  const { trend } = useCurrentWeight();
  const kg = (trend || profile.startWeightLb || 160) * 0.4536;
  const [open, setOpen] = useState<string | null>("creatina");
  const taking = profile.supplements ?? {};

  // ¿Cuánta proteína aporta el menú? Así sabemos si el batido hace falta.
  const menuProtein = useMemo(() => {
    let sum = 0;
    for (let d = 0; d < 7; d++) sum += menuForDay(d, swaps[d], profile, t.kcal).reduce((a, m) => a + m.macros.protein, 0);
    return Math.round(sum / 7);
  }, [profile, swaps, t.kcal]);
  const gap = Math.max(0, t.protein - menuProtein);

  const toggle = (id: string) => setProfile({ supplements: { ...taking, [id]: !taking[id] } });

  return (
    <div>
      <PageHeader title="Suplementos" subtitle="Solo lo que tiene respaldo científico" back />

      <Card className="grad-soft space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <Info className="h-5 w-5 text-accent-text" /> Primero la comida
        </div>
        <p className="text-sm text-fg/85">
          Los suplementos aportan quizás un 5 % del resultado. Comer tu meta de proteína, entrenar con constancia y dormir bien es el otro 95 %.
          Marca los que tomas y Journey te los recuerda a su hora.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div className="rounded-xl bg-surface-2 p-2">
            <div className="text-lg font-bold">{t.protein} g</div>
            <div className="text-[11px] text-muted">tu meta de proteína</div>
          </div>
          <div className="rounded-xl bg-surface-2 p-2">
            <div className="text-lg font-bold">{menuProtein} g</div>
            <div className="text-[11px] text-muted">aporta tu menú (promedio)</div>
          </div>
        </div>
        <p className="text-xs text-muted">
          {gap >= 20
            ? `Te faltan unos ${gap} g al día: un batido de proteína (${Math.max(1, Math.round(gap / 25))} scoop) o más proteína en tus comidas lo cubre.`
            : "Tu menú ya cubre tu proteína: el batido es opcional, solo por comodidad."}
        </p>
      </Card>

      <SectionTitle>Qué tomar</SectionTitle>
      <div className="space-y-2">
        {SUPPLEMENTS.map((s) => {
          const v = VERDICT[s.verdict];
          const isOpen = open === s.id;
          const flags = doctorFlags(profile, s);
          const on = Boolean(taking[s.id]);
          return (
            <Card key={s.id} className="!p-0">
              <button type="button" onClick={() => setOpen(isOpen ? null : s.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className="text-2xl">{s.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{s.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone={v.tone}>{v.label}</Badge>
                    {on && <Badge tone="accent">La tomo</Badge>}
                    {flags.length > 0 && <Badge tone="warn">Consulta antes</Badge>}
                  </div>
                </div>
                <ChevronDown className={cx("h-5 w-5 text-muted transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-line p-4 text-sm">
                  <p className="text-fg/85">{s.what}</p>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted">Tu dosis</div>
                    <div className="mt-0.5 font-semibold">{s.dose(profile, kg)}</div>
                    <div className="mt-1 text-xs text-muted">{s.when}</div>
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-muted">
                    {s.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                  <p className={cx("flex gap-2 rounded-xl p-3 text-xs", flags.length ? "bg-warn/10 text-warn" : "bg-surface-2 text-muted")}>
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>
                      {flags.length ? "Por tus respuestas de salud, consulta a tu médico antes de tomarlo. " : ""}
                      {s.caution}
                    </span>
                  </p>
                  <a href={s.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent-text underline">
                    {s.source.label} <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={cx(
                      "tap h-11 w-full rounded-full text-sm font-semibold transition",
                      on ? "border border-line bg-surface-2 text-fg" : "grad text-accent-ink",
                    )}
                  >
                    {on ? "Ya no lo tomo" : "Lo tomo: recuérdamelo"}
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <SectionTitle>No hace falta gastar en</SectionTitle>
      <Card className="space-y-2.5">
        {NOT_NEEDED.map((n) => (
          <div key={n.name} className="flex gap-2.5 text-sm">
            <Ban className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
            <div>
              <b>{n.name}:</b> <span className="text-muted">{n.why}</span>
            </div>
          </div>
        ))}
      </Card>

      <p className="mt-4 text-xs text-muted">
        Información general, no consejo médico. Los suplementos no están regulados como los medicamentos: compra marcas con sello de calidad (NSF
        Certified for Sport, Informed Choice) y consulta a tu médico si tienes alguna condición o tomas medicamentos.
      </p>
    </div>
  );
}

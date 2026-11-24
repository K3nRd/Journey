"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, FlaskConical } from "lucide-react";
import { GUIDE, type GuideItem } from "@/data/guide";
import { PageHeader, Card, Chip, Badge, cx } from "@/components/ui";

const STRENGTH: Record<GuideItem["strength"], { label: string; tone: "good" | "info" | "neutral" }> = {
  fuerte: { label: "Evidencia fuerte", tone: "good" },
  moderada: { label: "Evidencia moderada", tone: "info" },
  orientativa: { label: "Orientativa", tone: "neutral" },
};

export default function Guia() {
  const [section, setSection] = useState<string>("todo");
  const [open, setOpen] = useState<string | null>(null);
  const sections = GUIDE.filter((s) => section === "todo" || s.id === section);

  return (
    <div>
      <PageHeader title="Guía de salud" subtitle="Lo que dice la ciencia, en simple" back="/mas" />

      <Card className="grad-soft flex gap-3">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" />
        <p className="text-sm text-fg/85">
          Recomendaciones de la OMS, sociedades médicas y revisiones científicas recientes. Toca cada tema para ver qué hacer, cómo lo aplica
          Journey y la fuente original.
        </p>
      </Card>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        <Chip active={section === "todo"} onClick={() => setSection("todo")}>
          Todo
        </Chip>
        {GUIDE.map((s) => (
          <Chip key={s.id} active={section === s.id} onClick={() => setSection(s.id)}>
            {s.title}
          </Chip>
        ))}
      </div>

      {sections.map((s) => (
        <section key={s.id} className="mt-6">
          <h2 className="font-display mb-3 text-lg font-bold">{s.title}</h2>
          <div className="space-y-2.5">
            {s.items.map((it) => {
              const isOpen = open === it.id;
              const st = STRENGTH[it.strength];
              return (
                <div key={it.id} className="card overflow-hidden !p-0">
                  <button
                    onClick={() => setOpen(isOpen ? null : it.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-2xl">{it.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold">{it.title}</span>
                      <span
                        className={cx(
                          "font-display block text-[17px] font-bold leading-tight",
                          s.tone === "food" ? "text-food" : s.tone === "violet" ? "text-violet" : "text-accent-text",
                        )}
                      >
                        {it.number}
                      </span>
                    </span>
                    <ChevronDown className={cx("h-5 w-5 shrink-0 text-muted transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t border-line p-4 text-sm leading-relaxed">
                      <p className="text-fg/85">{it.what}</p>
                      <div className="rounded-2xl bg-surface-2 p-3">
                        <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">Qué hacer</div>
                        <p>{it.how}</p>
                      </div>
                      <div className="rounded-2xl bg-accent-soft p-3">
                        <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-text">En Journey</div>
                        <p>{it.journey}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge tone={st.tone}>{st.label}</Badge>
                        <a href={it.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-muted underline underline-offset-2">
                          {it.source.label} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="mt-6 text-center text-xs text-muted">Información general, no sustituye el consejo de tu médico. Revisada en noviembre de 2026.</p>
    </div>
  );
}

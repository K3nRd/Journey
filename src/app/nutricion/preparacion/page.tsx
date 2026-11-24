"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { useTargets } from "@/lib/hooks";
import { menuForDay, rawGrams, type PlannedMeal } from "@/lib/nutrition";
import { FOOD } from "@/data/foods";
import { PageHeader, Card, SectionTitle } from "@/components/ui";

// Cocinar el domingo para lunes–miércoles y repetir el miércoles para jueves–sábado.
const PREP_FOODS = ["arroz", "habichuelas", "lentejas", "pechuga", "muslo", "huevo", "batata", "yuca"];

export default function Preparacion() {
  const profile = useApp((s) => s.profile);
  const swaps = useApp((s) => s.menuSwaps);
  const t = useTargets();

  const calc = (days: number[]) => {
    const meals: PlannedMeal[] = days.flatMap((d) => menuForDay(d, swaps[d], profile, t.kcal));
    const tot: Record<string, number> = {};
    for (const m of meals)
      for (const i of m.recipe.ingredients) if (PREP_FOODS.includes(i.food)) tot[i.food] = (tot[i.food] ?? 0) + i.g * m.scale;
    return tot;
  };
  const a = useMemo(() => calc([1, 2, 3]), [profile, swaps, t.kcal]); // eslint-disable-line react-hooks/exhaustive-deps
  const b = useMemo(() => calc([4, 5, 6]), [profile, swaps, t.kcal]); // eslint-disable-line react-hooks/exhaustive-deps

  const line = (id: string, g: number) => {
    const f = FOOD[id];
    const raw = rawGrams(f, g);
    if (id === "arroz") return `Arroz: ${Math.round(raw)} g crudo (~${(raw / 200).toFixed(1)} tazas) → ${Math.round(g)} g cocido`;
    if (id === "habichuelas") return `Habichuelas: ${Math.round(raw)} g secas (~${(raw / 454).toFixed(2)} lb) → ${Math.round(g)} g cocidas`;
    if (id === "lentejas") return `Lentejas: ${Math.round(raw)} g secas → ${Math.round(g)} g cocidas`;
    if (id === "huevo") return `Huevos duros: ${Math.round(g / 50)} unidades (si los usas hervidos)`;
    if (id === "pechuga") return `Pechuga: ${(g / 454).toFixed(2)} lb para adobar`;
    if (id === "muslo") return `Muslos sin piel: ${(g / 454).toFixed(2)} lb (carne) para adobar`;
    return `${f.name}: ${Math.round(g)} g`;
  };

  return (
    <div>
      <PageHeader title="Preparar comidas" subtitle="Cocina 1–2 horas y ahorra toda la semana" back="/nutricion" />
      <Block title="Domingo → para lunes, martes y miércoles" tot={a} line={line} />
      <div className="h-3" />
      <Block title="Miércoles → para jueves, viernes y sábado" tot={b} line={line} />

      <SectionTitle>Paso a paso (90 minutos)</SectionTitle>
      <Card>
        <ol className="space-y-3 text-sm">
          {[
            ["0:00", "Pon las habichuelas (remojadas desde la noche) en la olla de presión con sal, ajo y cebolla: 35–40 min."],
            ["0:05", "Adoba todo el pollo con ajo, limón, orégano, sal y sazón. Divide en fundas por porción."],
            ["0:15", "Cocina el arroz de la semana: 1 taza cruda con 2 tazas de agua y un chorrito de aceite."],
            ["0:20", "Hierve los huevos 10 minutos y pásalos por agua fría."],
            ["0:30", "Hierve batata y yuca en cubos (15–25 min). Escurre y enfría."],
            ["0:45", "Cocina 2–3 porciones de pollo para lunes y martes (a la plancha o guisado)."],
            ["1:15", "Guisa las habichuelas ya blandas con sofrito de ají, cebolla y cilantro."],
            ["1:30", "Reparte en envases. Deja en la nevera lo de 3 días; congela el resto de pollo crudo adobado."],
          ].map(([t, s]) => (
            <li key={t} className="flex gap-3">
              <span className="w-10 shrink-0 font-mono text-xs text-accent-text">{t}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Card>

      <SectionTitle>Cuánto dura en la nevera</SectionTitle>
      <Card className="space-y-1.5 text-sm text-muted">
        <p>🍚 Arroz cocido: 3–4 días (enfríalo rápido, no lo dejes fuera más de 1 hora).</p>
        <p>🥘 Habichuelas guisadas: 4 días · se congelan hasta 2 meses.</p>
        <p>🍗 Pollo cocido: 3–4 días · crudo adobado congelado: 2–3 meses.</p>
        <p>🥚 Huevos duros con cáscara: 5–7 días.</p>
        <p>🍠 Víveres hervidos: 3–4 días.</p>
      </Card>
    </div>
  );
}

function Block({ title, tot, line }: { title: string; tot: Record<string, number>; line: (id: string, g: number) => string }) {
  return (
    <Card>
      <div className="mb-2 font-semibold">{title}</div>
      <ul className="space-y-1.5 text-sm">
        {Object.entries(tot).map(([id, g]) => (
          <li key={id} className="flex gap-2">
            <span className="text-accent-text">•</span> {line(id, g)}
          </li>
        ))}
      </ul>
    </Card>
  );
}

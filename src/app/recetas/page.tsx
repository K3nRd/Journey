"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { RECIPES } from "@/data/recipes";
import { FOOD, FOODS } from "@/data/foods";
import { useApp } from "@/lib/store";
import { recipeMacros, excludedFoodIds, recipeAllowed } from "@/lib/nutrition";
import { recipeCost, matchRecipe } from "@/lib/recipes-search";
import { PageHeader, Chip, Card, Segmented, SectionTitle, Badge, inputCls } from "@/components/ui";

type Filter = "comida1" | "merienda" | "cena" | "kcal" | "prot" | "rapido" | "barato" | "fav";

export default function Recetas() {
  const profile = useApp((s) => s.profile);
  const favorites = useApp((s) => s.favorites);
  const prices = useApp((s) => s.prices);
  const [mode, setMode] = useState<"buscar" | "tengo">("buscar");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [have, setHave] = useState<string[]>([]);
  const excluded = excludedFoodIds(profile);
  const tog = (f: Filter) => setFilters((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]));

  const results = useMemo(() => {
    let list = RECIPES.filter((r) => recipeAllowed(r, excluded)).map((r) => ({
      r,
      m: recipeMacros(r),
      cost: recipeCost(r, prices),
      cover: 0,
    }));
    if (mode === "buscar") {
      list = list.filter(({ r, m, cost }) => {
        if (!matchRecipe(r, q)) return false;
        for (const f of filters) {
          if ((f === "comida1" || f === "merienda" || f === "cena") && !r.slots.includes(f)) return false;
          if (f === "kcal" && m.kcal > 500) return false;
          if (f === "prot" && m.protein < 40) return false;
          if (f === "rapido" && r.minutes > 20) return false;
          if (f === "barato" && cost > 100) return false;
          if (f === "fav" && !favorites.includes(r.id)) return false;
        }
        return true;
      });
    } else {
      if (!have.length) return [];
      list = list
        .map((x) => {
          const main = x.r.ingredients.filter((i) => !FOOD[i.food]?.seasoning);
          const ok = main.filter((i) => have.includes(i.food)).length;
          return { ...x, cover: ok / main.length };
        })
        .filter((x) => x.cover > 0.3)
        .sort((a, b) => b.cover - a.cover);
    }
    return list;
  }, [q, filters, mode, have, favorites, prices, excluded]);

  const googleQ = encodeURIComponent(`receta ${q || have.map((h) => FOOD[h].name).join(" ")} saludable dominicana`);
  const ingredientChoices = FOODS.filter((f) => !f.seasoning && f.id !== "sazon");

  return (
    <div>
      <PageHeader title="Recetas" subtitle={`${RECIPES.length} recetas dominicanas incluidas`} back="/nutricion" />
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: "buscar", label: "Buscar" },
          { value: "tengo", label: "¿Qué cocino con lo que tengo?" },
        ]}
      />

      {mode === "buscar" ? (
        <>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Ej.: pollo yuca, avena, rápido…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
              }}
            />
          </div>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
            {(
              [
                ["fav", "★ Favoritas"],
                ["comida1", "Primera comida"],
                ["merienda", "Merienda"],
                ["cena", "Cena"],
                ["prot", "≥40 g proteína"],
                ["kcal", "≤500 kcal"],
                ["rapido", "≤20 min"],
                ["barato", "≤RD$100"],
              ] as [Filter, string][]
            ).map(([f, l]) => (
              <Chip key={f} active={filters.includes(f)} onClick={() => tog(f)}>
                {l}
              </Chip>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-3">
          <p className="mb-2 text-sm text-muted">Marca lo que tienes en la nevera o la despensa:</p>
          <div className="flex flex-wrap gap-2">
            {ingredientChoices.map((f) => (
              <Chip key={f.id} active={have.includes(f.id)} onClick={() => setHave((h) => (h.includes(f.id) ? h.filter((x) => x !== f.id) : [...h, f.id]))}>
                {f.name.replace(/ \(.+\)/, "")}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {results.map(({ r, m, cost, cover }) => (
          <Link key={r.id} href={`/recetas/${r.id}`} className="card flex items-center gap-3 !p-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-2 text-2xl">{r.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-snug">
                {favorites.includes(r.id) && <Star className="mr-1 inline h-3.5 w-3.5 fill-warn text-warn" />}
                {r.name}
              </div>
              <div className="text-xs text-muted">
                {Math.round(m.kcal)} kcal · <span className="text-accent-text">{Math.round(m.protein)} g prot</span> · {r.minutes} min · RD${cost}
              </div>
            </div>
            {mode === "tengo" && <Badge tone={cover === 1 ? "good" : "neutral"}>{Math.round(cover * 100)}%</Badge>}
          </Link>
        ))}
        {results.length === 0 && (mode === "buscar" || have.length > 0) && (
          <Card className="text-center text-sm text-muted">No hay recetas incluidas que coincidan. Prueba con otra palabra o busca en Google 👇</Card>
        )}
      </div>

      <SectionTitle>¿No encuentras lo que buscas?</SectionTitle>
      <a
        href={`https://www.google.com/search?q=${googleQ}`}
        target="_blank"
        rel="noreferrer"
        className="tap flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface-2 text-sm font-medium"
      >
        <Search className="h-4 w-4" /> Buscar recetas en Google
      </a>
      <p className="mt-2 text-xs text-muted">Calcula las porciones de recetas de internet con «Registro → Con la mano».</p>
    </div>
  );
}


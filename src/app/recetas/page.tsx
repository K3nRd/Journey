"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Globe, Search, Star, ExternalLink, Loader2, Languages, AlertTriangle, Trash2 } from "lucide-react";
import { RECIPES } from "@/data/recipes";
import { FOOD, FOODS } from "@/data/foods";
import { useApp } from "@/lib/store";
import { recipeMacros, excludedFoodIds, recipeAllowed } from "@/lib/nutrition";
import { recipeCost, matchRecipe, toEnglish, externalWarnings } from "@/lib/recipes-search";
import { PageHeader, Chip, Card, Button, Segmented, Sheet, SectionTitle, Badge, inputCls, cx } from "@/components/ui";

type Filter = "comida1" | "merienda" | "cena" | "kcal" | "prot" | "rapido" | "barato" | "fav";

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strSource?: string;
  strYoutube?: string;
  [k: string]: string | undefined;
}

export default function Recetas() {
  const profile = useApp((s) => s.profile);
  const favorites = useApp((s) => s.favorites);
  const prices = useApp((s) => s.prices);
  const saved = useApp((s) => s.savedExternal);
  const removeExternal = useApp((s) => s.removeExternal);
  const [mode, setMode] = useState<"buscar" | "tengo">("buscar");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [have, setHave] = useState<string[]>([]);
  const [web, setWeb] = useState<MealDBMeal[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
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

  const searchWeb = async () => {
    const term = toEnglish(q || (mode === "tengo" && have[0] ? FOOD[have[0]].name : "chicken"));
    setLoading(true);
    try {
      const r = await fetch(`/api/mealdb?q=${encodeURIComponent(term)}`);
      const j = await r.json();
      let meals: MealDBMeal[] = j.meals ?? [];
      if (!meals.length) {
        const r2 = await fetch(`/api/mealdb?i=${encodeURIComponent(term.replace(/ /g, "_"))}`);
        meals = (await r2.json()).meals ?? [];
      }
      setWeb(meals.slice(0, 20));
    } catch {
      setWeb([]);
    }
    setLoading(false);
  };

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
                setWeb(null);
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
          <Card className="text-center text-sm text-muted">No hay recetas incluidas que coincidan. Prueba en internet 👇</Card>
        )}
      </div>

      <SectionTitle>Buscar en internet (gratis)</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={searchWeb} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />} TheMealDB
        </Button>
        <a href={`https://www.google.com/search?q=${googleQ}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 text-sm">
          <Search className="h-4 w-4" /> Google
        </a>
      </div>
      <p className="mt-1.5 text-xs text-muted">TheMealDB tiene miles de recetas en inglés (pocas caribeñas). Te avisamos si llevan algo que no comes.</p>

      {web && (
        <div className="mt-3 space-y-2">
          {web.length === 0 && <Card className="text-sm text-muted">Sin resultados para «{toEnglish(q)}». Prueba otra palabra (pollo, res, avena…).</Card>}
          {web.map((m) => (
            <button key={m.idMeal} onClick={() => setOpen(m.idMeal)} className="card flex w-full items-center gap-3 !p-2.5 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.strMealThumb && <img src={`${m.strMealThumb}/preview`} alt="" className="h-14 w-14 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{m.strMeal}</div>
                <div className="text-xs text-muted">{[m.strArea, m.strCategory].filter(Boolean).join(" · ") || "Ver receta"}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {saved.length > 0 && (
        <>
          <SectionTitle>Guardadas de internet</SectionTitle>
          <div className="space-y-2">
            {saved.map((s) => (
              <div key={s.id} className="card flex items-center gap-3 !p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.thumb && <img src={`${s.thumb}/preview`} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                <button className="min-w-0 flex-1 text-left text-sm font-semibold" onClick={() => setOpen(s.id)}>
                  {s.name}
                </button>
                <button onClick={() => removeExternal(s.id)} className="grid h-9 w-9 place-items-center text-muted" aria-label="Quitar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <MealDBSheet id={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function MealDBSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [meal, setMeal] = useState<MealDBMeal | null>(null);
  const profile = useApp((s) => s.profile);
  const saved = useApp((s) => s.savedExternal);
  const saveExternal = useApp((s) => s.saveExternal);
  const removeExternal = useApp((s) => s.removeExternal);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetch(`/api/mealdb?id=${id}`)
      .then((r) => r.json())
      .then((j) => alive && setMeal(j.meals?.[0] ?? null))
      .catch(() => alive && setMeal(null));
    return () => {
      alive = false;
      setMeal(null);
    };
  }, [id]);

  const ingredients: string[] = [];
  if (meal)
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`]?.trim();
      if (ing) ingredients.push(`${meal[`strMeasure${i}`]?.trim() ?? ""} ${ing}`.trim());
    }
  const warnings = meal ? externalWarnings(ingredients, profile.excludedFoods) : [];
  const isSaved = saved.some((s) => s.id === id);
  const translate = meal
    ? `https://translate.google.com/?sl=en&tl=es&op=translate&text=${encodeURIComponent(
        `${meal.strMeal}\n\n${ingredients.join("\n")}\n\n${meal.strInstructions ?? ""}`.slice(0, 4500),
      )}`
    : "#";

  return (
    <Sheet open={Boolean(id)} onClose={onClose} title={meal?.strMeal ?? "Cargando…"}>
      {!meal ? (
        <div className="grid h-40 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {meal.strMealThumb && <img src={meal.strMealThumb} alt="" className="aspect-video w-full rounded-2xl object-cover" />}
          {warnings.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-warn/15 p-3 text-sm text-warn">
              <AlertTriangle className="h-4 w-4" /> {warnings.join(" · ")}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isSaved ? "primary" : "secondary"}
              onClick={() =>
                isSaved
                  ? removeExternal(meal.idMeal)
                  : saveExternal({ id: meal.idMeal, name: meal.strMeal, thumb: meal.strMealThumb, source: "mealdb", url: meal.strSource })
              }
            >
              <Star className={cx("h-4 w-4", isSaved && "fill-current")} /> {isSaved ? "Guardada" : "Guardar"}
            </Button>
            <a href={translate} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 text-sm">
              <Languages className="h-4 w-4" /> Traducir
            </a>
            {meal.strYoutube && (
              <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 text-sm">
                <ExternalLink className="h-4 w-4" /> Video
              </a>
            )}
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold">Ingredientes</h4>
            <ul className="grid grid-cols-1 gap-1 text-sm text-fg/90">
              {ingredients.map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold">Preparación (inglés)</h4>
            <p className="whitespace-pre-line text-sm text-fg/90">{meal.strInstructions}</p>
          </div>
          <p className="text-xs text-muted">Las calorías de recetas de internet no están calculadas. Usa la porción con la mano en Registro.</p>
        </div>
      )}
    </Sheet>
  );
}

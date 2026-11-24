"use client";

import { useState } from "react";
import { Moon, Plus, Trash2, Utensils, Hand, ScanBarcode, PencilLine } from "lucide-react";
import { EMPTY_OBJ, EMPTY_ARR, useApp } from "@/lib/store";
import { useTargets } from "@/lib/hooks";
import { addDays, dateKey, fmtDate } from "@/lib/date";
import { EAT_OUT, PORTIONS, type QuickFood } from "@/data/extras";
import { PageHeader, Card, Bar, Button, Sheet, Segmented, SectionTitle, Scale, Field, inputCls, cx } from "@/components/ui";
import { TimeInput } from "@/components/forms";
import { Scanner, type ScannedProduct } from "@/components/Scanner";
import { toggleItem } from "@/lib/actions";
import type { FoodEntry } from "@/lib/types";

export default function Registro() {
  const [date, setDate] = useState(dateKey());
  const log = useApp((s) => s.foodLog[date] ?? EMPTY_ARR);
  const addFood = useApp((s) => s.addFood);
  const removeFood = useApp((s) => s.removeFood);
  const t = useTargets();
  const [sheet, setSheet] = useState(false);
  const kcal = log.reduce((a, e) => a + e.kcal, 0);
  const prot = log.reduce((a, e) => a + e.protein, 0);

  return (
    <div>
      <PageHeader title="Registro" subtitle={fmtDate(date)} back="/nutricion" />
      <div className="mb-3 flex gap-2">
        {[-2, -1, 0].map((d) => {
          const k = addDays(dateKey(), d);
          return (
            <button key={d} onClick={() => setDate(k)} className={cx("h-9 flex-1 rounded-xl border text-sm", date === k ? "border-accent bg-accent-soft" : "border-line bg-surface")}>
              {d === 0 ? "Hoy" : d === -1 ? "Ayer" : fmtDate(k, false)}
            </button>
          );
        })}
      </div>

      <Card>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-muted">Calorías</div>
            <div className="text-2xl font-bold">
              {kcal.toLocaleString("es-DO")} <span className="text-sm font-normal text-muted">/ {t.kcal.toLocaleString("es-DO")}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted">Proteína</div>
            <div className="text-2xl font-bold text-accent-text">
              {prot} <span className="text-sm font-normal text-muted">/ {t.protein} g</span>
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Bar value={kcal / t.kcal} tone="warn" />
          <Bar value={prot / t.protein} />
        </div>
        <p className="mt-2 text-xs text-muted">
          {kcal > t.kcal + 200
            ? "Te pasaste un poco hoy. No pasa nada: mañana sigue el plan normal, sin compensar."
            : t.kcal - kcal > 0
              ? `Te quedan ${(t.kcal - kcal).toLocaleString("es-DO")} kcal.`
              : "¡Meta del día cumplida!"}
        </p>
      </Card>

      <SectionTitle action={<Button size="sm" onClick={() => setSheet(true)}><Plus className="h-4 w-4" /> Añadir</Button>}>Lo que comiste</SectionTitle>
      {log.length === 0 ? (
        <Card className="text-sm text-muted">Marca tus comidas del plan en el inicio o añade lo que comiste fuera.</Card>
      ) : (
        <Card className="divide-y divide-line !py-1">
          {log.map((e) => (
            <div key={e.id} className="flex items-center gap-3 py-2.5">
              <span className="text-lg">{iconFor(e)}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{e.name}</div>
                <div className="text-xs text-muted">
                  {e.kcal} kcal · {e.protein} g proteína
                </div>
              </div>
              <button onClick={() => removeFood(date, e.id)} className="grid h-8 w-8 place-items-center text-muted" aria-label="Eliminar">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </Card>
      )}

      <SleepCard date={date} />

      <AddSheet open={sheet} onClose={() => setSheet(false)} onAdd={(e) => addFood(date, e)} />
    </div>
  );
}

const iconFor = (e: FoodEntry) => ({ plan: "✅", fuera: "🍽️", porcion: "✋", escaner: "🏷️", manual: "✏️" })[e.source];

function AddSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (e: Omit<FoodEntry, "id">) => void }) {
  const [tab, setTab] = useState<"fuera" | "porcion" | "escaner" | "manual">("fuera");
  const [tip, setTip] = useState<QuickFood | null>(null);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [grams, setGrams] = useState("100");
  const [manual, setManual] = useState({ name: "", kcal: "", protein: "" });
  const [added, setAdded] = useState<string | null>(null);

  const quick = (f: QuickFood, source: FoodEntry["source"]) => {
    onAdd({ name: `${f.name} (${f.portion})`, kcal: f.kcal, protein: f.protein, source });
    setAdded(f.name);
    if (f.tip) setTip(f);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Añadir comida">
      <div className="no-scrollbar -mx-1 mb-3 flex gap-1 overflow-x-auto">
        {(
          [
            ["fuera", "Comí fuera", Utensils],
            ["porcion", "Con la mano", Hand],
            ["escaner", "Escanear", ScanBarcode],
            ["manual", "Manual", PencilLine],
          ] as const
        ).map(([k, l, I]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm", tab === k ? "grad text-accent-ink" : "bg-surface-2 text-muted")}>
            <I className="h-4 w-4" /> {l}
          </button>
        ))}
      </div>
      {added && <div className="mb-2 rounded-xl bg-good/15 p-2 text-center text-sm text-good">✓ {added} añadido</div>}
      {tip && <div className="mb-2 rounded-xl bg-info/10 p-3 text-sm text-info">💡 La próxima vez: {tip.tip}</div>}

      {tab === "fuera" && (
        <div className="space-y-1.5">
          {EAT_OUT.map((f) => (
            <button key={f.id} onClick={() => quick(f, "fuera")} className="flex w-full items-center gap-3 rounded-xl bg-surface-2 p-2.5 text-left">
              <span className="text-2xl">{f.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{f.name}</span>
                <span className="text-xs text-muted">{f.portion}</span>
              </span>
              <span className="text-right text-xs">
                <b>{f.kcal}</b> kcal
                <br />
                <span className="text-accent-text">{f.protein} g</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === "porcion" && (
        <div>
          <p className="mb-2 text-sm text-muted">Sin pesar nada: usa tu mano como medida.</p>
          <div className="grid grid-cols-2 gap-2">
            {PORTIONS.map((f) => (
              <button key={f.id} onClick={() => quick(f, "porcion")} className="rounded-xl bg-surface-2 p-3 text-left">
                <div className="text-2xl">{f.emoji}</div>
                <div className="text-sm font-semibold">{f.name}</div>
                <div className="text-[11px] text-muted">{f.portion}</div>
                <div className="mt-1 text-xs">
                  {f.kcal} kcal · <span className="text-accent-text">{f.protein} g</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "escaner" &&
        (product ? (
          <div className="space-y-3">
            <Card className="!p-3">
              <div className="font-semibold">{product.name}</div>
              <div className="text-xs text-muted">
                Por 100 g: {Math.round(product.kcal100)} kcal · {product.protein100} g proteína
                {product.serving && ` · porción: ${product.serving}`}
              </div>
            </Card>
            <Field label="¿Cuántos gramos comiste?">
              <input className={inputCls} type="number" inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} />
            </Field>
            <Button
              className="w-full"
              onClick={() => {
                const g = Number(grams) || 0;
                onAdd({
                  name: `${product.name} (${g} g)`,
                  kcal: Math.round((product.kcal100 * g) / 100),
                  protein: Math.round((product.protein100 * g) / 100),
                  carbs: Math.round((product.carbs100 * g) / 100),
                  fat: Math.round((product.fat100 * g) / 100),
                  source: "escaner",
                });
                setProduct(null);
                setAdded(product.name);
              }}
            >
              Añadir {Math.round((product.kcal100 * (Number(grams) || 0)) / 100)} kcal
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setProduct(null)}>
              Escanear otro
            </Button>
          </div>
        ) : (
          <Scanner onFound={setProduct} />
        ))}

      {tab === "manual" && (
        <div className="space-y-3">
          <Field label="¿Qué comiste?">
            <input className={inputCls} value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Calorías">
              <input className={inputCls} type="number" inputMode="numeric" value={manual.kcal} onChange={(e) => setManual({ ...manual, kcal: e.target.value })} />
            </Field>
            <Field label="Proteína (g)">
              <input className={inputCls} type="number" inputMode="numeric" value={manual.protein} onChange={(e) => setManual({ ...manual, protein: e.target.value })} />
            </Field>
          </div>
          <Button
            className="w-full"
            disabled={!manual.name || !manual.kcal}
            onClick={() => {
              onAdd({ name: manual.name, kcal: Number(manual.kcal), protein: Number(manual.protein) || 0, source: "manual" });
              setAdded(manual.name);
              setManual({ name: "", kcal: "", protein: "" });
            }}
          >
            Añadir
          </Button>
        </div>
      )}
    </Sheet>
  );
}

function SleepCard({ date }: { date: string }) {
  const m = useApp((s) => s.metrics[date] ?? EMPTY_OBJ);
  const p = useApp((s) => s.profile);
  const setMetric = useApp((s) => s.setMetric);
  const bed = m.sleepBed ?? p.sleepTime;
  const wake = m.sleepWake ?? p.wakeTime;
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins <= 0) mins += 1440;
  const save = (x: Partial<typeof m>) => {
    setMetric(date, { sleepBed: bed, sleepWake: wake, ...x });
    if (p.habits.sueno) toggleItem(date, { id: "registro-sueno" }, undefined, true);
  };
  return (
    <>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Moon className="h-4 w-4" /> Sueño de anoche
        </span>
      </SectionTitle>
      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Me acosté">
            <TimeInput value={bed} onChange={(v) => save({ sleepBed: v })} />
          </Field>
          <Field label="Me levanté">
            <TimeInput value={wake} onChange={(v) => save({ sleepWake: v })} />
          </Field>
        </div>
        <div className={cx("text-sm", mins / 60 >= 7 ? "text-good" : "text-warn")}>
          {(mins / 60).toFixed(1).replace(".0", "")} horas de sueño {mins / 60 >= 7 ? "✓" : "· la meta es 7–9 h"}
        </div>
        <Field label="¿Cómo dormiste?">
          <Scale value={m.sleepQuality} onChange={(n) => save({ sleepQuality: n })} labels={["Muy mal", "Excelente"]} />
        </Field>
      </Card>
    </>
  );
}

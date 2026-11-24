"use client";

import { useEffect, useMemo, useState } from "react";
import { plates } from "@/lib/workout";
import { Sheet, cx } from "./ui";

export function Stepper({ value, onChange, step, placeholder }: { value: number; onChange: (v: number) => void; step: number; placeholder?: string }) {
  return (
    <div className="flex h-11 items-center rounded-xl border border-line bg-surface-2">
      <button className="h-full w-9 text-muted" onClick={() => onChange(Math.max(0, +(value - step).toFixed(2)))} aria-label="Menos">
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value || ""}
        placeholder={placeholder ?? "0"}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="h-full w-full min-w-0 bg-transparent text-center text-base font-semibold outline-none"
      />
      <button className="h-full w-9 text-muted" onClick={() => onChange(+(value + step).toFixed(2))} aria-label="Más">
        +
      </button>
    </div>
  );
}

export function PlateSheet({ weight, onClose }: { weight: number | null; onClose: () => void }) {
  const [w, setW] = useState(weight ?? 135);
  const [bar, setBar] = useState(45);
  useEffect(() => {
    if (weight !== null) setW(weight || 135);
  }, [weight]);
  return (
    <Sheet open={weight !== null} onClose={onClose} title="Calculadora de discos">
      <PlateCalc w={w} setW={setW} bar={bar} setBar={setBar} />
    </Sheet>
  );
}

export function PlateCalc({ w, setW, bar, setBar }: { w: number; setW: (n: number) => void; bar: number; setBar: (n: number) => void }) {
  const r = useMemo(() => plates(w, bar), [w, bar]);
  const colors: Record<number, string> = { 45: "bg-info", 35: "bg-warn", 25: "bg-good", 10: "bg-fg", 5: "bg-bad", 2.5: "bg-muted" };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          Peso total (lb)
          <Stepper value={w} step={5} onChange={setW} />
        </label>
        <label className="text-sm">
          Barra
          <select value={bar} onChange={(e) => setBar(Number(e.target.value))} className="mt-0 h-11 w-full rounded-xl border border-line bg-surface-2 px-3">
            <option value={45}>Olímpica 45 lb</option>
            <option value={35}>35 lb</option>
            <option value={25}>Barra Z / corta 25 lb</option>
            <option value={15}>15 lb</option>
          </select>
        </label>
      </div>
      <div className="flex h-28 items-center justify-center gap-0.5 rounded-2xl bg-surface-2">
        <div className="h-3 w-10 rounded-l bg-muted/60" />
        {[...r.perSide].reverse().map((p, i) => (
          <div key={`l${i}`} className={cx("w-3 rounded-sm", colors[p])} style={{ height: `${30 + p * 1.4}px` }} />
        ))}
        <div className="h-3 w-16 bg-muted/60" />
        {r.perSide.map((p, i) => (
          <div key={`r${i}`} className={cx("w-3 rounded-sm", colors[p])} style={{ height: `${30 + p * 1.4}px` }} />
        ))}
        <div className="h-3 w-10 rounded-r bg-muted/60" />
      </div>
      <div className="text-center">
        <div className="text-sm text-muted">En cada lado:</div>
        <div className="text-xl font-bold">{r.perSide.length ? r.perSide.join(" + ") : "Solo la barra"}</div>
        {r.achieved !== w && <div className="text-xs text-warn">Lo más cercano: {r.achieved} lb</div>}
      </div>
    </div>
  );
}


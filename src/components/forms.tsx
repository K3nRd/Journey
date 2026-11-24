"use client";

import { DAY_SHORT } from "@/lib/date";
import { cx, inputCls } from "./ui";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function DayPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div className="flex gap-1.5">
      {ORDER.map((d) => {
        const on = value.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(on ? value.filter((x) => x !== d) : [...value, d].sort())}
            className={cx(
              "h-11 flex-1 rounded-xl border text-sm font-semibold transition",
              on ? "border-transparent grad text-accent-ink" : "border-line bg-surface-2 text-muted",
            )}
          >
            {DAY_SHORT[d].slice(0, 2)}
          </button>
        );
      })}
    </div>
  );
}

export function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="time" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} className={inputCls} />;
}

export function NumInput({
  value,
  onChange,
  suffix,
  step = 1,
  min,
  max,
  placeholder,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        value={value ? value : ""}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className={cx(inputCls, suffix && "pr-14")}
      />
      {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
    </div>
  );
}

export function HeightInput({ cm, onChange }: { cm: number; onChange: (cm: number) => void }) {
  const totalIn = Math.round(cm / 2.54);
  const ft = Math.floor(totalIn / 12);
  const inch = totalIn - ft * 12;
  const set = (f: number, i: number) => onChange(Math.round((f * 12 + i) * 2.54));
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumInput value={ft} onChange={(v) => set(v ?? 0, inch)} suffix="pies" max={7} />
      <NumInput value={cm ? inch : undefined} onChange={(v) => set(ft, Math.min(11, v ?? 0))} suffix="pulg" max={11} placeholder="0" />
    </div>
  );
}

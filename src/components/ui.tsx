"use client";

import Link from "next/link";
import { ChevronLeft, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("card p-4", className)} {...rest}>
      {children}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
const btn: Record<BtnVariant, string> = {
  primary: "grad text-accent-ink font-semibold glow",
  secondary: "bg-surface-2 text-fg border border-line font-medium active:bg-surface-3",
  ghost: "text-fg font-medium active:bg-surface-2",
  danger: "bg-bad/12 text-bad border border-bad/25 font-medium active:bg-bad/20",
};

const size = (s: "sm" | "md" | "lg") =>
  s === "sm" ? "h-9 px-3.5 text-sm rounded-full" : s === "lg" ? "h-14 px-6 text-[15px] rounded-full" : "h-11 px-5 text-sm rounded-full";

export function Button({
  variant = "primary",
  className,
  children,
  size: sz = "md",
  ...rest
}: { variant?: BtnVariant; size?: "sm" | "md" | "lg" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "tap inline-flex items-center justify-center gap-2 whitespace-nowrap transition disabled:pointer-events-none disabled:opacity-40",
        size(sz),
        btn[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
  size: sz = "md",
}: { href: string; variant?: BtnVariant; className?: string; children: ReactNode; size?: "sm" | "md" | "lg" }) {
  return (
    <Link href={href} className={cx("tap inline-flex items-center justify-center gap-2 transition", size(sz), btn[variant], className)}>
      {children}
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: string | boolean;
  right?: ReactNode;
}) {
  return (
    <header className="safe-top sticky top-0 z-20 -mx-4 mb-4 bg-bg/70 px-4 pb-3 pt-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {back && (
          <Link
            href={typeof back === "string" ? back : "/"}
            onClick={(e) => {
              if (back === true && window.history.length > 1) {
                e.preventDefault();
                window.history.back();
              }
            }}
            className="tap grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-surface"
            aria-label="Volver"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-[26px] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between gap-2">
      <h2 className="font-display text-lg font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "tap inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition",
        active ? "border-transparent bg-fg font-semibold text-bg" : "border-line bg-surface text-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

type Tone = "neutral" | "accent" | "warn" | "good" | "bad" | "info" | "food" | "violet";
export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  const t: Record<Tone, string> = {
    neutral: "bg-surface-2 text-muted border border-line",
    accent: "bg-accent-soft text-accent-text",
    warn: "bg-warn/12 text-warn",
    good: "bg-good/12 text-good",
    bad: "bg-bad/12 text-bad",
    info: "bg-sky-soft text-sky",
    food: "bg-food-soft text-food",
    violet: "bg-violet-soft text-violet",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", t[tone], className)}>{children}</span>;
}

export function Ring({
  value,
  size = 56,
  stroke = 6,
  children,
  color = "url(#ring-grad)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e4ff7a" />
            <stop offset="45%" stopColor="#c8f135" />
            <stop offset="100%" stopColor="#2ee6c0" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function Bar({ value, tone = "accent" }: { value: number; tone?: "accent" | "warn" | "info" | "food" | "violet" }) {
  const v = Math.max(0, Math.min(1, value));
  const c = { accent: "grad", warn: "bg-warn", info: "bg-sky", food: "bg-food", violet: "bg-violet" }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
      <div className={cx("h-full rounded-full transition-all duration-700", c)} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar" />
      <div className="sheet-up safe-bottom relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border border-line bg-surface p-5 sm:rounded-[2rem]">
        <div className="mx-auto -mt-1 mb-4 h-1.5 w-10 rounded-full bg-surface-3 sm:hidden" />
        {title && (
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="font-display text-xl font-bold">{title}</h3>
            <button onClick={onClose} className="tap grid h-9 w-9 place-items-center rounded-full bg-surface-2" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center gap-3 py-3 text-left">
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium">{label}</div>
        {desc && <div className="text-xs text-muted">{desc}</div>}
      </div>
      <span className={cx("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "grad" : "bg-surface-3")}>
        <span className={cx("absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all", checked ? "left-6" : "left-1")} />
      </span>
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "h-[52px] w-full rounded-2xl border border-line bg-surface-2 px-4 text-base text-fg outline-none transition placeholder:text-muted/60 focus:border-accent focus:bg-surface";

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "h-10 flex-1 rounded-full px-2 text-sm transition",
            value === o.value ? "bg-fg font-semibold text-bg shadow" : "text-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon, title, desc, children }: { icon?: ReactNode; title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 p-8 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <div className="font-display text-lg font-bold">{title}</div>
      {desc && <p className="text-sm text-muted">{desc}</p>}
      {children}
    </div>
  );
}

export function Scale({ value, onChange, labels }: { value?: number; onChange: (n: number) => void; labels: [string, string] }) {
  return (
    <div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cx(
              "tap h-11 flex-1 rounded-2xl border text-sm font-semibold transition",
              value === n ? "grad border-transparent text-accent-ink" : "border-line bg-surface-2 text-muted",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  );
}

/** Ícono dentro de un cuadro de color (para listas y tarjetas). */
export function IconTile({ children, tone = "accent", size = "md" }: { children: ReactNode; tone?: Tone; size?: "sm" | "md" | "lg" }) {
  const t: Record<Tone, string> = {
    neutral: "bg-surface-2 text-muted",
    accent: "bg-accent-soft text-accent-text",
    warn: "bg-warn/12 text-warn",
    good: "bg-good/12 text-good",
    bad: "bg-bad/12 text-bad",
    info: "bg-sky-soft text-sky",
    food: "bg-food-soft text-food",
    violet: "bg-violet-soft text-violet",
  };
  const s = size === "sm" ? "h-8 w-8 rounded-xl" : size === "lg" ? "h-12 w-12 rounded-2xl" : "h-10 w-10 rounded-2xl";
  return <div className={cx("grid shrink-0 place-items-center", s, t[tone])}>{children}</div>;
}

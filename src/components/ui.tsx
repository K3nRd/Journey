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
  primary: "bg-accent text-accent-ink font-semibold active:opacity-80",
  secondary: "bg-surface-2 text-fg border border-line active:bg-surface-3",
  ghost: "text-fg active:bg-surface-2",
  danger: "bg-bad/15 text-bad border border-bad/30 active:bg-bad/25",
};

export function Button({
  variant = "primary",
  className,
  children,
  size = "md",
  ...rest
}: { variant?: BtnVariant; size?: "sm" | "md" | "lg" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sz = size === "sm" ? "h-9 px-3 text-sm rounded-xl" : size === "lg" ? "h-14 px-5 text-base rounded-2xl" : "h-11 px-4 text-sm rounded-xl";
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:pointer-events-none",
        sz,
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
  size = "md",
}: { href: string; variant?: BtnVariant; className?: string; children: ReactNode; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-9 px-3 text-sm rounded-xl" : size === "lg" ? "h-14 px-5 text-base rounded-2xl" : "h-11 px-4 text-sm rounded-xl";
  return (
    <Link href={href} className={cx("inline-flex items-center justify-center gap-2 transition", sz, btn[variant], className)}>
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
    <header className="safe-top sticky top-0 z-20 -mx-4 mb-3 bg-bg/85 px-4 pb-3 pt-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        {back && (
          <Link
            href={typeof back === "string" ? back : "/"}
            className="-ml-2 grid h-10 w-10 place-items-center rounded-full active:bg-surface-2"
            aria-label="Volver"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-2 mt-6 flex items-end justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">{children}</h2>
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
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition",
        active ? "border-accent bg-accent-soft text-fg" : "border-line bg-surface text-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "warn" | "good" | "bad" | "info" }) {
  const t = {
    neutral: "bg-surface-2 text-muted",
    accent: "bg-accent-soft text-accent",
    warn: "bg-warn/15 text-warn",
    good: "bg-good/15 text-good",
    bad: "bg-bad/15 text-bad",
    info: "bg-info/15 text-info",
  }[tone];
  return <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", t)}>{children}</span>;
}

export function Ring({ value, size = 56, stroke = 6, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset .5s" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-semibold">{children}</div>
    </div>
  );
}

export function Bar({ value, tone = "accent" }: { value: number; tone?: "accent" | "warn" | "info" }) {
  const v = Math.max(0, Math.min(1, value));
  const c = tone === "accent" ? "bg-accent" : tone === "warn" ? "bg-warn" : "bg-info";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
      <div className={cx("h-full rounded-full transition-all", c)} style={{ width: `${v * 100}%` }} />
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
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Cerrar" />
      <div className="safe-bottom relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-4 sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-surface-3 sm:hidden" />
        {title && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-surface-2" aria-label="Cerrar">
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
    <button type="button" onClick={() => onChange(!checked)} className="flex w-full items-center gap-3 py-2.5 text-left">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-muted">{desc}</div>}
      </div>
      <span className={cx("relative h-7 w-12 shrink-0 rounded-full transition", checked ? "bg-accent" : "bg-surface-3")}>
        <span className={cx("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-6" : "left-1")} />
      </span>
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "h-12 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-base text-fg outline-none placeholder:text-muted/60 focus:border-accent";

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
    <div className="flex rounded-xl border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "h-9 flex-1 rounded-lg text-sm transition",
            value === o.value ? "bg-surface text-fg font-semibold shadow" : "text-muted",
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
    <div className="card flex flex-col items-center gap-2 p-6 text-center">
      {icon && <div className="text-3xl">{icon}</div>}
      <div className="font-semibold">{title}</div>
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
              "h-10 flex-1 rounded-xl border text-sm font-semibold transition",
              value === n ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface-2 text-muted",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  );
}

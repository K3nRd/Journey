"use client";

import { cx } from "./ui";

// Curva cúbica del camino (viewBox 320×96)
const P0 = { x: 14, y: 78 };
const P1 = { x: 110, y: 96 };
const P2 = { x: 190, y: 4 };
const P3 = { x: 306, y: 22 };
const D = `M${P0.x} ${P0.y} C${P1.x} ${P1.y}, ${P2.x} ${P2.y}, ${P3.x} ${P3.y}`;

function at(t: number) {
  const u = 1 - t;
  const x = u ** 3 * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t ** 3 * P3.x;
  const y = u ** 3 * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t ** 3 * P3.y;
  return { x, y };
}

/**
 * El "camino" de Journey: del peso inicial a la meta, con hitos cada 5 lb
 * y un marcador en tu posición actual.
 */
export function JourneyPath({ start, goal, current, className }: { start: number; goal: number; current: number; className?: string }) {
  const total = Math.max(1, start - goal);
  const pct = Math.max(0, Math.min(1, (start - current) / total));
  const me = at(pct);
  const milestones: { t: number; lb: number }[] = [];
  for (let lb = start - 5; lb > goal; lb -= 5) milestones.push({ t: (start - lb) / total, lb });

  return (
    <div className={cx("relative", className)}>
      <svg viewBox="0 0 320 100" className="h-auto w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="jp-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#e4ff7a" />
            <stop offset="50%" stopColor="#c8f135" />
            <stop offset="100%" stopColor="#2ee6c0" />
          </linearGradient>
          <filter id="jp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {/* camino pendiente */}
        <path d={D} fill="none" stroke="var(--surface-3)" strokeWidth="6" strokeLinecap="round" strokeDasharray="1 11" />
        {/* camino recorrido */}
        <path
          d={D}
          fill="none"
          stroke="url(#jp-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${Math.max(0.001, pct)} 1`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.2,.8,.2,1)" }}
        />
        {/* hitos */}
        {milestones.map((m) => {
          const p = at(m.t);
          const reached = m.t <= pct + 1e-6;
          return <circle key={m.lb} cx={p.x} cy={p.y} r={reached ? 3.2 : 2.6} fill={reached ? "#0a1100" : "var(--muted)"} opacity={reached ? 0.55 : 0.5} />;
        })}
        {/* inicio y meta */}
        <circle cx={P0.x} cy={P0.y} r="5" fill="var(--surface)" stroke="var(--muted)" strokeWidth="2" />
        <g transform={`translate(${P3.x} ${P3.y})`}>
          <circle r="9" fill="var(--surface)" stroke="#2ee6c0" strokeWidth="2.5" />
          <path d="M-3.5 0.5 L-1 3 L4 -2.5" fill="none" stroke="#2ee6c0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* tú */}
        <circle cx={me.x} cy={me.y} r="11" fill="#c8f135" opacity="0.45" filter="url(#jp-glow)" />
        <circle cx={me.x} cy={me.y} r="7.5" fill="#c8f135" stroke="var(--bg)" strokeWidth="3" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] font-medium text-muted">
        <span>{start} lb</span>
        <span className="text-accent-text">{Math.round(pct * 100)}% del camino</span>
        <span>{goal} lb</span>
      </div>
    </div>
  );
}

import { useId } from "react";

/**
 * Marca de Journey: la «j» es un camino. Empieza en un anillo (el punto de partida),
 * sube por el trazo y el punto de la j es la meta.
 */
export function LogoMark({ size = 40, tile = true, className }: { size?: number; tile?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="0.15" y1="1" x2="0.75" y2="0">
          <stop offset="0%" stopColor="#e4ff7a" />
          <stop offset="55%" stopColor="#c8f135" />
          <stop offset="100%" stopColor="#2ee6c0" />
        </linearGradient>
        <radialGradient id={`r${id}`}>
          <stop offset="0%" stopColor="#2ee6c0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#2ee6c0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`t${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15191c" />
          <stop offset="100%" stopColor="#0a0c0e" />
        </linearGradient>
      </defs>
      {tile && <rect width="64" height="64" rx="16" fill={`url(#t${id})`} />}
      {tile && <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" fill="none" stroke="#ffffff" strokeOpacity="0.08" />}
      {/* trazo de la j = el camino */}
      <path d="M17 44.5 C 17 52.5, 37 54, 37 42 L 37 27" fill="none" stroke={`url(#g${id})`} strokeWidth="7.5" strokeLinecap="round" />
      {/* punto de partida */}
      <circle cx="17" cy="44.5" r="4.6" fill={tile ? "#0d1012" : "var(--bg)"} stroke="#e4ff7a" strokeWidth="2.6" />
      {/* meta: el punto de la j */}
      <circle cx="37" cy="14.5" r="10" fill={`url(#r${id})`} />
      <circle cx="37" cy="14.5" r="5.4" fill="#2ee6c0" />
    </svg>
  );
}

/** Logotipo completo: marca + «journey». */
export function Logo({ size = 40, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      {wordmark && (
        <span className="font-display font-bold tracking-tight" style={{ fontSize: size * 0.72, letterSpacing: "-0.03em" }}>
          journey
        </span>
      )}
    </div>
  );
}

/** Logotipo de Journey: una ruta que termina en un punto (la meta). */
export function Logo({ size = 36, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#e4ff7a" />
            <stop offset="50%" stopColor="#c8f135" />
            <stop offset="100%" stopColor="#2ee6c0" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="#0d0f11" />
        <path d="M12 36 C 20 38, 18 24, 26 22 S 34 14, 36 12" fill="none" stroke="url(#logo-g)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="12" cy="36" r="3.2" fill="#0d0f11" stroke="#c8f135" strokeWidth="2" />
        <circle cx="36" cy="12" r="4.5" fill="#2ee6c0" />
      </svg>
      {wordmark && <span className="font-display text-[26px] font-bold tracking-tight">journey</span>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, UtensilsCrossed, TrendingUp, LayoutGrid } from "lucide-react";
import { cx } from "./ui";

const TABS = [
  { href: "/", label: "Hoy", icon: Home, match: (p: string) => p === "/" },
  { href: "/entreno", label: "Entreno", icon: Dumbbell, match: (p: string) => p.startsWith("/entreno") || p.startsWith("/ejercicio") },
  { href: "/nutricion", label: "Comida", icon: UtensilsCrossed, match: (p: string) => p.startsWith("/nutricion") || p.startsWith("/recetas") || p.startsWith("/registro") },
  { href: "/progreso", label: "Progreso", icon: TrendingUp, match: (p: string) => p.startsWith("/progreso") || p.startsWith("/revision") },
  { href: "/mas", label: "Más", icon: LayoutGrid, match: (p: string) => ["/mas", "/ajustes", "/desconectar", "/gastos", "/guia"].some((x) => p.startsWith(x)) },
];

/** Barra flotante tipo "píldora" con efecto vidrio. */
export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)", transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
    >
      <div
        className="pointer-events-auto mx-auto flex max-w-md items-center gap-1 rounded-full border border-line-strong p-1.5 shadow-2xl backdrop-blur-2xl"
        style={{ background: "var(--nav-bg)" }}
      >
        {TABS.map((t) => {
          const active = t.match(path);
          const I = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "tap flex h-12 items-center justify-center gap-1.5 rounded-full transition-all duration-300",
                active ? "grad flex-[1.6] px-3 text-accent-ink" : "flex-1 text-muted",
              )}
            >
              <I className="h-[22px] w-[22px] shrink-0" strokeWidth={active ? 2.4 : 1.9} />
              {active && <span className="truncate text-[13px] font-semibold">{t.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

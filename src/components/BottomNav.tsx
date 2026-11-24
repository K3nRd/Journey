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
  { href: "/mas", label: "Más", icon: LayoutGrid, match: (p: string) => ["/mas", "/ajustes", "/desconectar", "/gastos"].some((x) => p.startsWith(x)) },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((t) => {
          const active = t.match(path);
          const I = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cx("flex flex-1 flex-col items-center gap-0.5 pb-1 pt-2 text-[11px]", active ? "text-accent" : "text-muted")}
            >
              <I className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
              <span className={active ? "font-semibold" : ""}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

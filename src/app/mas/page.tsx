"use client";

import Link from "next/link";
import {
  Settings,
  Sofa,
  Wallet,
  ClipboardCheck,
  Camera,
  FileBarChart,
  NotebookPen,
  ChefHat,
  ShoppingCart,
  Calculator,
  BookOpen,
  Search,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui";

const GROUPS = [
  {
    title: "Seguimiento",
    items: [
      { href: "/registro", icon: NotebookPen, label: "Registro de comida y sueño", desc: "Comí fuera, porciones, escáner" },
      { href: "/revision", icon: ClipboardCheck, label: "Revisión semanal", desc: "3 preguntas cada domingo" },
      { href: "/progreso/fotos", icon: Camera, label: "Fotos de progreso", desc: "Comparador antes / después" },
      { href: "/progreso/informe", icon: FileBarChart, label: "Informe mensual", desc: "Todo en una pantalla" },
    ],
  },
  {
    title: "Comida",
    items: [
      { href: "/recetas", icon: Search, label: "Buscar recetas", desc: "Incluidas, ¿qué tengo?, internet" },
      { href: "/nutricion/compras", icon: ShoppingCart, label: "Lista de compras", desc: "Con costo en RD$" },
      { href: "/nutricion/preparacion", icon: ChefHat, label: "Cocinar el domingo", desc: "Prepara la semana en 90 min" },
      { href: "/gastos", icon: Wallet, label: "Gasto en comida", desc: "Compáralo con tu presupuesto" },
    ],
  },
  {
    title: "Entreno y vida",
    items: [
      { href: "/entreno/ejercicios", icon: BookOpen, label: "Biblioteca de ejercicios", desc: "Técnica, fotos y récords" },
      { href: "/entreno/discos", icon: Calculator, label: "Calculadora de discos", desc: "Qué poner en la barra" },
      { href: "/desconectar", icon: Sofa, label: "Ideas para desconectar", desc: "Equilibrio fuera del trabajo" },
    ],
  },
  {
    title: "App",
    items: [{ href: "/ajustes", icon: Settings, label: "Ajustes", desc: "Horario, notificaciones, copia de seguridad" }],
  },
];

export default function Mas() {
  return (
    <div>
      <PageHeader title="Más" />
      {GROUPS.map((g) => (
        <div key={g.title} className="mb-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">{g.title}</h2>
          <div className="card divide-y divide-line !p-0">
            {g.items.map((i) => (
              <Link key={i.href} href={i.href} className="flex items-center gap-3 px-4 py-3 active:bg-surface-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent">
                  <i.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{i.label}</div>
                  <div className="text-xs text-muted">{i.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

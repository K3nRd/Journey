"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bell, Dumbbell, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Utensils } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { cx } from "@/components/ui";
import { signIn, signUp, useAuth } from "@/lib/cloud";

const FEATURES = [
  { icon: Dumbbell, label: "Entreno guiado", tone: "text-accent-text" },
  { icon: Utensils, label: "Comida rica y barata", tone: "text-food" },
  { icon: Bell, label: "Recordatorios", tone: "text-sky" },
];

export default function Login() {
  const status = useAuth((s) => s.status);
  const [mode, setMode] = useState<"entrar" | "crear">("crear");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const checks = [
    { ok: password.length >= 8, label: "8+ caracteres" },
    { ok: /[A-Za-z]/.test(password), label: "una letra" },
    { ok: /\d/.test(password), label: "un número" },
  ];
  const strong = checks.every((c) => c.ok);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validEmail) return setError("Escribe un correo válido.");
    if (mode === "crear" && !strong) return setError("Tu contraseña necesita al menos 8 caracteres, una letra y un número.");
    if (mode === "entrar" && !password) return setError("Escribe tu contraseña.");
    setBusy(true);
    const r = mode === "crear" ? await signUp(email, password) : await signIn(email, password);
    setBusy(false);
    if (r.error) setError(r.error);
  };

  const switchMode = (m: "entrar" | "crear") => {
    setMode(m);
    setError(null);
    setForgot(false);
  };

  if (status === "unconfigured") {
    return (
      <div className="grid min-h-dvh place-items-center text-center">
        <p className="text-sm text-muted">El servidor de cuentas no está configurado.</p>
      </div>
    );
  }

  return (
    <div className="safe-top relative flex min-h-dvh flex-col overflow-x-clip pb-6">
      {/* Halo detrás del logo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[520px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(45% 45% at 50% 38%, rgba(46,230,192,0.22), transparent 70%), radial-gradient(40% 40% at 38% 58%, rgba(200,241,53,0.18), transparent 70%)",
        }}
      />

      {/* Marca */}
      <div className="rise flex flex-col items-center pt-12 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-[28px] bg-[#2ee6c0] opacity-25 blur-2xl" />
          <LogoMark size={88} className="relative drop-shadow-2xl" />
        </div>
        <h1 className="font-display mt-5 text-[44px] font-bold leading-none tracking-[-0.04em]">journey</h1>
        <p className="mt-3 text-[15px] text-muted">
          Tu transformación, <span className="font-semibold text-fg">paso a paso.</span>
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {FEATURES.map((f) => (
            <span key={f.label} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-[12px] font-medium backdrop-blur">
              <f.icon className={cx("h-3.5 w-3.5", f.tone)} /> {f.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Formulario */}
      <div className="card rise mt-8 p-5" style={{ animationDelay: "120ms" }}>
        <div className="flex rounded-full border border-line bg-surface-2 p-1" role="tablist">
          {(
            [
              ["crear", "Crear cuenta"],
              ["entrar", "Ya tengo cuenta"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={cx("h-10 flex-1 rounded-full text-sm transition", mode === m ? "bg-fg font-semibold text-bg shadow" : "text-muted")}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
          <Input icon={Mail} label="Correo">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted/60"
            />
          </Input>
          <Input icon={Lock} label="Contraseña">
            <input
              type={show ? "text" : "password"}
              autoComplete={mode === "crear" ? "new-password" : "current-password"}
              placeholder={mode === "crear" ? "Crea una contraseña" : "Tu contraseña"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted/60"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="grid h-9 w-9 shrink-0 place-items-center text-muted"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </Input>

          {mode === "crear" && password.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {checks.map((c) => (
                <span
                  key={c.label}
                  className={cx("rounded-full px-2.5 py-1 text-[11px] font-semibold transition", c.ok ? "bg-good/12 text-good" : "bg-surface-2 text-muted")}
                >
                  {c.ok ? "✓ " : ""}
                  {c.label}
                </span>
              ))}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-2xl bg-bad/12 p-3 text-sm text-bad">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="tap grad glow flex h-14 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-accent-ink disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {mode === "crear" ? "Crear mi cuenta" : "Entrar"}
            {!busy && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        {mode === "entrar" && (
          <button type="button" onClick={() => setForgot((v) => !v)} className="mt-3 w-full text-center text-sm text-muted underline-offset-4 hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        )}
        {forgot && (
          <p className="mt-2 rounded-2xl bg-surface-2 p-3 text-sm text-muted">
            Durante la beta, escríbele a la persona que te invitó a Journey para que restablezca tu contraseña.
          </p>
        )}

        <p className="mt-4 flex items-start gap-2 text-[12px] leading-snug text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-good" />
          Tus datos se guardan en tu cuenta para que no los pierdas. Tus fotos de progreso nunca salen de tu teléfono.
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-muted">
        Al continuar aceptas los{" "}
        <Link href="/legal" className="underline underline-offset-2">
          términos y la privacidad
        </Link>
        . Para mayores de 18 años.
      </p>
    </div>
  );
}

function Input({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <label className="flex h-[56px] items-center gap-3 rounded-2xl border border-line bg-surface-2 pl-4 pr-1.5 transition focus-within:border-accent focus-within:bg-surface">
      <Icon className="h-5 w-5 shrink-0 text-muted" aria-hidden />
      <span className="sr-only">{label}</span>
      {children}
    </label>
  );
}

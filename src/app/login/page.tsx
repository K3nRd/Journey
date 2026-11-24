"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { JourneyPath } from "@/components/JourneyPath";
import { Button, Segmented, cx, inputCls } from "@/components/ui";
import { signIn, signUp, useAuth } from "@/lib/cloud";

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
  const strong = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validEmail) return setError("Escribe un correo válido.");
    if (mode === "crear" && !strong) return setError("La contraseña debe tener al menos 8 caracteres, con letras y números.");
    if (mode === "entrar" && !password) return setError("Escribe tu contraseña.");
    setBusy(true);
    const r = mode === "crear" ? await signUp(email, password) : await signIn(email, password);
    setBusy(false);
    if (r.error) setError(r.error);
  };

  if (status === "unconfigured") {
    return (
      <div className="grid min-h-dvh place-items-center text-center">
        <p className="text-sm text-muted">El servidor de cuentas no está configurado.</p>
      </div>
    );
  }

  return (
    <div className="safe-top flex min-h-dvh flex-col pb-8 pt-8">
      <Logo />
      <div className="card grad-soft rise mt-6 p-5">
        <JourneyPath start={200} goal={170} current={186} />
      </div>
      <h1 className="font-display mt-6 text-[32px] font-bold leading-[1.05]">
        {mode === "crear" ? (
          <>
            Empieza tu <span className="grad-text">journey.</span>
          </>
        ) : (
          <>
            Qué bueno verte <span className="grad-text">de nuevo.</span>
          </>
        )}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "crear" ? "Crea tu cuenta gratis para guardar tu progreso en cualquier teléfono." : "Entra para seguir donde lo dejaste."}
      </p>

      <div className="mt-5">
        <Segmented
          value={mode}
          onChange={(v) => {
            setMode(v);
            setError(null);
            setForgot(false);
          }}
          options={[
            { value: "crear", label: "Crear cuenta" },
            { value: "entrar", label: "Entrar" },
          ]}
        />
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <label className="relative block">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cx(inputCls, "pl-12")}
            aria-label="Correo"
          />
        </label>
        <label className="relative block">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            type={show ? "text" : "password"}
            autoComplete={mode === "crear" ? "new-password" : "current-password"}
            placeholder={mode === "crear" ? "Crea una contraseña" : "Contraseña"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cx(inputCls, "pl-12 pr-12")}
            aria-label="Contraseña"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-muted"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </label>
        {mode === "crear" && password.length > 0 && (
          <p className={cx("text-xs", strong ? "text-good" : "text-muted")}>{strong ? "✓ Contraseña segura" : "Mínimo 8 caracteres, con letras y números."}</p>
        )}

        {error && <p className="rounded-xl bg-bad/12 p-3 text-sm text-bad">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}
          {mode === "crear" ? "Crear cuenta" : "Entrar"}
        </Button>
      </form>

      {mode === "entrar" && (
        <button type="button" onClick={() => setForgot((v) => !v)} className="mt-3 text-center text-sm text-muted underline">
          ¿Olvidaste tu contraseña?
        </button>
      )}
      {forgot && (
        <p className="mt-2 rounded-xl bg-surface-2 p-3 text-sm text-muted">
          Durante la beta, escríbele a la persona que te invitó a Journey para que restablezca tu contraseña.
        </p>
      )}

      <div className="flex-1" />
      <p className="mt-8 text-center text-xs text-muted">
        Al continuar aceptas los{" "}
        <Link href="/legal" className="underline">
          términos y la privacidad
        </Link>
        . Solo para mayores de 18 años.
      </p>
    </div>
  );
}


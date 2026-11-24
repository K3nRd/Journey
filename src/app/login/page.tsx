"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { JourneyPath } from "@/components/JourneyPath";
import { Button, Segmented, cx, inputCls } from "@/components/ui";
import { signIn, signInWithGoogle, signUp, useAuth } from "@/lib/cloud";

export default function Login() {
  const google = useAuth((s) => s.google);
  const status = useAuth((s) => s.status);
  const [mode, setMode] = useState<"entrar" | "crear">("crear");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<"form" | "google" | null>(null);
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
    setBusy("form");
    const r = mode === "crear" ? await signUp(email, password) : await signIn(email, password);
    setBusy(null);
    if (r.error) setError(r.error);
  };

  const withGoogle = async () => {
    setError(null);
    setBusy("google");
    const r = await signInWithGoogle();
    if (r.error) {
      setError(r.error);
      setBusy(null);
    }
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

      {google && (
        <>
          <button
            type="button"
            onClick={withGoogle}
            disabled={busy !== null}
            className="tap mt-4 flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-line-strong bg-surface font-medium disabled:opacity-50"
          >
            {busy === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
            Continuar con Google
          </button>
          <div className="my-4 flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-line" /> o con tu correo <div className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit} className={cx("space-y-3", !google && "mt-4")}>
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

        <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
          {busy === "form" && <Loader2 className="h-5 w-5 animate-spin" />}
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
          {google && " Si creaste la cuenta con Google, usa «Continuar con Google»."}
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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

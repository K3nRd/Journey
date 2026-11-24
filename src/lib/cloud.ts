"use client";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { create } from "zustand";
import { useApp, exportableState, DEFAULT_PROFILE, type AppState } from "./store";
import { dateKey } from "./date";

// ─────────────────────── Conexión ───────────────────────

interface Config {
  supabaseUrl: string | null;
  publishableKey: string | null;
  google: boolean;
}

let configPromise: Promise<Config> | null = null;
let client: SupabaseClient | null = null;

function loadConfig(): Promise<Config> {
  if (!configPromise) {
    configPromise = fetch("/api/config")
      .then((r) => r.json() as Promise<Config>)
      .catch(() => ({ supabaseUrl: null, publishableKey: null, google: false }));
  }
  return configPromise;
}

export async function getClient(): Promise<SupabaseClient | null> {
  if (client) return client;
  const c = await loadConfig();
  if (!c.supabaseUrl || !c.publishableKey) return null;
  client = createClient(c.supabaseUrl, c.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storageKey: "journey-auth",
    },
  });
  return client;
}

// ─────────────────────── Estado de la sesión ───────────────────────

export type AuthStatus = "loading" | "unconfigured" | "signedOut" | "syncing" | "signedIn";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  google: boolean;
  syncError: string | null;
}

export const useAuth = create<AuthState>(() => ({ status: "loading", user: null, google: false, syncError: null }));

let started = false;

/** Arranca la sesión al abrir la app. Llamar una sola vez. */
export async function initAuth() {
  if (started) return;
  started = true;
  const cfg = await loadConfig();
  const sb = await getClient();
  if (!sb) {
    useAuth.setState({ status: "unconfigured", google: false });
    return;
  }
  useAuth.setState({ google: cfg.google });
  const { data } = await sb.auth.getSession();
  if (data.session?.user) await onSignedIn(data.session.user);
  else useAuth.setState({ status: "signedOut", user: null });

  sb.auth.onAuthStateChange((event, session) => {
    const current = useAuth.getState().user;
    if (session?.user && session.user.id !== current?.id) onSignedIn(session.user);
    else if (event === "SIGNED_OUT") useAuth.setState({ status: "signedOut", user: null });
  });
}

let syncedUser: string | null = null;

async function onSignedIn(user: User) {
  useAuth.setState({ status: "syncing", user, syncError: null });
  if (syncedUser !== user.id) {
    try {
      await initialSync(user.id);
      syncedUser = user.id;
    } catch {
      useAuth.setState({ syncError: "No se pudieron sincronizar tus datos. Se intentará de nuevo." });
    }
  }
  useAuth.setState({ status: "signedIn", user });
}

// ─────────────────────── Sincronización de datos ───────────────────────

const LOCAL_ONLY: (keyof AppState)[] = ["deviceId", "pushEnabled", "installDismissed", "activeWorkoutId"];

function hasLocalData(s: AppState) {
  return s.onboarded || s.weights.length > 0 || s.workouts.length > 0;
}

/**
 * Al iniciar sesión:
 * - Si la cuenta ya tiene datos en la nube → se cargan en este teléfono.
 * - Si la cuenta es nueva → se suben los datos que ya había en el teléfono.
 */
async function initialSync(userId: string) {
  const sb = (await getClient())!;
  const { data, error } = await sb.from("user_data").select("data, updated_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  const local = useApp.getState();
  const ownerChanged = local.ownerId && local.ownerId !== userId;

  if (data?.data) {
    const remote = data.data as Partial<AppState>;
    const keep: Partial<AppState> = {};
    for (const k of LOCAL_ONLY) (keep as Record<string, unknown>)[k] = local[k];
    useApp.getState().importData({ ...remote, ...keep, ownerId: userId, lastSyncAt: Date.now() });
  } else {
    if (ownerChanged) resetLocal(); // otro usuario en el mismo teléfono: empezar limpio
    useApp.setState({ ownerId: userId });
    if (hasLocalData(useApp.getState())) await pushNow(userId);
  }
}

function cloudPayload(s: AppState) {
  const out = exportableState(s) as Record<string, unknown>;
  for (const k of LOCAL_ONLY) delete out[k];
  delete out.ownerId;
  return out;
}

async function pushNow(userId: string) {
  const sb = await getClient();
  if (!sb) return false;
  const { error } = await sb
    .from("user_data")
    .upsert({ user_id: userId, data: cloudPayload(useApp.getState()), updated_at: new Date().toISOString() });
  if (!error) useApp.setState({ lastSyncAt: Date.now() });
  return !error;
}

let timer: ReturnType<typeof setTimeout> | null = null;
let pending = false;

/** Guarda en la nube unos segundos después de cada cambio. */
export function startAutoSync() {
  const flush = () => {
    const u = useAuth.getState().user;
    if (!pending || !u || useAuth.getState().status !== "signedIn") return;
    pending = false;
    if (timer) clearTimeout(timer);
    pushNow(u.id).then((ok) => {
      if (!ok) pending = true;
    });
  };
  const unsub = useApp.subscribe((state, prev) => {
    if (state.lastSyncAt !== prev.lastSyncAt) return; // cambio provocado por la propia sincronización
    if (useAuth.getState().status !== "signedIn") return;
    pending = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 4000);
  });
  const vis = () => document.visibilityState === "hidden" && flush();
  document.addEventListener("visibilitychange", vis);
  window.addEventListener("pagehide", flush);
  return () => {
    unsub();
    document.removeEventListener("visibilitychange", vis);
    window.removeEventListener("pagehide", flush);
  };
}

// ─────────────────────── Acciones ───────────────────────

const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, "Correo o contraseña incorrectos."],
  [/user already registered|already been registered/i, "Ya existe una cuenta con ese correo. Toca «Entrar»."],
  [/password should be at least|weak password/i, "La contraseña debe tener al menos 8 caracteres, con letras y números."],
  [/unable to validate email|invalid email|email address .* is invalid/i, "Ese correo no es válido."],
  [/email not confirmed/i, "Tu correo no está confirmado. Pídele al administrador que active tu cuenta."],
  [/rate limit|too many/i, "Demasiados intentos. Espera unos minutos."],
  [/provider is not enabled|unsupported provider/i, "El inicio con Google todavía no está activado."],
  [/fetch|network/i, "Sin conexión. Revisa tu internet."],
];

const es = (msg?: string) => (msg ? (MESSAGES.find(([r]) => r.test(msg))?.[1] ?? msg) : "Algo salió mal. Inténtalo de nuevo.");

export async function signUp(email: string, password: string) {
  const sb = await getClient();
  if (!sb) return { error: "El servidor de cuentas no está configurado." };
  const { data, error } = await sb.auth.signUp({ email: email.trim(), password });
  if (error) return { error: es(error.message) };
  if (!data.session) return { error: "Cuenta creada, pero falta confirmarla. Pídele al administrador que desactive «Confirm email» en Supabase." };
  return { error: null };
}

export async function signIn(email: string, password: string) {
  const sb = await getClient();
  if (!sb) return { error: "El servidor de cuentas no está configurado." };
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
  return { error: error ? es(error.message) : null };
}

export async function signInWithGoogle() {
  const sb = await getClient();
  if (!sb) return { error: "El servidor de cuentas no está configurado." };
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  return { error: error ? es(error.message) : null };
}

export async function accessToken(): Promise<string | null> {
  const sb = await getClient();
  const { data } = (await sb?.auth.getSession()) ?? { data: { session: null } };
  return data.session?.access_token ?? null;
}

export async function authHeaders(): Promise<Record<string, string>> {
  const t = await accessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** Borra los datos de este teléfono (para que el siguiente usuario empiece limpio). */
export function resetLocal() {
  const { deviceId, theme } = useApp.getState();
  useApp.setState({
    onboarded: false,
    profile: { ...DEFAULT_PROFILE, startDate: dateKey() },
    overrides: {},
    checks: {},
    metrics: {},
    weights: [],
    waists: [],
    workouts: [],
    activeWorkoutId: undefined,
    foodLog: {},
    menuSwaps: {},
    favorites: [],
    savedExternal: [],
    prices: {},
    reviews: [],
    spending: [],
    photos: [],
    shoppingChecked: {},
    pushEnabled: false,
    calorieHistory: [],
    ownerId: undefined,
    lastSyncAt: undefined,
    deviceId,
    theme,
  });
}

export async function signOut() {
  const sb = await getClient();
  const u = useAuth.getState().user;
  if (u) await pushNow(u.id).catch(() => false);
  await sb?.auth.signOut();
  syncedUser = null;
  resetLocal();
  useAuth.setState({ status: "signedOut", user: null });
}

export async function deleteAccount() {
  const r = await fetch("/api/account", { method: "DELETE", headers: await authHeaders() }).catch(() => null);
  if (!r?.ok) {
    const j = await r?.json().catch(() => ({}));
    return { error: (j as { error?: string })?.error ?? "No se pudo borrar la cuenta." };
  }
  const sb = await getClient();
  await sb?.auth.signOut().catch(() => {});
  syncedUser = null;
  resetLocal();
  useAuth.setState({ status: "signedOut", user: null });
  return { error: null };
}

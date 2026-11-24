-- ════════════════════════════════════════════════════════════════
-- Journey · Esquema de Supabase (plan gratuito)
-- Pega TODO este archivo en Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════

-- Teléfonos registrados para notificaciones
create table if not exists public.devices (
  id text primary key,
  subscription jsonb not null,
  timezone text not null default 'America/Santo_Domingo',
  reminders jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Recordatorios ya enviados hoy (evita duplicados)
create table if not exists public.reminder_sent (
  device_id text not null references public.devices(id) on delete cascade,
  date text not null,
  item_id text not null,
  sent_at timestamptz not null default now(),
  primary key (device_id, date, item_id)
);

-- Cosas que ya hiciste (no se vuelve a avisar)
create table if not exists public.reminder_done (
  device_id text not null,
  date text not null,
  item_id text not null,
  primary key (device_id, date, item_id)
);

-- "Recordar en 15 minutos"
create table if not exists public.snoozes (
  id bigserial primary key,
  device_id text not null references public.devices(id) on delete cascade,
  item_id text not null,
  title text not null,
  body text not null default '',
  url text not null default '/',
  due_at timestamptz not null,
  sent boolean not null default false
);
create index if not exists snoozes_due_idx on public.snoozes (device_id, sent, due_at);

-- Copias de seguridad (protegidas por tu código de sincronización)
create table if not exists public.backups (
  code_hash text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seguridad: nadie puede leer estas tablas desde el navegador.
-- Solo el servidor de la app (con la service_role key) tiene acceso.
alter table public.devices enable row level security;
alter table public.reminder_sent enable row level security;
alter table public.reminder_done enable row level security;
alter table public.snoozes enable row level security;
alter table public.backups enable row level security;

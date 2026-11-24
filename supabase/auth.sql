-- ════════════════════════════════════════════════════════════════
-- Journey · Cuentas de usuario (pegar en SQL Editor → Run)
-- Se puede ejecutar varias veces sin problema.
-- ════════════════════════════════════════════════════════════════

-- Datos de cada usuario (perfil, registros, entrenamientos…). Las fotos no se suben.
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- Cada persona solo puede leer y escribir su propia fila
drop policy if exists "leer mis datos" on public.user_data;
create policy "leer mis datos" on public.user_data
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "crear mis datos" on public.user_data;
create policy "crear mis datos" on public.user_data
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "actualizar mis datos" on public.user_data;
create policy "actualizar mis datos" on public.user_data
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Límite de tamaño por usuario (2 MB) para proteger el plan gratuito
alter table public.user_data drop constraint if exists user_data_size;
alter table public.user_data add constraint user_data_size check (pg_column_size(data) < 2000000);

-- Los teléfonos con recordatorios quedan ligados a su dueño
alter table public.devices add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists devices_user_idx on public.devices (user_id);

-- La copia con código ya no se usa (la reemplaza la cuenta)
drop table if exists public.backups;

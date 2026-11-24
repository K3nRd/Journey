-- ════════════════════════════════════════════════════════════════
-- Journey · Tarea programada que envía las notificaciones
-- 1. Reemplaza TU-APP.vercel.app por la dirección de tu app.
-- 2. Reemplaza TU_CRON_SECRET por el mismo valor que pusiste en Vercel.
-- 3. Pega en Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Si ya existía, la reemplazamos
select cron.unschedule('journey-push-tick')
where exists (select 1 from cron.job where jobname = 'journey-push-tick');

select cron.schedule(
  'journey-push-tick',
  '* * * * *',  -- cada minuto
  $$
  select net.http_post(
    url := 'https://TU-APP.vercel.app/api/push/tick',
    headers := jsonb_build_object(
      'Authorization', 'Bearer TU_CRON_SECRET',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);

-- Para comprobar que funciona (después de unos minutos):
-- select status_code, created from net._http_response order by created desc limit 5;

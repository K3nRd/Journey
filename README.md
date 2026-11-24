# Journey · Mi transformación

App (PWA) de transformación física: entrenamiento, nutrición dominicana económica y hábitos diarios. Versión beta.
Todo con servicios **gratuitos**: Vercel (Hobby) + Supabase (Free).

## Qué incluye

- **Preguntas iniciales** editables: cuerpo, horario, gimnasio, alimentación, hábitos y recordatorios.
- **Dashboard "Hoy"**: rutina del día que avanza con la hora, comida con receta básica y botón de receta completa, entrenamiento con vista previa animada (foto de inicio ↔ final).
- **Entrenamiento**: 5 rutinas (lun–vie) + cardio opcional el sábado, adaptación de 2 semanas, descarga cada 7 semanas, progresión automática de pesos, alternativas si la máquina está ocupada, temporizador de descanso, calculadora de discos, récords e historial. 88 ejercicios con fotos reales (free-exercise-db, dominio público).
- **Nutrición**: 34 recetas dominicanas con calorías y proteína calculadas, menú semanal con porciones ajustadas a tu meta, lista de compras con costo en RD$ (precios editables), guía para cocinar el domingo.
- **Recetas**: buscador con filtros, "¿qué cocino con lo que tengo?" y búsqueda en Google.
- **Registro**: comí fuera (comida dominicana), porciones con la mano, escáner de códigos de barras (Open Food Facts), sueño, energía, hambre, ánimo, agua y pasos.
- **Progreso**: tendencia de peso, fecha estimada de meta, ajuste de calorías cada 2 semanas, cintura, fotos privadas con comparador, logros, informe de 7/30 días, revisión semanal.
- **Notificaciones push** con el teléfono bloqueado (Supabase pg_cron → Vercel → Web Push), con botones "Hecho" y "En 15 min".
- Copia de seguridad en la nube (con código) y en archivo. Modo oscuro / claro.

## Puesta en marcha (≈10 minutos)

### 1. Vercel
1. Importa este repositorio en [vercel.com/new](https://vercel.com/new) (plan Hobby, gratis). No hay que cambiar nada del build.
2. En tu computadora (o en cualquier lugar con Node): `npm install && npm run keys`. Copia las 4 variables que imprime.

### 2. Supabase
1. Crea un proyecto gratis en [supabase.com](https://supabase.com) (sin tarjeta).
2. **SQL Editor** → pega `supabase/schema.sql` → Run.
3. **Project Settings → API**: copia `Project URL` y la clave `service_role` (¡secreta!).

### 3. Variables en Vercel
En Vercel → tu proyecto → Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | de `npm run keys` |
| `VAPID_PRIVATE_KEY` | de `npm run keys` |
| `VAPID_SUBJECT` | `mailto:tu-correo` |
| `CRON_SECRET` | de `npm run keys` |
| `SYNC_SECRET` | opcional: otro valor aleatorio para proteger las copias (si no, usa `CRON_SECRET`) |
| `MAX_DEVICES` | opcional: tope de teléfonos con recordatorios (por defecto 500) |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |

Luego **Redeploy**.

### 4. Tarea que envía los avisos cada minuto
Abre `supabase/cron.sql`, cambia `TU-APP.vercel.app` y `TU_CRON_SECRET`, y ejecútalo en el SQL Editor de Supabase.

### 5. En el teléfono
- **iPhone (iOS 16.4+)**: Safari → Compartir → *Añadir a pantalla de inicio* → abre la app desde el ícono → Ajustes → Activar recordatorios → Enviar prueba.
- **Android**: Chrome → ⋮ → *Instalar app* → Ajustes → Activar recordatorios. En Samsung/Xiaomi quita el ahorro de batería a Chrome.

> Supabase Free pausa el proyecto tras 7 días sin actividad. Como el cron llama cada minuto, se mantiene activo.

## Seguridad (beta)

- Cuestionario de salud (PAR-Q+ adaptado) y aviso médico obligatorios; solo mayores de 18; meta mínima por IMC 18.5.
- Todas las rutas del servidor validan los datos y limitan peticiones (memoria + función `hit_rate_limit` en Supabase).
- Las suscripciones push solo se aceptan de los servicios oficiales (Apple, Google, Mozilla, Microsoft) y hay un tope de dispositivos.
- Las copias en la nube usan un código de 12+ caracteres guardado como HMAC con un secreto del servidor, con pocos intentos por IP.
- Las tablas tienen RLS activado sin políticas: solo el servidor (service_role) accede.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Sin variables de entorno la app funciona completa en el teléfono; solo las notificaciones y la copia en la nube necesitan Supabase.

## Privacidad
Los datos viven en el teléfono (localStorage). Las fotos de progreso **nunca** salen del teléfono (IndexedDB). En Supabase solo se guardan tu horario de recordatorios y, si lo activas, la copia de seguridad protegida por tu código.

Valores nutricionales aproximados (USDA). Esta app no sustituye el consejo médico.

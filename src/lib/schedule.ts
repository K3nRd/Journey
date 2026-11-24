import type { MealSlot, Profile, TimelineItem } from "./types";
import { goalOf, mealsPerDay, slotLabel, slotsFor } from "./meals";
import { fromMin, toMin, daysBetween, dateKey, parseKey } from "./date";
import { sessionForDate } from "./workout";

export const REMINDER_KINDS: { id: string; label: string; desc: string }[] = [
  { id: "habitos", label: "Hábitos", desc: "Despertar, agua, organizar, desconectar" },
  { id: "comidas", label: "Comidas", desc: "Cada comida de tu plan, a su hora" },
  { id: "gym", label: "Gimnasio", desc: "30 min antes de entrenar" },
  { id: "pausas", label: "Pausas activas", desc: "Levantarte cada 2 horas mientras trabajas" },
  { id: "caminar", label: "Caminata", desc: "Tu caminata diaria" },
  { id: "seguimiento", label: "Seguimiento", desc: "Pesaje, cintura, fotos y revisión semanal" },
  { id: "sueno", label: "Sueño", desc: "Soltar el teléfono y hora de dormir" },
];

export interface ScheduleOptions {
  overrides?: Record<string, string>;
}

/** Genera la rutina de un día a partir del perfil. */
export function buildTimeline(p: Profile, key: string, opts: ScheduleOptions = {}): TimelineItem[] {
  const d = parseKey(key);
  const wd = d.getDay();
  const wake = toMin(p.wakeTime);
  let sleep = toMin(p.sleepTime);
  if (sleep <= wake) sleep += 1440;
  const isWork = p.workDays.includes(wd);
  const ws = toMin(p.workStart);
  let we = toMin(p.workEnd);
  if (we <= ws) we += 1440;
  const session = sessionForDate(p, key);
  const isGym = session.type === "fuerza";
  const isCardio = session.type === "cardio";
  const gym = toMin(p.gymTime);
  const gymEnd = gym + p.gymDurationMin;
  const items: TimelineItem[] = [];
  const h = p.habits;

  const add = (t: Omit<TimelineItem, "time"> & { min: number }) => {
    const { min, ...rest } = t;
    items.push({ ...rest, time: fromMin(min) });
  };

  add({
    id: "despertar",
    min: wake,
    title: h.agua ? "Despertar y tomar un vaso de agua" : "Despertar",
    desc: "Abre las cortinas y toma luz natural unos minutos.",
    kind: "habit",
    icon: "Sunrise",
    checkable: true,
    remind: true,
    reminderKind: "habitos",
  });

  if (h.sueno) {
    add({
      id: "registro-sueno",
      min: wake + 3,
      title: "Registrar cómo dormiste",
      kind: "track",
      icon: "Moon",
      href: "/registro",
      checkable: true,
      remind: false,
      reminderKind: "sueno",
    });
  }

  if (h.pesaje && [1, 3, 5].includes(wd)) {
    add({
      id: "pesaje",
      min: wake + 5,
      title: "Pesarte en ayunas",
      desc: "Después de ir al baño, antes de comer o beber.",
      kind: "track",
      icon: "Scale",
      href: "/progreso?registrar=peso",
      checkable: true,
      remind: true,
      reminderKind: "seguimiento",
    });
  }
  if (wd === 1) {
    add({
      id: "cintura",
      min: wake + 7,
      title: "Medir la cintura",
      desc: "A la altura del ombligo, relajado, sin apretar la cinta.",
      kind: "track",
      icon: "Ruler",
      href: "/progreso?registrar=cintura",
      checkable: true,
      remind: true,
      reminderKind: "seguimiento",
    });
  }
  const daysIn = daysBetween(p.startDate, key);
  if (daysIn >= 0 && daysIn % 28 === 0) {
    add({
      id: "fotos",
      min: wake + 8,
      title: "Fotos de progreso",
      desc: "Frente, lado y espalda, con la misma luz y ropa.",
      kind: "track",
      icon: "Camera",
      href: "/progreso/fotos",
      checkable: true,
      remind: true,
      reminderKind: "seguimiento",
    });
  }

  if (h.organizar) {
    add({
      id: "organizar",
      min: wake + 15,
      title: "Tender la cama y ordenar tu espacio",
      desc: "10 minutos. Revisa tus 3 prioridades del día.",
      kind: "habit",
      icon: "ListChecks",
      checkable: true,
      remind: false,
      reminderKind: "habitos",
    });
  }

  // ── Horario de comidas (según cuántas haga, su objetivo y su día) ──
  const count = mealsPerDay(p);
  const goal = goalOf(p);
  const slots = slotsFor(count);
  const r15 = (m: number) => Math.round(m / 15) * 15;
  const comida1 = Math.min(wake + 45, isWork ? Math.max(wake + 20, ws - 10) : wake + 60);
  const almuerzo = slots.includes("almuerzo") ? r15(isWork ? (ws + we) / 2 : comida1 + 240) : null;
  const cenaMeal = isGym ? gymEnd + 40 : Math.min(sleep - 150, Math.max(toMin("19:00"), comida1 + 360));
  const meriendaMin = isGym ? gym - 75 : r15(((almuerzo ?? comida1) + cenaMeal) / 2);
  const snackMin = slots.includes("snack")
    ? goal === "ganar"
      ? Math.max(cenaMeal + 75, sleep - 90)
      : r15((comida1 + (almuerzo ?? meriendaMin)) / 2)
    : null;
  const label = (slot: MealSlot) => slotLabel(slot, count, isGym, goal);

  add({
    id: "comida1",
    min: comida1,
    title: label("comida1"),
    kind: "meal",
    meal: "comida1",
    icon: "Utensils",
    href: "/nutricion",
    checkable: true,
    remind: true,
    reminderKind: "comidas",
  });

  // Trabajo
  let walkMin: number;
  if (isWork) {
    add({
      id: "trabajo",
      min: ws,
      end: fromMin(we),
      title: "Trabajo",
      desc: p.workType === "sentado" ? "Pausa activa cada 1–2 horas." : undefined,
      kind: "work",
      icon: "Briefcase",
      checkable: false,
      remind: false,
      reminderKind: "habitos",
    } as TimelineItem & { min: number });
    // Caminar después de almorzar ayuda a controlar el azúcar en sangre
    walkMin = almuerzo !== null ? almuerzo + 30 : ws + Math.round((we - ws) / 2 / 30) * 30;
    if (h.pausas) {
      let n = 1;
      // La evidencia favorece moverse cada 30–60 min; avisamos cada 90 para no saturar
      for (let t = ws + 90; t < we - 30; t += 90) {
        if (Math.abs(t - walkMin) < 45 || (almuerzo !== null && Math.abs(t - almuerzo) < 40)) continue;
        add({
          id: `pausa-${n++}`,
          min: t,
          title: "Pausa activa + agua",
          desc: "Levántate 3–5 min, camina y toma agua. Ideal: muévete un poco cada 30–60 min.",
          kind: "break",
          icon: "PersonStanding",
          checkable: true,
          remind: true,
          reminderKind: "pausas",
        });
      }
    }
  } else {
    walkMin = wake + 180;
  }

  if (h.caminar) {
    add({
      id: "caminar",
      min: walkMin,
      title: isWork ? (almuerzo !== null ? "Caminar 10–15 min tras almorzar" : "Caminar 10–15 min") : "Caminar 30 min",
      desc: `Meta: ${p.stepsGoal.toLocaleString("es-DO")} pasos en el día.`,
      kind: "walk",
      icon: "Footprints",
      checkable: true,
      remind: true,
      reminderKind: "caminar",
    });
  }

  if (almuerzo !== null) {
    add({
      id: "almuerzo",
      min: almuerzo,
      title: label("almuerzo"),
      kind: "meal",
      meal: "almuerzo",
      icon: "Utensils",
      href: "/nutricion",
      checkable: true,
      remind: true,
      reminderKind: "comidas",
    });
  }
  if (snackMin !== null) {
    add({
      id: "snack",
      min: snackMin,
      title: label("snack"),
      kind: "meal",
      meal: "snack",
      icon: "Apple",
      href: "/nutricion",
      checkable: true,
      remind: true,
      reminderKind: "comidas",
    });
  }

  // Merienda, gimnasio y cena
  const merienda = meriendaMin;
  add({
    id: "merienda",
    min: merienda,
    title: label("merienda"),
    kind: "meal",
    meal: "merienda",
    icon: "Apple",
    href: "/nutricion",
    checkable: true,
    remind: true,
    reminderKind: "comidas",
  });

  if (isGym) {
    add({
      id: "gym",
      min: gym,
      end: fromMin(gymEnd),
      title: `Gimnasio: ${session.title}`,
      desc: "Calentamiento, entrenamiento y estiramiento.",
      kind: "gym",
      icon: "Dumbbell",
      href: "/entreno/hoy",
      checkable: true,
      remind: true,
      reminderKind: "gym",
    });
  } else if (isCardio) {
    add({
      id: "cardio",
      min: Math.max(wake + 120, Math.min(gym, wake + 240)),
      end: fromMin(Math.max(wake + 120, Math.min(gym, wake + 240)) + 50),
      title: "Cardio y movilidad (opcional)",
      desc: "Caminata inclinada o al aire libre + estiramientos.",
      kind: "cardio",
      icon: "HeartPulse",
      href: "/entreno/hoy",
      checkable: true,
      remind: true,
      reminderKind: "gym",
    });
  }

  if (wd === 6) {
    add({
      id: "compras",
      min: wake + 150,
      title: "Compras de la semana",
      desc: "Usa la lista de compras de la app.",
      kind: "habit",
      icon: "ShoppingCart",
      href: "/nutricion/compras",
      checkable: true,
      remind: true,
      reminderKind: "habitos",
    });
  }
  if (wd === 0) {
    add({
      id: "meal-prep",
      min: wake + 180,
      title: "Preparar comidas de la semana",
      desc: "Arroz, habichuelas, pollo adobado y huevos duros.",
      kind: "habit",
      icon: "ChefHat",
      href: "/nutricion/preparacion",
      checkable: true,
      remind: true,
      reminderKind: "habitos",
    });
  }

  const cena = cenaMeal;
  add({
    id: "cena",
    min: cena,
    title: label("cena"),
    kind: "meal",
    meal: "cena",
    icon: "Soup",
    href: "/nutricion",
    checkable: true,
    remind: true,
    reminderKind: "comidas",
  });

  if (h.desconectar) {
    const t = isWork && !isGym ? we + 30 : cena + 40;
    if (t < sleep - 70) {
      add({
        id: "desconectar",
        min: t,
        title: "Tiempo para desconectar",
        desc: "Nada de trabajo. Mira ideas en Más → Desconectar.",
        kind: "habit",
        icon: "Sofa",
        href: "/desconectar",
        checkable: true,
        remind: false,
        reminderKind: "habitos",
      });
    }
  }

  if (wd === 0) {
    add({
      id: "revision",
      min: Math.min(sleep - 120, toMin("19:00")),
      title: "Revisión semanal",
      desc: "3 preguntas y el resumen de tu semana.",
      kind: "track",
      icon: "ClipboardCheck",
      href: "/revision",
      checkable: true,
      remind: true,
      reminderKind: "seguimiento",
    });
  }

  // La cafeína hasta 6 h antes de dormir ya quita sueño: avisamos 8 h antes
  if (h.sueno || h.telefono) {
    add({
      id: "ultimo-cafe",
      min: sleep - 8 * 60,
      title: "Último café del día",
      desc: "Después de esta hora, nada de café, té negro, cola ni energizantes.",
      kind: "habit",
      icon: "Coffee",
      checkable: false,
      remind: true,
      reminderKind: "sueno",
    });
  }

  if (h.telefono) {
    add({
      id: "telefono",
      min: sleep - 60,
      title: "Soltar el teléfono",
      desc: "Modo nocturno y cargador lejos de la cama.",
      kind: "sleep",
      icon: "SmartphoneCharging",
      checkable: true,
      remind: true,
      reminderKind: "sueno",
    });
  }

  add({
    id: "dormir",
    min: sleep,
    title: "Dormir",
    desc: `Para ${((wake + 1440 - sleep) % 1440) / 60} h de sueño.`,
    kind: "sleep",
    icon: "BedDouble",
    checkable: true,
    remind: true,
    reminderKind: "sueno",
  });

  // Ajustes manuales
  const ov = opts.overrides ?? {};
  for (const it of items) if (ov[it.id]) it.time = ov[it.id];

  const sortKey = (t: string) => {
    const m = toMin(t);
    return m < wake - 120 ? m + 1440 : m; // lo que pasa de medianoche va al final
  };
  return items.sort((a, b) => sortKey(a.time) - sortKey(b.time));
}

export interface ServerReminder {
  id: string;
  day: number; // 0-6
  time: string; // HH:MM local
  title: string;
  body: string;
  url: string;
  date?: string; // si existe, solo se envía ese día (YYYY-MM-DD)
}

/** Recordatorios de toda la semana para enviarlos al servidor de notificaciones. */
export function buildWeeklyReminders(p: Profile, overrides: Record<string, string>): ServerReminder[] {
  const out: ServerReminder[] = [];
  const base = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const key = dateKey(d);
    const wd = d.getDay();
    for (const it of buildTimeline(p, key, { overrides })) {
      if (!it.remind || !p.reminderKinds[it.reminderKind]) continue;
      let time = it.time;
      let title = it.title;
      let body = it.desc ?? "";
      if (it.kind === "gym") {
        time = fromMin(toMin(it.time) - 30);
        title = "En 30 minutos: gimnasio 💪";
        body = it.title.replace("Gimnasio: ", "Hoy toca ") + ". Revisa los ejercicios antes de salir.";
      } else if (it.kind === "meal") {
        title = `${emojiFor(it.id)} ${it.title}`;
        body = "Toca para ver tu receta de hoy.";
      } else if (it.id === "despertar") {
        title = "☀️ Buenos días";
        body = p.habits.agua ? "Empieza con un vaso de agua." : "Hora de empezar el día.";
      }
      // Lo que pasa después de medianoche pertenece al día siguiente
      const afterMidnight = toMin(time) < toMin(p.wakeTime) - 120;
      const realKey = afterMidnight ? dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) : key;
      out.push({
        id: it.id,
        day: afterMidnight ? (wd + 1) % 7 : wd,
        time,
        title,
        body,
        url: it.href ?? "/",
        ...(it.id === "fotos" ? { date: realKey } : {}),
      });
    }
  }
  return out;
}

function emojiFor(id: string) {
  return id === "comida1" ? "🍳" : id === "merienda" || id === "snack" ? "🍌" : "🍗";
}

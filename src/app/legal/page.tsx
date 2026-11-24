"use client";

import { PageHeader, Card } from "@/components/ui";

export default function Legal() {
  return (
    <div>
      <PageHeader title="Términos y privacidad" subtitle="Versión beta · actualizado nov. 2026" back />

      <Card className="space-y-2 text-sm leading-relaxed text-fg/85">
        <h2 className="font-display text-lg font-bold text-fg">Aviso médico</h2>
        <p>
          Journey ofrece información general sobre entrenamiento, alimentación y hábitos. No es un servicio médico ni sustituye la
          evaluación de un médico, nutricionista o entrenador certificado. Las calorías, porciones y cantidades son estimaciones.
        </p>
        <p>
          Consulta a un profesional antes de empezar si tienes una condición de salud, tomas medicamentos, estás embarazada o tienes o
          tuviste un trastorno alimentario. Detén el ejercicio y busca atención si sientes dolor en el pecho, mareo, falta de aire
          desproporcionada o dolor en una articulación.
        </p>
        <p>Journey es para personas de 18 años o más.</p>
      </Card>

      <Card className="mt-3 space-y-2 text-sm leading-relaxed text-fg/85">
        <h2 className="font-display text-lg font-bold text-fg">Privacidad</h2>
        <p>
          <b className="text-fg">En tu teléfono:</b> tu perfil, tus respuestas de salud, tus registros de peso, comida, sueño y
          entrenamientos se guardan en el almacenamiento de tu navegador. Las <b className="text-fg">fotos de progreso nunca salen de tu teléfono</b>.
        </p>
        <p>
          <b className="text-fg">En nuestro servidor</b> (Supabase, solo si activas estas funciones):
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Recordatorios: la dirección de notificaciones de tu teléfono, tu zona horaria, las horas de tus recordatorios y qué marcaste como hecho.</li>
          <li>Copia en la nube: una copia de tus datos (sin fotos) identificada por tu código secreto. Cualquiera con tu código puede leerla, así que usa uno largo y no lo compartas.</li>
        </ul>
        <p>
          No vendemos ni compartimos tus datos, no usamos publicidad ni rastreadores. Si escaneas un código de barras, el código se consulta
          en Open Food Facts.
        </p>
        <p>
          <b className="text-fg">Borrar tus datos:</b> en Ajustes → «Borrar todos mis datos» se eliminan los datos del teléfono y se
          desactivan los recordatorios en el servidor. Para borrar una copia en la nube, escríbenos.
        </p>
      </Card>

      <Card className="mt-3 space-y-2 text-sm leading-relaxed text-fg/85">
        <h2 className="font-display text-lg font-bold text-fg">Términos de uso</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Journey se ofrece gratis, en versión beta y «tal cual», sin garantías de disponibilidad ni de resultados.</li>
          <li>Eres responsable de usar el plan de forma segura y de adaptar cargas y comidas a tu condición.</li>
          <li>No intentes abusar del servicio (registros masivos, ataques o accesos a datos ajenos).</li>
          <li>Podemos cambiar o detener el servicio. Exporta tus datos desde Ajustes cuando quieras.</li>
        </ul>
      </Card>

      <Card className="mt-3 space-y-1 text-xs text-muted">
        <p>Fotos de ejercicios: free-exercise-db (dominio público).</p>
        <p>Datos de productos: Open Food Facts (licencia ODbL).</p>
        <p>Valores nutricionales aproximados basados en USDA FoodData Central.</p>
      </Card>
    </div>
  );
}

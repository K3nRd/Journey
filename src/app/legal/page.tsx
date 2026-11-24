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
          <b className="text-fg">Tu cuenta:</b> tu correo (o tu cuenta de Google) y una copia de tus datos de Journey —perfil, respuestas de
          salud, registros de peso, comida, sueño y entrenamientos— se guardan en nuestro servidor (Supabase) para que no los pierdas al
          cambiar de teléfono. Solo tú puedes leerlos con tu sesión iniciada.
        </p>
        <p>
          <b className="text-fg">Solo en tu teléfono:</b> las <b className="text-fg">fotos de progreso nunca salen de tu teléfono</b>.
        </p>
        <p>
          <b className="text-fg">Recordatorios:</b> si los activas, guardamos la dirección de notificaciones de tu teléfono, tu zona horaria,
          las horas de tus recordatorios y qué marcaste como hecho.
        </p>
        <p>
          No vendemos ni compartimos tus datos, no usamos publicidad ni rastreadores. Si escaneas un código de barras, el código se consulta
          en Open Food Facts.
        </p>
        <p>
          <b className="text-fg">Borrar tus datos:</b> en Ajustes → «Borrar mi cuenta y mis datos» se eliminan para siempre tu cuenta y todos
          tus datos, en el teléfono y en el servidor.
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

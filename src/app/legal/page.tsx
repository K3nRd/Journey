"use client";

import type { ReactNode } from "react";
import { PageHeader, Card } from "@/components/ui";

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const OWNER = process.env.NEXT_PUBLIC_LEGAL_OWNER || "el administrador de Journey";
const UPDATED = "24 de noviembre de 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="mt-3 space-y-2 text-sm leading-relaxed text-fg/85">
      <h2 className="font-display text-lg font-bold text-fg">{title}</h2>
      {children}
    </Card>
  );
}

export default function Legal() {
  const contact = CONTACT ? (
    <a href={`mailto:${CONTACT}`} className="text-accent-text underline">
      {CONTACT}
    </a>
  ) : (
    <>la persona que te invitó a Journey</>
  );

  return (
    <div>
      <PageHeader title="Términos y privacidad" subtitle={`Versión beta · actualizado el ${UPDATED}`} back />

      <Section title="1. Aviso médico">
        <p>
          Journey ofrece información general sobre entrenamiento, alimentación y hábitos. <b className="text-fg">No es un servicio médico</b> ni
          sustituye la evaluación de un médico, nutricionista o entrenador certificado. Las calorías, porciones y cantidades son estimaciones.
        </p>
        <p>
          Consulta a un profesional antes de empezar si tienes una condición de salud, tomas medicamentos, estás embarazada o tienes o tuviste un
          trastorno alimentario. Detén el ejercicio y busca atención si sientes dolor en el pecho, mareo, falta de aire desproporcionada o dolor
          en una articulación. Journey es solo para personas de <b className="text-fg">18 años o más</b>.
        </p>
      </Section>

      <Section title="2. Quién trata tus datos">
        <p>
          Responsable: {OWNER}, en República Dominicana. Contacto para cualquier tema de privacidad: {contact}.
        </p>
        <p>Esta política se rige por la Ley 172-13 de la República Dominicana sobre protección de datos de carácter personal.</p>
      </Section>

      <Section title="3. Qué datos guardamos y para qué">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <b className="text-fg">Cuenta:</b> tu correo y tu contraseña (Supabase la guarda protegida con un hash; nadie, ni nosotros, puede verla). Para identificarte y
            que tus datos te sigan en cualquier teléfono.
          </li>
          <li>
            <b className="text-fg">Datos de salud y hábitos (sensibles):</b> perfil, peso, medidas, respuestas del cuestionario de salud, comidas,
            sueño, ánimo y entrenamientos. <b className="text-fg">Solo para armar y ajustar tu plan.</b> Los guardamos únicamente con tu
            autorización expresa.
          </li>
          <li>
            <b className="text-fg">Recordatorios (si los activas):</b> la dirección de notificaciones de tu teléfono, tu zona horaria, las horas de
            tus recordatorios y qué marcaste como hecho.
          </li>
          <li>
            <b className="text-fg">Fotos de progreso:</b> se guardan <b className="text-fg">solo en tu teléfono</b>. Nunca se suben a internet.
          </li>
        </ul>
        <p>
          No usamos publicidad, rastreadores, análisis de terceros ni cookies de seguimiento. No vendemos, alquilamos ni compartimos tus datos con
          nadie para fines comerciales.
        </p>
      </Section>

      <Section title="4. Dónde se guardan">
        <p>
          Usamos proveedores que tratan los datos por cuenta nuestra, con cifrado en tránsito (HTTPS) y en reposo:{" "}
          <b className="text-fg">Supabase</b> (base de datos y cuentas) y <b className="text-fg">Vercel</b> (la app), con servidores en{" "}
          <b className="text-fg">Estados Unidos</b>. Al aceptar, autorizas esta transferencia internacional.
        </p>
        <p>
          Si escaneas un código de barras, solo ese número se consulta en Open Food Facts, una base de datos pública. No enviamos nada más.
        </p>
      </Section>

      <Section title="5. Cuánto tiempo">
        <ul className="list-disc space-y-1 pl-5">
          <li>Tus datos de la cuenta: mientras tengas la cuenta. Al borrarla, se eliminan de inmediato.</li>
          <li>Registro de recordatorios enviados y hechos: 14 días.</li>
          <li>Registros técnicos de seguridad (límite de intentos): 24 horas.</li>
        </ul>
      </Section>

      <Section title="6. Tus derechos">
        <p>Puedes en cualquier momento:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b className="text-fg">Acceder y llevarte tus datos:</b> Ajustes → Respaldo → Exportar.
          </li>
          <li>
            <b className="text-fg">Rectificarlos:</b> editando tu perfil y tus registros en la app.
          </li>
          <li>
            <b className="text-fg">Cancelarlos (borrarlos):</b> Ajustes → «Borrar mi cuenta y mis datos». Se elimina todo del servidor.
          </li>
          <li>
            <b className="text-fg">Oponerte o retirar tu autorización:</b> desactiva los recordatorios o borra tu cuenta.
          </li>
        </ul>
        <p>Para cualquier otra solicitud escribe a {contact}. Te respondemos lo antes posible.</p>
      </Section>

      <Section title="7. Seguridad">
        <p>
          Conexión cifrada, contraseñas protegidas con hash, cada persona solo puede leer sus propios datos (reglas a nivel de base de datos), límites contra
          intentos abusivos y claves secretas solo en el servidor. Ningún sistema es 100 % infalible: si ocurriera un incidente que afecte tus
          datos, te avisaríamos sin demora.
        </p>
      </Section>

      <Section title="8. Términos de uso">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Journey se ofrece gratis, en versión beta y «tal cual», sin garantías de disponibilidad ni de resultados.</li>
          <li>Eres responsable de usar el plan de forma segura y de adaptar cargas y comidas a tu condición.</li>
          <li>Tu cuenta es personal. No compartas tu contraseña.</li>
          <li>No intentes abusar del servicio: registros masivos, ataques o acceso a datos ajenos. Podemos cerrar cuentas que lo hagan.</li>
          <li>Podemos cambiar o detener el servicio. Si cambian estos términos, te avisaremos en la app.</li>
        </ul>
      </Section>

      <Section title="9. Créditos">
        <p className="text-xs text-muted">
          Fotos de ejercicios: free-exercise-db (dominio público). Datos de productos: Open Food Facts (licencia ODbL). Valores nutricionales
          aproximados basados en USDA FoodData Central. Recomendaciones de salud basadas en la OMS y la literatura científica citada en la Guía.
        </p>
      </Section>
    </div>
  );
}

"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidad">
      <p>
        Esta política explica cómo MakeItRight recopila, utiliza y protege tus datos personales
        cuando usas nuestro sitio web y los servicios asociados.
      </p>

      <Section title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento es MakeItRight. Los datos de registro de la sociedad están
          disponibles bajo solicitud; puedes pedirlos escribiéndonos a través del enlace de{" "}
          <ContactLink />.
        </p>
      </Section>
      <Section title="2. Qué datos recopilamos">
        <ul className="space-y-2">
          <li>
            <b>Datos de cuenta:</b> nombre, correo electrónico, teléfono (opcional), contraseña
            (almacenada cifrada), idioma y preferencias de región.
          </li>
          <li>
            <b>Datos de uso:</b> operaciones guardadas, datos introducidos en las calculadoras y el
            panel, alertas configuradas, páginas visitadas, información del dispositivo y
            navegador, y dirección IP.
          </li>
          <li>
            <b>Datos de pago:</b> los pagos se procesan a través de un proveedor externo. No
            almacenamos los números completos de tarjeta; recibimos únicamente el estado de la
            suscripción, el plan y los metadatos de facturación.
          </li>
          <li>
            <b>Comunicaciones:</b> mensajes que nos envías por soporte, por el asistente de chat o
            en los comentarios de herramientas compartidas.
          </li>
        </ul>
      </Section>
      <Section title="3. Por qué tratamos tus datos y base legal">
        <ul className="space-y-2">
          <li>Prestar el servicio y gestionar tu cuenta (ejecución de un contrato).</li>
          <li>Procesar pagos y gestionar las suscripciones (ejecución de un contrato).</li>
          <li>Enviar correos transaccionales y, si las configuras, alertas (ejecución de un contrato).</li>
          <li>Respuestas de chat basadas en tus consultas (ejecución de un contrato).</li>
          <li>Analizar el uso y mejorar el producto (interés legítimo).</li>
          <li>Comunicaciones de marketing y cookies no esenciales, solo con tu consentimiento (consentimiento).</li>
          <li>Cumplir obligaciones legales, como facturación e impuestos (obligación legal).</li>
        </ul>
      </Section>
      <Section title="4. Con quién compartimos tus datos">
        <p>
          Compartimos datos con proveedores que nos ayudan a operar, limitado a lo que cada uno
          necesita para su función:
        </p>
        <ul className="mt-3 space-y-2">
          <li><b>Supabase</b> — base de datos, autenticación y almacenamiento.</li>
          <li><b>Clerk</b> — autenticación de usuarios.</li>
          <li><b>Stripe</b> — procesamiento de pagos y facturación de suscripciones.</li>
          <li><b>Google (Gemini)</b> — generación de informes asistidos por IA y chat.</li>
          <li><b>Vercel y Vercel Analytics</b> — alojamiento y analítica del sitio.</li>
          <li><b>Sentry</b> — monitorización de errores.</li>
        </ul>
        <p className="mt-3">
          Exigimos a estos proveedores que protejan tus datos conforme a sus propios compromisos de
          privacidad y, cuando corresponde, mediante cláusulas contractuales tipo.{" "}
          <b>No vendemos tus datos personales.</b>
        </p>
      </Section>
      <Section title="5. Transferencias internacionales">
        <p>
          Algunos de los proveedores podrían tratar datos fuera del Espacio Económico Europeo, por
          ejemplo en Estados Unidos. En esos casos nos apoyamos en garantías adecuadas, como las
          Cláusulas Contractuales Tipo de la UE o la participación del proveedor en un marco de
          protección de datos aprobado (como el Data Privacy Framework UE-EE. UU.).
        </p>
      </Section>
      <Section title="6. Cuánto tiempo conservamos tus datos">
        <p>
          Conservamos los datos de tu cuenta mientras siga activa y durante un plazo razonable
          posterior para cumplir obligaciones legales, fiscales y de resolución de controversias.
          Puedes solicitar su eliminación anticipada; consulta la sección "Tus derechos".
        </p>
      </Section>
      <Section title="7. Tus derechos">
        <p>
          Conforme a la normativa aplicable, tienes derecho a acceder, rectificar, suprimir, limitar
          u oponerte al tratamiento de tus datos, a la portabilidad de los mismos y a retirar tu
          consentimiento en cualquier momento. También puedes presentar una reclamación ante tu
          autoridad de protección de datos (en España, la AEPD). Para ejercer cualquiera de estos
          derechos, escríbenos <ContactLink />.
        </p>
      </Section>
      <Section title="8. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables —entre ellas cifrado en tránsito,
          controles de acceso y contraseñas cifradas— para proteger tus datos. No obstante, ningún
          método de transmisión o almacenamiento es seguro al 100%.
        </p>
      </Section>
      <Section title="9. Menores">
        <p>
          El servicio no está dirigido a menores de 18 años y no recopilamos conscientemente datos
          de menores.
        </p>
      </Section>
      <Section title="10. Cambios en esta política">
        <p>
          Podemos actualizar esta política periódicamente. Los cambios sustanciales se notificarán a
          través del sitio web o por correo electrónico.
        </p>
      </Section>
      <Section title="11. Contacto">
        <p>
          Para cualquier consulta sobre esta política o sobre tus datos, contáctanos{" "}
          <ContactLink />.
        </p>
      </Section>
    </LegalPage>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
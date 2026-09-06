"use client"

import { LegalPage } from "@/components/legal-page"

export default function SecurityPage() {
  return (
    <LegalPage title="Seguridad">
      <Section title="1. Cifrado de datos">
        <p>
          Todas las comunicaciones entre tu dispositivo y nuestros servidores están cifradas con
          TLS (HTTPS), de modo que la información viaja protegida durante su transmisión. Además,
          los datos almacenados se cifran en reposo para protegerlos incluso ante un acceso físico
          no autorizado.
        </p>
      </Section>
      <Section title="2. Autenticación">
        <p>
          Las cuentas están protegidas mediante sistemas de autenticación seguros. Nunca
          almacenamos tu contraseña en texto plano y recomendamos usar un código único y robusto,
          idealmente gestionado con un gestor de contraseñas.
        </p>
      </Section>
      <Section title="3. Acceso controlado">
        <p>
          Limitamos el acceso a los datos de los usuarios al personal estrictamente necesario, que
          está sujeto a obligaciones de confidencialidad. Los accesos a los sistemas se registran y
          supervisan de forma continua.
        </p>
      </Section>
      <Section title="4. Buenas prácticas recomendadas">
        <ul className="space-y-2">
          <li>Utiliza una contraseña distinta a la de otros servicios.</li>
          <li>Cierra sesión cuando uses la aplicación en un dispositivo compartido.</li>
          <li>Mantén actualizado el navegador y el sistema operativo.</li>
          <li>No facilites tus credenciales a terceros.</li>
        </ul>
      </Section>
      <Section title="5. Notificación de incidentes">
        <p>
          En el improbable caso de un incidente de seguridad que afecte a tus datos, te lo
          notificaremos con la mayor brevedad possible y tomaremos las medidas necesarias para
          minimizar su impacto, conforme a la legislación aplicable.
        </p>
      </Section>
      <Section title="6. Comunicar una vulnerabilidad">
        <p>
          Si descubres una vulnerabilidad de seguridad en la plataforma, agradecemos que nos la
          comuniques de forma responsable en <b>security@makeitright.com</b> antes de divulgarla
          públicamente.
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
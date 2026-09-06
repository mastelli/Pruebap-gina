"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <Section title="1. ¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
          visitas un sitio web. Sirven para que la página funcione correctamente, recuerde tus
          preferencias y recopile información estadística de uso.
        </p>
      </Section>
      <Section title="2. Qué cookies utilizamos">
        <ul className="space-y-2">
          <li>
            <b>Cookies esenciales:</b> necesarias para el funcionamiento del sitio, como mantener tu
            sesión iniciada y recordar si has aceptado esta política.
          </li>
          <li>
            <b>Cookies de preferencias:</b> guardan tus ajustes, como el tema (claro u oscuro) y el
            idioma seleccionado.
          </li>
          <li>
            <b>Cookies de análisis:</b> nos ayudan a entender cómo se usa la plataforma (páginas más
            visitadas, duración de las visitas) para mejorarla. No incluyen datos personales.
          </li>
        </ul>
      </Section>
      <Section title="3. Gestión y eliminación">
        <p>
          Puedes configurar tu navegador para bloquear o eliminar las cookies. Ten en cuenta que
          algunas funciones, como iniciar sesión o guardar tus preferencias, podrían dejar de
          funcionar correctamente si las desactivas.
        </p>
      </Section>
      <Section title="4. Consentimiento">
        <p>
          Al continuar navegando por MakeItRight aceptas el uso de cookies descrito en esta
          política. Puedes retirar tu consentimiento en cualquier momento configurando tu
          navegador.
        </p>
      </Section>
      <Section title="5. Contacto">
        <p>
          Si tienes preguntas sobre el uso de cookies, escríbenos{" "}
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
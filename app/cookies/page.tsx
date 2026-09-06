"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"

export default function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies">
      <p>
        Esta Política de Cookies explica cómo MakeItRight utiliza cookies y tecnologías similares en
        nuestro sitio web.
      </p>

      <Section title="1. Qué son las cookies">
        <p>
          Las cookies son pequeños archivos almacenados en tu dispositivo que ayudan a que un sitio
          web funcione y nos permiten entender cómo se utiliza.
        </p>
      </Section>
      <Section title="2. Tipos de cookies que utilizamos">
        <ul className="space-y-2">
          <li>
            <b>Esenciales o estrictamente necesarias</b> — autenticación y gestión de sesión,
            seguridad y preferencias guardadas como tu idioma. No se pueden desactivar porque son
            necesarias para el funcionamiento del servicio.
          </li>
          <li>
            <b>Analíticas o de rendimiento</b> — nos ayudan a entender el uso y a mejorar el
            producto.
          </li>
          <li>
            <b>Publicitarias o de marketing</b> — se usan para medir y mejorar el rendimiento de
            nuestros anuncios; solo se cargan cuando está permitido.
          </li>
        </ul>
      </Section>
      <Section title="3. Cookies de terceros que utilizamos">
        <ul className="space-y-2">
          <li><b>Google Analytics (Google)</b> — analítica.</li>
          <li><b>Vercel Analytics / Speed Insights (Vercel)</b> — analítica y rendimiento.</li>
          <li><b>Stripe</b> — prevención de fraude durante el pago.</li>
          <li><b>Supabase</b> — autenticación y gestión de sesión.</li>
          <li><b>Clerk</b> — autenticación y gestión de sesión.</li>
        </ul>
      </Section>
      <Section title="4. Gestión de cookies">
        <p>
          Puedes ajustar la configuración de tu navegador para bloquear o eliminar cookies en
          cualquier momento. Ten en cuenta que bloquear las cookies esenciales puede afectar
          funcionalidades clave, como mantener tu sesión iniciada.
        </p>
      </Section>
      <Section title="5. Cambios en esta política">
        <p>
          Podemos actualizar esta Política de Cookies periódicamente y te lo notificaremos a través
          del sitio web o por correo electrónico.
        </p>
      </Section>
      <Section title="6. Contacto">
        <p>
          Para cualquier consulta sobre esta Política de Cookies, contáctanos <ContactLink />.
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
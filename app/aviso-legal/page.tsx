"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"

export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso Legal">
      <Section title="1. Identificación del responsable">
        <p>
          Este sitio web es operado por <b>MakeItRight</b>, plataforma de gestión de finanzas
          personales, con domicilio en España. Puedes ponerte en contacto con nosotros a través del{" "}
          <ContactLink />.
        </p>
      </Section>
      <Section title="2. Objeto">
        <p>
          El presente aviso legal regula el acceso y el uso del sitio web de MakeItRight, que ofrece
          herramientas de análisis financiero, calculadoras y contenido educativo para la gestión de
          finanzas personales.
        </p>
      </Section>
      <Section title="3. Responsabilidad">
        <p>
          Los contenidos publicados tienen carácter meramente informativo y educativo.{" "}
          <b>No constituyen asesoramiento financiero, fiscal, legal ni de inversión</b>. La
          utilización de la plataforma y las decisiones que se deriven de ella son responsabilidad
          exclusiva del usuario.
        </p>
        <p className="mt-3">
          MakeItRight no garantiza la absoluta disponibilidad, exactitud o actualidad de los
          servicios, y no se hace responsable de los daños derivados del mal uso de la plataforma o
          de interrupciones del servicio por causas ajenas a su control.
        </p>
      </Section>
      <Section title="4. Propiedad intelectual">
        <p>
          Los contenidos, marcas, logos y diseño del sitio son propiedad de MakeItRight o de sus
          titulares legítimos. Queda prohibida su reproducción, distribución o transformación sin
          autorización previa por escrito.
        </p>
      </Section>
      <Section title="5. Legislación aplicable y jurisdicción">
        <p>
          El presente aviso legal se rige por la legislación española. Para cualquier controversia
          derivada del uso de esta plataforma, las partes se someten a los juzgados y tribunales del
          domicilio del responsable.
        </p>
      </Section>
      <Section title="6. Contacto">
        <p>
          Para cualquier consulta sobre este aviso legal, puedes escribirnos{" "}
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
"use client"

import { LegalPage, ContactLink, BoldLink } from "@/components/legal-page"

export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso Legal">
      <p>
        Este documento, junto con la{" "}
        <BoldLink href="/privacidad">Política de Privacidad</BoldLink>, los{" "}
        <BoldLink href="/terminos">Términos de Servicio</BoldLink> y la{" "}
        <BoldLink href="/cookies">Política de Cookies</BoldLink>, regula el uso del sitio web
        MakeItRight (a partir de ahora, el "Sitio Web") y de todos los servicios que ofrecemos a
        través de él.
      </p>

      <Section title="1. Identificación del prestador">
        <p>
          El Sitio Web y el servicio MakeItRight están operados por MakeItRight, que actúa como
          prestador de servicios de la sociedad de la información.
        </p>
        <p className="mt-3">
          Los datos registrales de la sociedad y su domicilio social pueden solicitarse en cualquier
          momento; ponte en contacto a través del enlace de <ContactLink /> y te los facilitaremos.
        </p>
      </Section>
      <Section title="2. Objeto del Sitio Web">
        <p>
          MakeItRight es una plataforma orientada a la gestión de las finanzas personales: permite
          llevar el control del patrimonio, registrar y analizar ingresos y gastos, evaluar
          inversiones y utilizar calculadoras financieras, además de obtener asistencia con
          inteligencia artificial. Parte de estas funciones requieren una suscripción de pago.
        </p>
      </Section>
      <Section title="3. Condiciones de acceso y uso">
        <p>
          La mayor parte del contenido es de acceso libre, pero algunas funciones solo están
          disponibles tras registrarse y contar con una suscripción activa, tal y como se detalla en
          los <BoldLink href="/terminos">Términos de Servicio</BoldLink>. Al utilizar el Sitio Web te
          comprometes a hacerlo de forma
          honesta y dentro del marco legal, respetando las condiciones que establece este Aviso.
        </p>
      </Section>
      <Section title="4. Propiedad intelectual">
        <p>
          El software, el diseño, los textos, los gráficos, los logotipos y las marcas que aparecen
          en el Sitio Web son de nuestra titularidad o de nuestros licenciantes y están protegidos
          por la normativa de propiedad intelectual. Queda prohibida su reproducción, distribución o
          explotación comercial sin nuestra autorización previa y por escrito, salvo en los casos
          que permita expresamente la normativa aplicable.
        </p>
      </Section>
      <Section title="5. Responsabilidad">
        <p>
          Parte de la información financiera y de mercado que mostramos procede de fuentes públicas
          o de terceros y puede contener errores, estar incompleta o haber quedado desactualizada.
          Los contenidos, incluidos los informes elaborados con IA, tienen una finalidad
          exclusivamente divulgativa y en ningún caso suponen asesoramiento financiero, legal, fiscal
          o de inversión. Por tanto, no podemos garantizar la exactitud ni la vigencia de los datos
          que se presentan.
        </p>
      </Section>
      <Section title="6. Enlaces a sitios de terceros">
        <p>
          Es posible que el Sitio Web incluya enlaces a páginas externas. No tenemos ningún control
          sobre su contenido ni sobre sus políticas, por lo que declinamos cualquier responsabilidad
          en relación con esos sitios.
        </p>
      </Section>
      <Section title="7. Legislación aplicable y jurisdicción">
        <p>
          Las relaciones derivadas del uso del Sitio Web se rigen por la legislación española,
          sin perjuicio de las normas imperativas de protección de los consumidores que te resulten
          de aplicación cuando actúes como consumidor conforme al Derecho de la Unión Europea.
        </p>
      </Section>
      <Section title="8. Contacto">
        <p>
          Si tienes alguna duda sobre este Aviso Legal, puedes escribirnos desde el enlace de{" "}
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
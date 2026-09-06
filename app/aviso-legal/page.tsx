"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"

export default function LegalNoticePage() {
  return (
    <LegalPage title="Aviso Legal" updated="22 de agosto de 2026">
      <p>
        Este Aviso Legal, junto con nuestra Política de Privacidad, nuestros Términos de Servicio y
        nuestra Política de Cookies, se aplica al sitio web de MakeItRight (el "Sitio Web") y al
        servicio MakeItRight.
      </p>

      <Section title="1. Identificación del prestador">
        <p>
          El Sitio Web y el servicio MakeItRight son operados por MakeItRight ("nosotros" o
          "nuestro").
        </p>
        <p className="mt-3">
          Los datos corporativos completos (número de registro y domicilio social) están disponibles
          bajo solicitud — escríbenos <ContactLink /> y te los enviaremos.
        </p>
      </Section>
      <Section title="2. Objeto del Sitio Web">
        <p>
          MakeItRight ofrece una plataforma de gestión de finanzas personales e inversiones, que
          incluye control de patrimonio, análisis de ingresos y gastos, calculadoras financieras
          (interés compuesto, alquiler de inmuebles y acciones) e informes asistidos por IA,
          disponible mediante suscripción de pago.
        </p>
      </Section>
      <Section title="3. Condiciones de acceso y uso">
        <p>
          El acceso al Sitio Web es en general gratuito; determinadas funcionalidades requieren
          registro y una suscripción activa, tal como se describe en nuestros Términos de Servicio.
          Al usar el Sitio Web, aceptas utilizarlo de buena fe y conforme a los términos aplicables.
        </p>
      </Section>
      <Section title="4. Propiedad intelectual">
        <p>
          Todo el contenido del Sitio Web —software, diseño, textos, gráficos, logotipos y marcas—
          es propiedad nuestra o de nuestros licenciantes y está protegido por la legislación de
          propiedad intelectual. Ninguna parte puede reproducirse, distribuirse o utilizarse
          comercialmente sin nuestro consentimiento previo por escrito, salvo lo expresamente
          permitido en nuestros Términos de Servicio.
        </p>
      </Section>
      <Section title="5. Responsabilidad">
        <p>
          Los datos financieros, de mercado y demográficos mostrados en el Sitio Web pueden proceder,
          en parte, de fuentes públicas y de terceros. Estos datos pueden ser incompletos, estar
          desactualizados o contener errores. Todo el contenido, incluidos los informes generados con
          IA, se ofrece con fines meramente informativos y no constituye asesoramiento financiero,
          legal, fiscal ni de inversión. No garantizamos la exactitud, integridad ni actualidad de
          los datos mostrados.
        </p>
      </Section>
      <Section title="6. Enlaces a sitios de terceros">
        <p>
          El Sitio Web puede contener enlaces a sitios web de terceros. No nos hacemos responsables
          del contenido, exactitud o prácticas de dichos sitios.
        </p>
      </Section>
      <Section title="7. Legislación aplicable y jurisdicción">
        <p>
          Este Aviso Legal se rige por la legislación española, sin perjuicio de las normas
          imperativas de protección de los consumidores de tu país de residencia que puedan resultar
          aplicables si tienes la condición de consumidor conforme al Derecho de la UE.
        </p>
      </Section>
      <Section title="8. Contacto">
        <p>
          Para cualquier consulta sobre este Aviso Legal, contáctanos <ContactLink />.
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
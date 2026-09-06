"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"

export default function TermsPage() {
  return (
    <LegalPage title="Términos de Servicio">
      <p>
        Estos Términos de Servicio ("Términos") rigen el uso de MakeItRight, operado por MakeItRight
        ("nosotros"). Al crear una cuenta o utilizar el servicio, aceptas estos Términos.
      </p>

      <Section title="1. Descripción del servicio">
        <p>
          MakeItRight es una plataforma de gestión de finanzas personales por suscripción que facilita
          el control del patrimonio, el registro y análisis de ingresos y gastos, la evaluación de
          inversiones y el uso de calculadoras financieras, además de respuestas asistidas por IA.
        </p>
      </Section>
      <Section title="2. Registro de cuenta">
        <p>
          Debes facilitar información veraz al crear tu cuenta, mantener tus credenciales seguras y
          responder de la actividad que se realice bajo tu cuenta. Debes tener la edad legal para
          contratar en tu país de residencia.
        </p>
      </Section>
      <Section title="3. Suscripciones, facturación y pruebas gratuitas">
        <p>
          Los planes y precios se muestran antes de completar la compra. Las suscripciones se
          renuevan automáticamente por el mismo periodo salvo que se cancelen antes de la fecha de
          renovación. Cuando se ofrezcan, las pruebas gratuitas se convierten automáticamente en una
          suscripción de pago salvo que se cancelen antes del fin del periodo de prueba. Los precios
          se muestran en la moneda aplicable y pueden incluir o no impuestos según tu ubicación.
        </p>
      </Section>
      <Section title="4. Cancelación y reembolsos">
        <p>
          Puedes cancelar tu suscripción en cualquier momento desde los ajustes de tu cuenta; la
          cancelación surte efecto al final del periodo de facturación en curso y mantienes el acceso
          hasta entonces. Como el acceso se concede por el periodo completo ya pagado, por lo general
          no ofrecemos reembolsos prorrateados por periodos parciales, salvo cuando la ley lo exija
          (por ejemplo, el derecho de desistimiento de los consumidores de la UE, con las excepciones
          aplicables cuando consientas el acceso inmediato a un servicio o a contenido digital).
        </p>
      </Section>
      <Section title="5. Uso aceptable">
        <p>
          Te comprometes a no extraer datos (scraping), realizar ingeniería inversa ni revender
          nuestros datos o la plataforma sin nuestro permiso por escrito, a no usar el servicio con
          fines ilícitos, abusivos o fraudulentos, y a no intentar eludir los límites de uso o las
          medidas de seguridad.
        </p>
      </Section>
      <Section title="6. Exactitud de los datos y ausencia de asesoramiento de inversión">
        <p>
          Parte de los datos financieros y de mercado mostrados en el servicio puede proceder de
          fuentes públicas o de terceros. Estos datos pueden ser incompletos, estar desactualizados o
          contener errores, y no estamos afiliados ni respaldados por ninguno de esos proveedores.
          Todo el contenido, incluida la asistencia prestada con IA, se ofrece con fines meramente
          informativos y no constituye asesoramiento financiero, legal, fiscal ni de inversión. Eres
          el único responsable de tus decisiones de inversión y debes verificar de forma independiente
          los datos y buscar asesoramiento profesional antes de actuar en base a ellos.
        </p>
      </Section>
      <Section title="7. Propiedad intelectual">
        <p>
          La plataforma, el software, el diseño y las marcas son propiedad nuestra o de nuestros
          licenciantes. Al suscribirte se te concede una licencia limitada, no exclusiva e
          intransferible para usar el servicio con fines internos propios.
        </p>
      </Section>
      <Section title="8. Limitación de responsabilidad">
        <p>
          En la máxima medida permitida por la ley, no seremos responsables de daños indirectos,
          incidentales o consecuentes, ni de pérdidas de inversión derivadas de la confianza
          depositada en los datos o respuestas del servicio. Nada en estos Términos limita la
          responsabilidad que no pueda excluirse conforme a la ley aplicable, incluida la
          responsabilidad por fraude o, para los consumidores de la UE, los derechos imperativos de
          protección al consumidor.
        </p>
      </Section>
      <Section title="9. Terminación">
        <p>
          Podemos suspender o cancelar cuentas que incumplan estos Términos. Puedes dejar de usar el
          servicio y cancelar tu suscripción en cualquier momento.
        </p>
      </Section>
      <Section title="10. Cambios en estos Términos">
        <p>
          Podemos actualizar estos Términos periódicamente. El uso continuado del servicio tras la
          entrada en vigor de los cambios constituye la aceptación de los Términos actualizados. Te
          notificaremos los cambios sustanciales a través del sitio web o por correo electrónico.
        </p>
      </Section>
      <Section title="11. Legislación aplicable">
        <p>
          Estos Términos se rigen por la legislación española, sin perjuicio de las normas imperativas
          de protección de los consumidores de tu país de residencia que puedan resultar aplicables si
          tienes la condición de consumidor conforme al Derecho de la UE.
        </p>
      </Section>
      <Section title="12. Contacto">
        <p>
          Para cualquier consulta sobre estos Términos, contáctanos <ContactLink />.
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
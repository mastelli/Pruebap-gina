"use client"

import { LegalPage } from "@/components/legal-page"

export default function TermsPage() {
  return (
    <LegalPage title="Términos y condiciones">
      <Section title="1. Aceptación de los términos">
        <p>
          Al acceder o utilizar MakeItRight aceptas los presentes términos y condiciones, así como
          nuestra política de privacidad. Si no estás de acuerdo con ellos, te pedimos que no
          utilices el servicio.
        </p>
      </Section>
      <Section title="2. Uso del servicio">
        <p>
          MakeItRight te otorga una licencia personal, no transferible y no exclusiva para usar la
          plataforma con fines legítimos. No está permitido utilizar el servicio para actividades
          ilícitas, intentar vulnerar su seguridad, realizar ingeniería inversa ni extraer o
          reproducir de forma masiva su contenido sin autorización.
        </p>
      </Section>
      <Section title="3. Cuentas y seguridad">
        <p>
          Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda
          la actividad que se realice en tu cuenta. Si detectas un uso no autorizado, debes
          informarnos de inmediato y cambiar tu contraseña.
        </p>
      </Section>
      <Section title="4. Planes y pagos">
        <p>
          La plataforma ofrece un plan Estándar gratuito y planes de pago (Premium y Pro). Los
          precios y las condiciones vigentes se muestran en la sección de Planes. Puedes cancelar o
          cambiar tu plan en cualquier momento sin permanencia ni costes ocultos; los pagos ya
          realizados no son reembolsables salvo que lo exija la legislación aplicable.
        </p>
      </Section>
      <Section title="5. Limitación de responsabilidad">
        <p>
          MakeItRight ofrece herramientas de análisis y cálculo con fines informativos.{" "}
          <b>No constituye asesoramiento financiero, fiscal ni de inversión</b>. Las decisiones que
          tomes basándote en la información de la plataforma son de tu exclusiva responsabilidad.
        </p>
      </Section>
      <Section title="6. Cambios en los términos">
        <p>
          Podemos actualizar estos términos periódicamente para reflejar cambios en el servicio o
          por motivos legales. Las modificaciones entrarán en vigor desde su publicación en esta
          página, por lo que te recomendamos revisarla con regularidad.
        </p>
      </Section>
      <Section title="7. Contacto">
        <p>
          Para cualquier consulta relacionada con estos términos, puedes escribirnos a{" "}
          <b>legal@makeitright.com</b>.
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
"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de Privacidad">
      <Section title="1. Introducción">
        <p>
          En MakeItRight nos tomamos muy en serio tu privacidad. Esta política explica qué
          datos recopilamos, cómo los usamos y qué derechos tienes sobre ellos cuando utilizas
          nuestra plataforma y sus servicios.
        </p>
      </Section>
      <Section title="2. Datos que recopilamos">
        <p>
          Recopilamos la información mínima necesaria para ofrecerte el servicio:
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <b>Datos de cuenta:</b> nombre, apellidos y dirección de correo electrónico que usas
            para registrarte e iniciar sesión.
          </li>
          <li>
            <b>Datos financieros que introduces:</b> transacciones, saldos, inversiones y cualquier
            otra información que añadas voluntariamente en la aplicación.
          </li>
          <li>
            <b>Datos de uso:</b> páginas visitadas, calculadoras utilizadas y preferencias de
            configuración para mejorar la experiencia.
          </li>
        </ul>
      </Section>
      <Section title="3. Cómo usamos tus datos">
        <p>
          Utilizamos tus datos exclusivamente para prestar el servicio: mostrarte tu patrimonio y
          movimientos, sincronizar tu información entre dispositivos, mejorar nuestros productos y
          ofrecerte soporte técnico.{" "}
          <b>Nunca vendemos tus datos a terceros</b> y no los compartimos con anunciantes.
        </p>
      </Section>
      <Section title="4. Almacenamiento y seguridad">
        <p>
          Tus datos se almacenan con cifrado tanto en tránsito como en reposo. Limitamos el acceso
          a la información al personal estrictamente necesario y aplicamos los estándares de
          seguridad más exigentes de la industria.
        </p>
      </Section>
      <Section title="5. Tus derechos">
        <p>
          De acuerdo con la legislación de protección de datos (RGPD), tienes derecho a acceder,
          rectificar, suprimir, limitar el tratamiento y solicitar la portabilidad de tus datos. Para
          ejercer cualquiera de estos derechos, escríbenos{" "}
          <ContactLink />. También puedes eliminar tu cuenta y todos sus datos en
          cualquier momento desde los ajustes de la aplicación.
        </p>
      </Section>
      <Section title="6. Contacto">
        <p>
          Si tienes dudas sobre esta política o sobre el tratamiento de tus datos personales, puedes
          contactarnos <ContactLink />.
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
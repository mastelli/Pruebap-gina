"use client"

import { LegalPage, ContactLink, BoldLink } from "@/components/legal-page"
import { useLanguage } from "@/lib/i18n"

export default function LegalNoticePage() {
  const { t } = useLanguage()
  return (
    <LegalPage title="Legal Notice">
      <p>
        {t("Legal intro prefix")} <BoldLink href="/privacidad">{t("Privacy Policy")}</BoldLink>
        {t("Legal intro between")} <BoldLink href="/terminos">{t("Terms of Service")}</BoldLink>
        {t("Legal intro between2")} <BoldLink href="/cookies">{t("Cookie Policy")}</BoldLink>
        {t("Legal intro suffix")}
      </p>

      <Section title={t("1. Service provider identification")}>
        <p>{t("Legal provider text")}</p>
        <p className="mt-3">
          {t("Legal registry prefix")} <ContactLink /> {t("Legal registry suffix")}
        </p>
      </Section>
      <Section title={t("2. Purpose of the Website")}>
        <p>{t("Legal purpose text")}</p>
      </Section>
      <Section title={t("3. Access and use conditions")}>
        <p>
          {t("Legal access prefix")} <BoldLink href="/terminos">{t("Terms of Service")}</BoldLink>.{" "}
          {t("Legal access suffix")}
        </p>
      </Section>
      <Section title={t("4. Intellectual property")}>
        <p>{t("Legal IP text")}</p>
      </Section>
      <Section title={t("5. Liability")}>
        <p>{t("Legal liability text")}</p>
      </Section>
      <Section title={t("6. Links to third-party sites")}>
        <p>{t("Legal links text")}</p>
      </Section>
      <Section title={t("7. Governing law and jurisdiction")}>
        <p>{t("Legal law text")}</p>
      </Section>
      <Section title={t("8. Contact")}>
        <p>
          {t("Legal contact prefix")} <ContactLink />.
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
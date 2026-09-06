"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"
import { useLanguage } from "@/lib/i18n"

export default function TermsPage() {
  const { t } = useLanguage()
  return (
    <LegalPage title="Terms of Service">
      <p>{t("Terms intro")}</p>

      <Section title={t("1. Service description")}>
        <p>{t("Terms description text")}</p>
      </Section>
      <Section title={t("2. Account registration")}>
        <p>{t("Terms registration text")}</p>
      </Section>
      <Section title={t("3. Subscriptions, billing and free trials")}>
        <p>{t("Terms subscriptions text")}</p>
      </Section>
      <Section title={t("4. Cancellation and refunds")}>
        <p>{t("Terms cancellation text")}</p>
      </Section>
      <Section title={t("5. Acceptable use")}>
        <p>{t("Terms acceptable use text")}</p>
      </Section>
      <Section title={t("6. Data accuracy and no investment advice")}>
        <p>{t("Terms accuracy text")}</p>
      </Section>
      <Section title={t("7. Intellectual property")}>
        <p>{t("Terms IP text")}</p>
      </Section>
      <Section title={t("8. Limitation of liability")}>
        <p>{t("Terms liability text")}</p>
      </Section>
      <Section title={t("9. Termination")}>
        <p>{t("Terms termination text")}</p>
      </Section>
      <Section title={t("10. Changes to these Terms")}>
        <p>{t("Terms changes text")}</p>
      </Section>
      <Section title={t("11. Governing law")}>
        <p>{t("Terms law text")}</p>
      </Section>
      <Section title={t("12. Contact")}>
        <p>
          {t("Terms contact text")} <ContactLink />.
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
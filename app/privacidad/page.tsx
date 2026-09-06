"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"
import { useLanguage } from "@/lib/i18n"

export default function PrivacyPage() {
  const { t } = useLanguage()
  return (
    <LegalPage title="Privacy Policy">
      <p>{t("Privacy intro")}</p>

      <Section title={t("1. Data controller")}>
        <p>
          {t("Privacy controller text")} <ContactLink />.
        </p>
      </Section>
      <Section title={t("2. Data we collect")}>
        <ul className="space-y-2">
          <li>
            <b>{t("Account data")}:</b> {t("Account data desc")}
          </li>
          <li>
            <b>{t("Usage data")}:</b> {t("Usage data desc")}
          </li>
          <li>
            <b>{t("Payment data")}:</b> {t("Payment data desc")}
          </li>
          <li>
            <b>{t("Communications")}:</b> {t("Communications desc")}
          </li>
        </ul>
      </Section>
      <Section title={t("3. Why we process your data and legal basis")}>
        <ul className="space-y-2">
          <li>{t("Privacy basis service")}</li>
          <li>{t("Privacy basis payments")}</li>
          <li>{t("Privacy basis emails")}</li>
          <li>{t("Privacy basis chat")}</li>
          <li>{t("Privacy basis analytics")}</li>
          <li>{t("Privacy basis marketing")}</li>
          <li>{t("Privacy basis legal")}</li>
        </ul>
      </Section>
      <Section title={t("4. Who we share your data with")}>
        <p>{t("Privacy sharing intro")}</p>
        <ul className="mt-3 space-y-2">
          <li>{t("Shared Supabase")}</li>
          <li>{t("Shared Clerk")}</li>
          <li>{t("Shared Stripe")}</li>
          <li>{t("Shared Google")}</li>
          <li>{t("Shared Vercel")}</li>
          <li>{t("Shared Sentry")}</li>
        </ul>
        <p className="mt-3">{t("Privacy sharing outro")}</p>
      </Section>
      <Section title={t("5. International transfers")}>
        <p>{t("Privacy transfers text")}</p>
      </Section>
      <Section title={t("6. How long we keep your data")}>
        <p>{t("Privacy retention text")}</p>
      </Section>
      <Section title={t("7. Your rights")}>
        <p>
          {t("Privacy rights text")} <ContactLink />.
        </p>
      </Section>
      <Section title={t("8. Security")}>
        <p>{t("Privacy security text")}</p>
      </Section>
      <Section title={t("9. Minors")}>
        <p>{t("Privacy minors text")}</p>
      </Section>
      <Section title={t("10. Changes to this policy")}>
        <p>{t("Privacy changes text")}</p>
      </Section>
      <Section title={t("11. Contact")}>
        <p>
          {t("Privacy contact text")} <ContactLink />.
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
"use client"

import { LegalPage, ContactLink } from "@/components/legal-page"
import { useLanguage } from "@/lib/i18n"

export default function CookiesPage() {
  const { t } = useLanguage()
  return (
    <LegalPage title="Cookie Policy">
      <p>{t("Cookies intro")}</p>

      <Section title={t("1. What cookies are")}>
        <p>{t("Cookies what text")}</p>
      </Section>
      <Section title={t("2. Types of cookies we use")}>
        <ul className="space-y-2">
          <li>{t("Essential cookies")}</li>
          <li>{t("Analytics cookies")}</li>
          <li>{t("Marketing cookies")}</li>
        </ul>
      </Section>
      <Section title={t("3. Third-party cookies we use")}>
        <ul className="space-y-2">
          <li>{t("Cookie Google")}</li>
          <li>{t("Cookie Vercel")}</li>
          <li>{t("Cookie Stripe")}</li>
          <li>{t("Cookie Supabase")}</li>
          <li>{t("Cookie Clerk")}</li>
        </ul>
      </Section>
      <Section title={t("4. Managing cookies")}>
        <p>{t("Cookies manage text")}</p>
      </Section>
      <Section title={t("5. Changes to this policy")}>
        <p>{t("Cookies changes text")}</p>
      </Section>
      <Section title={t("6. Contact")}>
        <p>
          {t("Cookies contact text")} <ContactLink />.
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
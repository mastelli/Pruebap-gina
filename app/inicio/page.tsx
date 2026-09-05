"use client"

import { useLanguage } from "@/lib/i18n"
import { BusinessMetrics } from "@/components/business-metrics"

export default function InicioPage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("Dashboard")}</h1>
        <p className="text-sm text-muted-foreground">{t("Accounts Overview")}</p>
      </div>
      <BusinessMetrics />
    </div>
  )
}
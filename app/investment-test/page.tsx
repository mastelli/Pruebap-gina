"use client"

import { InvestmentTestDashboard } from "@/components/investment-test/investment-test-dashboard"
import { useLanguage } from "@/lib/i18n"

export default function InvestmentTestPage() {
  const { t } = useLanguage()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">{t("Investment Test")}</h2>
      <InvestmentTestDashboard />
    </div>
  )
}

"use client"

import { PortfolioPanel } from "@/components/analytics/portfolio-panel"
import { InvestmentOverview } from "@/components/analytics/investment-overview"
import { useLanguage } from "@/lib/i18n"

export default function InvestmentPage() {
  const { t } = useLanguage()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">{t("Savings and Investment")}</h2>
      <PortfolioPanel />
      <InvestmentOverview />
    </div>
  )
}
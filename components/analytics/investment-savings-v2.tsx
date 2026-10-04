"use client"

import { PortfolioPro } from "./portfolio-pro"
import { AnalyticsHeader } from "./analytics-header"

export function InvestmentSavingsV2() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 sm:p-8">
      <AnalyticsHeader titleKey="Savings and Investment" showActions={false} />

      <PortfolioPro />
    </div>
  )
}

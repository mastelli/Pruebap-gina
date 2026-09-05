"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { MetricTab } from "@/components/analytics/metric-tab"
import { IncomeOverview } from "@/components/analytics/income-overview"

export default function AnalyticsIncomePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AnalyticsHeader titleKey="Revenue" />
      <MetricTab
        titleKey="Revenue"
        hideTitle
        customBody={(month, setMonth) => <IncomeOverview month={month} setMonth={setMonth} />}
      />
    </div>
  )
}
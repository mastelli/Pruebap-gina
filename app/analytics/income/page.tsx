"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { MetricTab } from "@/components/analytics/metric-tab"
import { IncomeCategoriesChart, IncomeTotal } from "@/components/analytics/income-breakdown"
import { IncomeHistory } from "@/components/analytics/income-history"
import { IncomeMetrics } from "@/components/analytics/income-metrics"
import { IncomeList } from "@/components/analytics/income-list"

export default function AnalyticsIncomePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AnalyticsHeader titleKey="Revenue" />
      <MetricTab
        titleKey="Revenue"
        hideTitle
        firstCardTitleKey="Income Breakdown"
        firstCardAction={(month) => <IncomeTotal month={month} />}
        firstCard={(month) => <IncomeCategoriesChart scope="month" month={month} />}
        secondCardTitleKey="History"
        secondCard={<IncomeHistory />}
        thirdCardTitleKey="Movements"
        thirdCard={(month) => <IncomeList month={month} />}
        metricsCard={<IncomeMetrics />}
      />
    </div>
  )
}

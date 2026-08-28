"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { MetricTab } from "@/components/analytics/metric-tab"

export default function AnalyticsSavingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AnalyticsHeader />
      <MetricTab titleKey="Debt" />
    </div>
  )
}

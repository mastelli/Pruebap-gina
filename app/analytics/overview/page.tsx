"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { OverviewTab } from "@/components/analytics/overview-tab"

export default function AnalyticsOverviewPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AnalyticsHeader />
      <OverviewTab />
    </div>
  )
}

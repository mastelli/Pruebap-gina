"use client"

import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { ExpensesView } from "@/components/analytics/expenses-view"

export default function AnalyticsExpensesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AnalyticsHeader titleKey="Expenses" />
      <ExpensesView />
    </div>
  )
}

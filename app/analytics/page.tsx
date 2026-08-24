"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { OverviewTab } from "@/components/analytics/overview-tab"
import { MetricTab } from "@/components/analytics/metric-tab"
import { IncomeCategoriesChart } from "@/components/analytics/income-breakdown"
import { IncomeHistory } from "@/components/analytics/income-history"
import { IncomeMetrics } from "@/components/analytics/income-metrics"
import { IncomeList } from "@/components/analytics/income-list"
import { ExpenseDoughnut } from "@/components/analytics/expense-doughnut"
import { ExpenseTypes } from "@/components/analytics/expense-types"
import { ExpenseList } from "@/components/analytics/expense-list"
import { AllTransactionsHistory } from "@/components/analytics/all-transactions-history"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

function AnalyticsContent() {
  const handleExportData = () => {
    // Implement export functionality here
    console.log("Exporting data...")
  }
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState(searchParams.get("tab") ?? "overview")

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("Analytics")}</h2>
        <div className="flex items-center space-x-2">
          <DateRangePicker />
          <Button onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t("Export Data")}
          </Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="income">{t("Revenue")}</TabsTrigger>
          <TabsTrigger value="expenses">{t("Expenses")}</TabsTrigger>
          <TabsTrigger value="savings">{t("Savings/Investment")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="income" className="space-y-4">
          <MetricTab
            titleKey="Revenue"
            firstCardTitleKey="Income Breakdown"
            firstCard={(month) => <IncomeCategoriesChart scope="month" month={month} />}
            secondCardTitleKey="History"
            secondCard={<IncomeHistory />}
            thirdCardTitleKey="Annual Breakdown"
            thirdCard={<IncomeList />}
            metricsCard={<IncomeMetrics />}
          />
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <MetricTab
            titleKey="Expenses"
            firstCardTitleKey="Expense Breakdown"
            firstCard={(month) => <ExpenseDoughnut month={month} />}
            secondCardTitleKey="Expense Types"
            secondCard={<ExpenseTypes />}
            thirdCardTitleKey="History"
            thirdCard={<AllTransactionsHistory />}
            metricsTitleKey="Expense Movements"
            metricsCard={<ExpenseList />}
          />
        </TabsContent>
        <TabsContent value="savings" className="space-y-4">
          <MetricTab titleKey="Savings/Investment" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  )
}

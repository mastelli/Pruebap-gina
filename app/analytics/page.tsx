"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/date-range-picker"
import { OverviewTab } from "@/components/analytics/overview-tab"
import { MetricTab } from "@/components/analytics/metric-tab"
import { IncomeCategoriesChart, IncomeTotal } from "@/components/analytics/income-breakdown"
import { IncomeHistory } from "@/components/analytics/income-history"
import { IncomeMetrics } from "@/components/analytics/income-metrics"
import { IncomeList } from "@/components/analytics/income-list"
import { ExpenseDoughnut, ExpenseTotal } from "@/components/analytics/expense-doughnut"
import { ExpenseTypes } from "@/components/analytics/expense-types"
import { ExpenseList } from "@/components/analytics/expense-list"
import { ExpenseHistory } from "@/components/analytics/expense-history"
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
          <TabsTrigger value="savings">{t("Debt")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="income" className="space-y-4">
          <MetricTab
            titleKey="Revenue"
            firstCardTitleKey="Income Breakdown"
            firstCardAction={(month) => <IncomeTotal month={month} />}
            firstCard={(month) => <IncomeCategoriesChart scope="month" month={month} />}
            secondCardTitleKey="History"
            secondCard={<IncomeHistory />}
            thirdCardTitleKey="Movements"
            thirdCard={(month) => <IncomeList month={month} />}
            metricsCard={<IncomeMetrics />}
          />
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <MetricTab
            titleKey="Expenses"
            customBody={(month) => (
              <div className="grid gap-4 items-stretch">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl font-semibold">{t("Expense Breakdown")}</CardTitle>
                    <ExpenseTotal month={month} />
                  </CardHeader>
                  <CardContent>
                    <ExpenseDoughnut month={month} />
                  </CardContent>
                </Card>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">{t("History")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ExpenseHistory />
                    </CardContent>
                  </Card>
                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">{t("Budget")}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ExpenseTypes month={month} />
                    </CardContent>
                  </Card>
                </div>
                <Card className="flex min-h-0 flex-1 flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">{t("Expense Movements")}</CardTitle>
                  </CardHeader>
                  <CardContent className="min-h-0 flex-1 overflow-hidden">
                    <ExpenseList month={month} />
                  </CardContent>
                </Card>
              </div>
            )}
          />
        </TabsContent>
        <TabsContent value="savings" className="space-y-4">
          <MetricTab titleKey="Debt" />
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

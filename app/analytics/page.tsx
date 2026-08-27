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
import { ExpenseDoughnut } from "@/components/analytics/expense-doughnut"
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
  // Alterna entre la grafica del mes y la de historial anual en Gastos
  const [expensesChart, setExpensesChart] = useState<"month" | "history">("month")

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
            customBody={(month, setMonth) => (
              <div className="grid gap-4 items-stretch">
                {expensesChart === "month" ? (
                  <ExpenseDoughnut month={month} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">{t("History")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ExpenseHistory />
                    </CardContent>
                  </Card>
                )}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1">
                    {[
                      { key: "01", label: "Ene" }, { key: "02", label: "Feb" }, { key: "03", label: "Mar" },
                      { key: "04", label: "Abr" }, { key: "05", label: "May" }, { key: "06", label: "Jun" },
                      { key: "07", label: "Jul" }, { key: "08", label: "Ago" }, { key: "09", label: "Sep" },
                      { key: "10", label: "Oct" }, { key: "11", label: "Nov" }, { key: "12", label: "Dic" },
                    ].map((m) => (
                      <button key={m.key} onClick={() => setMonth(m.key)}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                          month === m.key
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setExpensesChart(expensesChart === "month" ? "history" : "month")}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      expensesChart === "history"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {t("Months")}
                  </button>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">{t("Budget")}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <ExpenseTypes month={month} />
                    </CardContent>
                  </Card>
                  <Card className="flex min-h-0 flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">{t("Expense Movements")}</CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-0 flex-1 overflow-hidden">
                      <ExpenseList month={month} />
                    </CardContent>
                  </Card>
                </div>
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

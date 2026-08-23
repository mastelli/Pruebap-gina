"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, DollarSign, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"

const metrics = [
  {
    id: 1,
    title: "Revenue Growth",
    subtitle: "Monthly revenue target",
    icon: TrendingUp,
    status: "On Track",
    progress: 75,
    target: 100000,
    current: 75000,
    unit: "$",
  },
  {
    id: 2,
    title: "Customer Acquisition",
    subtitle: "New customers this quarter",
    icon: Users,
    status: "Behind",
    progress: 60,
    target: 1000,
    current: 600,
    unit: "",
  },
  {
    id: 3,
    title: "Average Order Value",
    subtitle: "Target AOV for Q3",
    icon: DollarSign,
    status: "Ahead",
    progress: 110,
    target: 150,
    current: 165,
    unit: "$",
  },
]

const statusColors = {
  "On Track": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Behind: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Ahead: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function BusinessMetrics() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const currentYear = `${now.getFullYear()}`
  const monthsElapsed = now.getMonth() + 1

  const yearlyIncome = transactions
    .filter((transaction) => transaction.amount > 0 && transaction.date.startsWith(currentYear))
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const monthlyAverage = yearlyIncome / monthsElapsed

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("Business Metrics")}</h2>
        <Button variant="outline" size="sm">
          {t("View Details")} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(metric.title)}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metric.id === 1 ? (
                <div className="space-y-1">
                  <p className="text-2xl font-bold tabular-nums">{formatEuros(yearlyIncome)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("Monthly average")}: {formatEuros(monthlyAverage)}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">{t(metric.subtitle)}</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-xs">
                      <span className={`px-2 py-1 rounded-full ${statusColors[metric.status]}`}>{t(metric.status)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${Math.min(metric.progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-end items-center text-sm">
                      <span className="text-muted-foreground">
                        {metric.progress}
                        {t("% complete")}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


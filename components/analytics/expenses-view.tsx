"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricTab } from "@/components/analytics/metric-tab"
import { ExpenseDoughnut } from "@/components/analytics/expense-doughnut"
import { ExpenseTypes } from "@/components/analytics/expense-types"
import { ExpenseList } from "@/components/analytics/expense-list"
import { ExpenseHistory } from "@/components/analytics/expense-history"
import { useLanguage } from "@/lib/i18n"
import { useState } from "react"

const MONTHS = [
  { key: "01", label: "Ene" }, { key: "02", label: "Feb" }, { key: "03", label: "Mar" },
  { key: "04", label: "Abr" }, { key: "05", label: "May" }, { key: "06", label: "Jun" },
  { key: "07", label: "Jul" }, { key: "08", label: "Ago" }, { key: "09", label: "Sep" },
  { key: "10", label: "Oct" }, { key: "11", label: "Nov" }, { key: "12", label: "Dic" },
]

export function ExpensesView() {
  const { t } = useLanguage()
  const [expensesChart, setExpensesChart] = useState<"month" | "history">("month")

  return (
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
              {MONTHS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMonth(m.key)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    month === m.key
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
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
  )
}

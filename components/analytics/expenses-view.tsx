"use client"

import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricTab } from "@/components/analytics/metric-tab"
import { ExpenseDoughnut } from "@/components/analytics/expense-doughnut"
import { ExpenseTypes } from "@/components/analytics/expense-types"
import { ExpenseHistory } from "@/components/analytics/expense-history"
import { ExpenseInsights } from "@/components/analytics/expense-insights"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getPeriodPrefix, sortByDateDesc } from "@/lib/transactions"
import { getCategoryFor, getAllExpenseCategories } from "@/lib/categories"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })
}

// Pantalla de Gastos con aspecto de banca: cabecera tipo saldo,
// categorias en las que mas se gasta, desglose, movimientos,
// presupuestos por categoria e historial anual.
export function ExpensesView() {
  return (
    <MetricTab
      titleKey="Expenses"
      customBody={(month, setMonth) => <ExpenseOverview month={month} setMonth={setMonth} />}
    />
  )
}

function ExpenseOverview({ month, setMonth }: { month: string; setMonth: (m: string) => void }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const prefix = getPeriodPrefix(transactions, month)
  const yearNum = Number(prefix.slice(0, 4))
  const monthNum = Number(prefix.slice(5, 7))

  const allDefs = getAllExpenseCategories()
  const colorByKey: Record<string, string> = {}
  for (const def of allDefs) colorByKey[def.key] = def.color

  const spentByCategory: Record<string, number> = {}
  for (const def of allDefs) spentByCategory[def.key] = 0
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
    spentByCategory[getCategoryFor(transaction)] += Math.abs(transaction.amount)
  }

  const total = Object.values(spentByCategory).reduce((sum, value) => sum + value, 0)

  const prevDate = new Date(yearNum, monthNum - 2, 1)
  const prevPrefix = getPeriodPrefix(
    transactions,
    String(prevDate.getMonth() + 1).padStart(2, "0"),
  )
  const prevTotal = transactions
    .filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(prevPrefix))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  const delta = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null

  const expenses = sortByDateDesc(
    transactions.filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(prefix)),
  )
  const count = expenses.length
  const dayCount = new Date(yearNum, monthNum, 0).getDate()
  const avgPerDay = dayCount > 0 ? total / dayCount : 0

  const monthLabel = `${t(MONTHS[monthNum - 1])} ${yearNum}`

  const topCategories = Object.entries(spentByCategory)
    .map(([key, value]) => ({ key, value, color: colorByKey[key] }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)

  const pctOf = (value: number): number => (total > 0 ? Math.round((value / total) * 100) : 0)

  return (
    <div className="space-y-6">
      {/* Cabecera tipo saldo de cuenta */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-widest">{t("Expenses")}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-xs font-medium">{monthLabel}</span>
            </div>
            <p className="mt-3 text-4xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-5xl">
              {formatEuros(total)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {delta !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 font-semibold">
                  <TrendingUp className={`h-3.5 w-3.5 ${delta < 0 ? "rotate-180" : ""} ${delta < 0 ? "text-red-500" : "text-emerald-500"}`} />
                  {`${delta >= 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",")}% ${t("vs last month")}`}
                </span>
              )}
              <span className="rounded-full border bg-secondary px-3 py-1 font-medium">
                {count} {t("Movements")}
              </span>
              <span className="rounded-full border bg-secondary px-3 py-1 font-medium">
                {t("Average per day")}: {formatEuros(avgPerDay)}
              </span>
            </div>
          </div>
          <div className="grid shrink-0 gap-2 sm:min-w-[260px]">
            {topCategories.map((row) => (
              <div key={row.key} className="flex items-center gap-3 rounded-xl border bg-secondary/40 p-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t(row.key)}
                  </p>
                  <p className="text-sm font-bold tabular-nums text-foreground">{formatEuros(row.value)}</p>
                </div>
                <div className="ml-auto">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pctOf(row.value)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {pctOf(row.value)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selector de mes */}
      <div className="flex flex-wrap items-center justify-center gap-1">
        {MONTHS.map((name, index) => {
          const key = String(index + 1).padStart(2, "0")
          return (
            <button
              key={key}
              onClick={() => setMonth(key)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                month === key
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t(name).slice(0, 3)}
            </button>
          )
        })}
      </div>

      {/* Desglose + movimientos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t("Expense Breakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseDoughnut month={month} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold">{t("Expense Movements")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("Total")}:{" "}
              <span className="font-bold tabular-nums text-red-600 dark:text-red-400">
                {formatEuros(total)}
              </span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-y-auto pr-1">
              {expenses.map((transaction) => {
                const category = getCategoryFor(transaction)
                const color = colorByKey[category] ?? "#ef4444"
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-0"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {t(category).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t(transaction.name)}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-red-600 dark:text-red-400">
                      -{formatEuros(-transaction.amount)}
                    </span>
                  </div>
                )
              })}
              {expenses.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {t("No transactions yet")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensajes de ayuda del mes */}
      <ExpenseInsights month={month} />

      {/* Presupuestos + historial anual */}
      <div className="space-y-4">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t("Budget")}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <ExpenseTypes month={month} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t("History")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseHistory />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
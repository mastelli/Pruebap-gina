"use client"

import { ArrowRightLeft, TrendingUp, Wallet, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getPeriodPrefix, sortByDateDesc } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"
import { getCategoryFor } from "@/lib/categories"
import type { LucideIcon } from "lucide-react"
import { IncomeCategoriesChart } from "./income-breakdown"
import { IncomeHistory } from "./income-history"
import { IncomeTips } from "./income-tips"

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

const SLICE_COLORS = {
  salary: "#66bb6a",
  transfers: "#43a047",
  bizum: "#2e7d32",
}

const CATEGORY_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  Salary: { icon: Wallet, color: SLICE_COLORS.salary },
  Transfers: { icon: ArrowRightLeft, color: SLICE_COLORS.transfers },
  Bizum: { icon: Zap, color: SLICE_COLORS.bizum },
}

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })
}

// Pagina de Ingresos con aspecto de banca: cabecera tipo saldo de cuenta,
// resumen por categoria, desglose y movimientos, historial anual.
export function IncomeOverview({
  month,
  setMonth,
}: {
  month: string
  setMonth: (m: string) => void
}) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const prefix = getPeriodPrefix(transactions, month)
  const yearNum = Number(prefix.slice(0, 4))
  const monthNum = Number(prefix.slice(5, 7))

  const { salary, transfers, bizum } = getIncomeBreakdown(transactions, prefix)
  const total = salary + transfers + bizum

  const prevDate = new Date(yearNum, monthNum - 2, 1)
  const prevPrefix = getPeriodPrefix(
    transactions,
    String(prevDate.getMonth() + 1).padStart(2, "0"),
  )
  const prevTotals = getIncomeBreakdown(transactions, prevPrefix)
  const prevTotal = prevTotals.salary + prevTotals.transfers + prevTotals.bizum
  const delta = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : null

  const incomes = sortByDateDesc(
    transactions.filter((transaction) => transaction.amount > 0 && transaction.date.startsWith(prefix)),
  )
  const count = incomes.length
  const dayCount = new Date(yearNum, monthNum, 0).getDate()
  const avgPerDay = dayCount > 0 ? total / dayCount : 0

  const monthLabel = `${t(MONTHS[monthNum - 1])} ${yearNum}`

  const pctOf = (value: number): number => (total > 0 ? Math.round((value / total) * 100) : 0)

  const catTiles = [
    { key: "Salary", value: salary },
    { key: "Transfers", value: transfers },
    { key: "Bizum", value: bizum },
  ]

  return (
    <div className="space-y-6">
      {/* Cabecera tipo saldo de cuenta */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-100">
              <span className="text-xs font-semibold uppercase tracking-widest">{t("Revenue")}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-200/70" />
              <span className="text-xs font-medium">{monthLabel}</span>
            </div>
            <p className="mt-3 text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl">
              {formatEuros(total)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              {delta !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-semibold backdrop-blur">
                  <TrendingUp className={`h-3.5 w-3.5 ${delta < 0 ? "rotate-180" : ""}`} />
                  {`${delta >= 0 ? "+" : ""}${delta.toFixed(1).replace(".", ",")}% ${t("vs last month")}`}
                </span>
              )}
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur">
                {count} {t("Movements")}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur">
                {t("Average per day")}: {formatEuros(avgPerDay)}
              </span>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-3">
            {catTiles.map(({ key, value }) => (
              <div key={key} className="min-w-[96px] rounded-xl bg-white/10 p-3 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
                  {t(key)}
                </p>
                <p className="mt-1.5 text-lg font-bold tabular-nums">{formatEuros(value)}</p>
                <p className="mt-1 text-[11px] font-semibold tabular-nums text-emerald-50">
                  {pctOf(value)}%
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white/90 transition-all"
                    style={{ width: `${pctOf(value)}%` }}
                  />
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
            <CardTitle className="text-lg font-semibold">{t("Income Breakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeCategoriesChart scope="month" month={month} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold">{t("Movements")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("Total")}: <span className="font-bold tabular-nums text-green-600 dark:text-green-400">{formatEuros(total)}</span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-[330px] overflow-y-auto pr-1">
              {incomes.map((transaction) => {
                const category = getCategoryFor(transaction)
                const meta = CATEGORY_ICONS[category] ?? CATEGORY_ICONS.Bizum
                const Icon = meta.icon
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 border-b border-border py-3 last:border-0"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t(transaction.name)}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-green-600 dark:text-green-400">
                      +{formatEuros(transaction.amount)}
                    </span>
                  </div>
                )
              })}
              {incomes.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {t("No transactions yet")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial anual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{t("History")}</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeHistory />
        </CardContent>
      </Card>

      {/* Consejos sobre ingresos */}
      <IncomeTips />
    </div>
  )
}
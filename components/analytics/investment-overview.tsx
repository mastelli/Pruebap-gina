"use client"

import { Briefcase, PiggyBank, TrendingUp, Wallet } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getLatestPeriod } from "@/lib/transactions"
import { usePortfolioEurTotal } from "@/components/portfolio-total"
import { InvestmentTips } from "@/components/analytics/investment-tips"
import { FinanceNews } from "@/components/analytics/finance-news"

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
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

// Pantalla de Ahorro e Inversion con aspecto de banca: patrimonio total,
// cuenta corriente, cartera, ahorro real por mes y noticias actuales.
export function InvestmentOverview() {
  const { t } = useLanguage()
  const { checkingBalance, transactions } = useTransactions()
  const { total: investment, momPct } = usePortfolioEurTotal()

  const cash = checkingBalance ?? 0
  const invested = typeof investment === "number" ? investment : 0
  const wealth = cash + invested

  const period = getLatestPeriod(transactions)
  const yearNum = Number(period.slice(0, 4))
  const monthNum = Number(period.slice(5, 7))
  const monthLabel = `${t(MONTHS[monthNum - 1])} ${yearNum}`

  let income = 0
  let expenses = 0
  for (const transaction of transactions) {
    if (!transaction.date.startsWith(period)) continue
    if (transaction.amount > 0) income += transaction.amount
    else expenses += -transaction.amount
  }
  const monthlyNet = income - expenses
  const savingsPct = income > 0 ? Math.round((monthlyNet / income) * 100) : 0
  const momPctText =
    typeof momPct === "number"
      ? `${momPct >= 0 ? "+" : ""}${momPct.toFixed(1).replace(".", ",")}% ${t("vs last month")}`
      : null

  const kpis: {
    id: string
    icon: LucideIcon
    color: string
    label: string
    value: string
    sub: string
    valueClass?: string
  }[] = [
    {
      id: "cash",
      icon: Wallet,
      color: "#14b8a6",
      label: t("Checking account"),
      value: formatEuros(cash),
      sub: `${t("Savings this month")}: ${monthlyNet >= 0 ? "+" : ""}${formatEuros(monthlyNet)}`,
      valueClass: "text-teal-600 dark:text-teal-400",
    },
    {
      id: "invested",
      icon: Briefcase,
      color: "#2563eb",
      label: t("Invested portfolio"),
      value: formatEuros(invested),
      sub: momPctText ?? t("Investment portfolio"),
      valueClass: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "savings",
      icon: PiggyBank,
      color: "#7c3aed",
      label: t("Savings this month"),
      value: `${monthlyNet >= 0 ? "+" : ""}${formatEuros(monthlyNet)}`,
      sub: income > 0 ? `${savingsPct}% ${t("of your income")}` : t("No transactions yet"),
      valueClass: monthlyNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cabecera tipo saldo: patrimonio total */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-indigo-100">
            <span className="text-xs font-semibold uppercase tracking-widest">
              {t("Savings and Investment")}
            </span>
            <span className="h-1 w-1 rounded-full bg-indigo-200/70" />
            <span className="text-xs font-medium">{monthLabel}</span>
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums tracking-tight sm:text-5xl">
            {formatEuros(wealth)}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            {momPctText && invested > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-semibold backdrop-blur">
                <TrendingUp className="h-3.5 w-3.5" />
                {momPctText}
              </span>
            )}
            <span className="rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur">
              {t("Checking account")}: {formatEuros(cash)}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur">
              {t("Invested portfolio")}: {formatEuros(invested)}
            </span>
          </div>
        </div>
      </div>

      {/* Indicadores clave */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {kpi.label}
                    </p>
                    <p className={`mt-2 text-2xl font-bold tabular-nums ${kpi.valueClass ?? ""}`}>
                      {kpi.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
                  </div>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${kpi.color}1a` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Consejos para invertir */}
      <InvestmentTips />

      {/* Noticias financieras actuales */}
      <FinanceNews />
    </div>
  )
}
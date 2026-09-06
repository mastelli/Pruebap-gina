"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { PiggyBank, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getLatestPeriod } from "@/lib/transactions"
import { usePortfolioEurTotal, usePortfolioCash } from "@/components/portfolio-total"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

const CASH_GRADIENT = "url(#netWorthCash)"
const INVESTED_GRADIENT = "url(#netWorthInvested)"
const CASH_COLOR = "#26a69a"
const INVESTED_COLOR = "#2563eb"

// Primer vistazo: donde esta todo el dinero del usuario ahora mismo.
// Efectivo (cuenta corriente) + inversion en un donut, con el ahorro del
// mes y la variacion de la cartera como contexto inmediato.
export function NetWorth() {
  const { t } = useLanguage()
  const { checkingBalance, transactions } = useTransactions()
  const { total: investment, momPct } = usePortfolioEurTotal()
  const portfolioCash = usePortfolioCash()

  const cash = (checkingBalance ?? 0) + portfolioCash
  const invested = typeof investment === "number" ? investment : 0
  const total = cash + invested

  // Ahorro neto del periodo real de los datos (ingresos - gastos)
  const period = getLatestPeriod(transactions)
  let income = 0
  let expenses = 0
  for (const transaction of transactions) {
    if (!transaction.date.startsWith(period)) continue
    if (transaction.amount > 0) income += transaction.amount
    else expenses += -transaction.amount
  }
  const monthlyNet = income - expenses

  if (cash === 0 && invested === 0 && monthlyNet === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
  }

  const cashPct = total > 0 ? Math.round((cash / total) * 100) : 0
  const investedPct = total > 0 ? Math.round((invested / total) * 100) : 0

  const data = [
    { name: t("Cash"), value: Math.max(0, cash), gradient: CASH_GRADIENT, color: CASH_COLOR },
    {
      name: t("Invested"),
      value: Math.max(0, invested),
      gradient: INVESTED_GRADIENT,
      color: INVESTED_COLOR,
    },
  ]

  const investedSub =
    typeof momPct === "number"
      ? `${momPct >= 0 ? "+" : ""}${momPct.toFixed(1).replace(".", ",")}% ${t("vs last month")}`
      : t("Investment portfolio")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="relative h-[240px] w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id="netWorthCash" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4db6ac" />
                  <stop offset="100%" stopColor="#00897b" />
                </linearGradient>
                <linearGradient id="netWorthInvested" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <Pie
                data={[{ value: 1 }]}
                dataKey="value"
                innerRadius={76}
                outerRadius={104}
                stroke="none"
                isAnimationActive={false}
                fill="hsl(var(--secondary))"
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={76}
                outerRadius={104}
                paddingAngle={3}
                cornerRadius={8}
                stroke="hsl(var(--card))"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.gradient} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {t("Net Worth")}
            </p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight">
              {formatEuros(total)}
            </p>
          </div>
        </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CASH_COLOR }} />
              {t("Cash")} {cashPct}%
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: INVESTED_COLOR }}
              />
              {t("Invested")} {investedPct}%
            </span>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full ring-2 ring-background"
                style={{ backgroundColor: CASH_COLOR }}
              />
              <div>
                <p className="text-sm font-semibold leading-none">{t("Cash")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("Available to spend")}</p>
              </div>
            </div>
            <p className="text-sm font-bold tabular-nums">{formatEuros(cash)}</p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full ring-2 ring-background"
                style={{ backgroundColor: INVESTED_COLOR }}
              />
              <div>
                <p className="text-sm font-semibold leading-none">{t("Invested")}</p>
                {typeof momPct === "number" ? (
                  <p
                    className={`mt-1 flex items-center gap-1 text-xs ${
                      momPct >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    <TrendingUp className={`h-3 w-3 ${momPct < 0 ? "rotate-180" : ""}`} />
                    {investedSub}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">{investedSub}</p>
                )}
              </div>
            </div>
            <p className="text-sm font-bold tabular-nums">{formatEuros(invested)}</p>
          </div>

          <div
            className={`flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm ${
              monthlyNet < 0 ? "border-red-400/40" : "border-green-400/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <PiggyBank
                className={`h-4 w-4 ${monthlyNet < 0 ? "text-red-500" : "text-emerald-500"}`}
              />
              <div>
                <p className="text-sm font-semibold leading-none">{t("Savings this month")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{period.replace("-", " · ")}</p>
              </div>
            </div>
            <p
              className={`text-sm font-bold tabular-nums ${
                monthlyNet < 0 ? "text-red-500" : "text-emerald-500"
              }`}
            >
              {monthlyNet >= 0 ? "+" : ""}
              {formatEuros(monthlyNet)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-secondary/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("Savings breakdown note")}
        </p>
        <div className="flex h-2 w-full shrink-0 overflow-hidden rounded-full sm:w-48">
          <div className="bg-teal-600" style={{ width: `${cashPct}%` }} />
          <div className="bg-blue-600" style={{ width: `${investedPct}%` }} />
        </div>
      </div>
    </div>
  )
}
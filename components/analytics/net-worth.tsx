"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { usePortfolioEurTotal } from "@/components/portfolio-total"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

const CASH_GRADIENT = "url(#netWorthCash)"
const INVESTED_GRADIENT = "url(#netWorthInvested)"
const CASH_COLOR = "#26a69a"
const INVESTED_COLOR = "#2563eb"

// Primer vistazo: donde esta todo el dinero del usuario ahora mismo.
// Efectivo (cuenta corriente) + inversion, en un donut con su total.
export function NetWorth() {
  const { t } = useLanguage()
  const { checkingBalance } = useTransactions()
  const { total: investment } = usePortfolioEurTotal()

  const cash = checkingBalance ?? 0
  const invested = typeof investment === "number" ? investment : 0
  const total = cash + invested

  if (cash === 0 && invested === 0) {
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

  return (
    <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
      <div className="relative h-[240px] w-[240px] shrink-0">
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
          <p className="mt-1.5 text-xs text-muted-foreground">
            {cashPct}% {t("Cash")} · {investedPct}% {t("Invested")}
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        {data.map((entry) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
          return (
            <div
              key={entry.name}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full ring-2 ring-background"
                  style={{ backgroundColor: entry.color }}
                />
                <div>
                  <p className="text-sm font-semibold leading-none">{entry.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{pct}%</p>
                </div>
              </div>
              <p className="text-sm font-bold tabular-nums">{formatEuros(entry.value)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
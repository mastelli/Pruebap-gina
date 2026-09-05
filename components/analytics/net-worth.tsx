"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { usePortfolioEurTotal } from "@/components/portfolio-total"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

const CASH_COLOR = "#26a69a"
const INVESTED_COLOR = "#1d4ed8"

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

  const data = [
    { name: t("Cash"), value: Math.max(0, cash), color: CASH_COLOR },
    { name: t("Invested"), value: Math.max(0, invested), color: INVESTED_COLOR },
  ]

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
      <div className="relative h-[220px] w-[220px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-muted-foreground">{t("Net Worth")}</p>
          <p className="text-lg font-bold tabular-nums">{formatEuros(total)}</p>
        </div>
      </div>

      <div className="w-full space-y-3 md:max-w-xs">
        {data.map((entry) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
          return (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <p className="text-sm font-medium">{entry.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">{formatEuros(entry.value)}</p>
                <p className="text-xs text-muted-foreground">{pct}%</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
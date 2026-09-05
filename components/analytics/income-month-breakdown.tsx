"use client"

import { useLanguage } from "@/lib/i18n"
import { useTransactions, getPeriodPrefix } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

const ROW_COLORS = ["#43a047", "#2e7d32", "#66bb6a"]

// Desglose real de ingresos del mes en curso (Nomina, Transferencias,
// Bizum) con barras de proporcion sobre el total
export function IncomeMonthBreakdown() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0")
  const prefix = getPeriodPrefix(transactions, currentMonth)
  const { salary, transfers, bizum } = getIncomeBreakdown(transactions, prefix)
  const total = salary + transfers + bizum

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
  }

  const pct = (value: number): string => `${((value / total) * 100).toFixed(0)}%`

  const rows = [
    { label: "Salary", value: salary, color: ROW_COLORS[0] },
    { label: "Transfers", value: transfers, color: ROW_COLORS[1] },
    { label: "Bizum", value: bizum, color: ROW_COLORS[2] },
  ]

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium" style={{ color: row.color }}>
              {t(row.label)}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatEuros(row.value)} · {pct(row.value)}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-secondary">
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${(row.value / total) * 100}%`, backgroundColor: row.color }}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between border-t pt-2">
        <p className="text-sm font-medium text-muted-foreground">{t("Total")}</p>
        <p className="text-lg font-bold tabular-nums">{formatEuros(total)}</p>
      </div>
    </div>
  )
}
"use client"

import { useLanguage } from "@/lib/i18n"
import { useTransactions, getLatestPeriod } from "@/lib/transactions"
import { getCategoryFor, getAllExpenseCategories } from "@/lib/categories"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

const MAX_ROWS = 6

// Gastos reales del mes en curso agrupados por categoria, con barras de
// proporcion sobre el total (las seis mayores categorias)
export function ExpenseMonthBreakdown() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const prefix = getLatestPeriod(transactions)

  const totals: Record<string, number> = {}
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
    const category = getCategoryFor(transaction)
    totals[category] = (totals[category] ?? 0) + Math.abs(transaction.amount)
  }

  const rows = getAllExpenseCategories()
    .filter((def) => (totals[def.key] ?? 0) > 0)
    .sort((a, b) => (totals[b.key] ?? 0) - (totals[a.key] ?? 0))
    .slice(0, MAX_ROWS)
    .map((def) => ({ label: def.key, value: totals[def.key], color: def.color }))

  const total = Object.values(totals).reduce((sum, value) => sum + value, 0)

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium" style={{ color: row.color }}>
              {t(row.label)}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatEuros(row.value)} · {Math.round((row.value / total) * 100)}%
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
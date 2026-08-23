"use client"

import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function IncomeBreakdown() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`
  const monthsElapsed = new Date().getMonth() + 1
  const { salary, transfers, bizum } = getIncomeBreakdown(transactions, currentYear)

  const rows = [
    { label: "Salary", total: salary },
    { label: "Transfers", total: transfers },
    { label: "Bizum", total: bizum },
  ]

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">{t(row.label)}</span>
            <span className="font-medium tabular-nums text-green-600 dark:text-green-400">
              {formatEuros(row.total)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t("Monthly average")}</span>
            <span className="text-sm font-medium tabular-nums">
              {formatEuros(row.total / monthsElapsed)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

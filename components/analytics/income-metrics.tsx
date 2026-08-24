"use client"

import { CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Totales reales del ano calculados sobre las transacciones importadas
export function IncomeMetrics() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const year = `${new Date().getFullYear()}`
  const { salary, transfers, bizum } = getIncomeBreakdown(transactions, year)
  const total = salary + transfers + bizum

  return (
    <CardContent className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{t("Total Revenue")}</p>
        <p className="text-2xl font-bold tabular-nums">{formatEuros(total)}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{t("Total Salary")}</p>
        <p className="text-2xl font-bold tabular-nums">{formatEuros(salary)}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{t("Total Transfers")}</p>
        <p className="text-2xl font-bold tabular-nums">{formatEuros(transfers)}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{t("Total Bizums")}</p>
        <p className="text-2xl font-bold tabular-nums">{formatEuros(bizum)}</p>
      </div>
    </CardContent>
  )
}

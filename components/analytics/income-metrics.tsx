"use client"

import { CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Metricas clave de ingresos: totales del ano por categoria
export function IncomeMetrics() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`
  const { salary, transfers, bizum } = getIncomeBreakdown(transactions, currentYear)
  const total = salary + transfers + bizum

  const rows = [
    { label: "Total Revenue", value: total },
    { label: "Total Salary", value: salary },
    { label: "Total Transfers", value: transfers },
    { label: "Total Bizums", value: bizum },
  ]

  return (
    <CardContent className="space-y-4">
      {rows.map((row) => (
        <div key={row.label}>
          <p className="text-sm font-medium text-muted-foreground">{t(row.label)}</p>
          <p className="text-2xl font-bold">{formatEuros(row.value)}</p>
        </div>
      ))}
    </CardContent>
  )
}

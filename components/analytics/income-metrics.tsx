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
    <CardContent>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        {/* arriba izquierda */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t("Total Revenue")}</p>
          <p className="text-xl font-bold tabular-nums">{formatEuros(total)}</p>
        </div>
        {/* arriba derecha */}
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground">{t("Total Transfers")}</p>
          <p className="text-xl font-bold tabular-nums">{formatEuros(transfers)}</p>
        </div>
        {/* abajo izquierda */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t("Total Salary")}</p>
          <p className="text-xl font-bold tabular-nums">{formatEuros(salary)}</p>
        </div>
        {/* abajo derecha */}
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground">{t("Total Bizums")}</p>
          <p className="text-xl font-bold tabular-nums">{formatEuros(bizum)}</p>
        </div>
      </div>
    </CardContent>
  )
}

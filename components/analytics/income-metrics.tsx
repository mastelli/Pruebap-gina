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
    <CardContent className="flex h-[184px] items-center">
      <div className="grid w-full grid-cols-2 gap-3">
        {/* arriba izquierda */}
        <div className="rounded-lg bg-secondary/60 p-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("Total Revenue")}
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">{formatEuros(total)}</p>
        </div>
        {/* arriba derecha */}
        <div className="rounded-lg bg-secondary/60 p-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("Total Transfers")}
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">{formatEuros(transfers)}</p>
        </div>
        {/* abajo izquierda */}
        <div className="rounded-lg bg-secondary/60 p-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("Total Salary")}
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">{formatEuros(salary)}</p>
        </div>
        {/* abajo derecha */}
        <div className="rounded-lg bg-secondary/60 p-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("Total Bizums")}
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">{formatEuros(bizum)}</p>
        </div>
      </div>
    </CardContent>
  )
}

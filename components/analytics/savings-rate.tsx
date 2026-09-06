"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getLatestPeriod, getPeriodPrefix } from "@/lib/transactions"
import { isInternalTransferTransaction } from "@/lib/categories"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Primer vistazo: cuantos ingresos del mes acaban quedandose como ahorro.
// Barra segmentada con la parte gastada y la ahorrada de cada euro.
export function SavingsRate({ month }: { month?: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const period = month ? getPeriodPrefix(transactions, month) : getLatestPeriod(transactions)
  let income = 0
  let expenses = 0
  for (const transaction of transactions) {
    if (!transaction.date.startsWith(period)) continue
    if (isInternalTransferTransaction(transaction)) continue
    if (transaction.amount > 0) income += transaction.amount
    else expenses += -transaction.amount
  }

  const net = income - expenses
  const rate = income > 0 ? (net / income) * 100 : null

  if (income === 0 && expenses === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
  }

  const positive = rate !== null && rate >= 0
  const expenseShare = income > 0 ? Math.min(100, (expenses / income) * 100) : 100
  const savingShare = rate !== null ? Math.max(0, Math.min(100, rate)) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p
          className={`text-4xl font-bold tabular-nums ${
            rate === null ? "text-muted-foreground" : positive ? "text-green-500" : "text-red-500"
          }`}
        >
          {rate === null ? "—" : `${positive ? "+" : ""}${rate.toFixed(0)}%`}
        </p>
        {rate !== null && (
          <span className="text-sm text-muted-foreground">
            {positive ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </span>
        )}
      </div>

      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="bg-red-400"
          style={{ width: `${expenseShare}%` }}
          title={t("Expenses")}
        />
        <div
          className="bg-green-500"
          style={{ width: `${savingShare}%` }}
          title={positive ? t("Savings of the month") : undefined}
        />
      </div>

      {rate !== null && !positive && (
        <p className="text-sm text-red-500">{t("You spend more than you earn")}</p>
      )}

      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="rounded-lg bg-secondary/60 p-2 text-center">
          <p className="text-xs text-muted-foreground">{t("Income")}</p>
          <p className="mt-1 text-sm font-bold tabular-nums text-green-500">{formatEuros(income)}</p>
        </div>
        <div className="rounded-lg bg-secondary/60 p-2 text-center">
          <p className="text-xs text-muted-foreground">{t("Expenses")}</p>
          <p className="mt-1 text-sm font-bold tabular-nums text-red-500">{formatEuros(expenses)}</p>
        </div>
        <div className="rounded-lg bg-secondary/60 p-2 text-center">
          <p className="text-xs text-muted-foreground">{t("Savings of the month")}</p>
          <p
            className={`mt-1 text-sm font-bold tabular-nums ${
              net >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {formatEuros(net)}
          </p>
        </div>
      </div>
    </div>
  )
}
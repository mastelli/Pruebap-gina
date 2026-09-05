"use client"

import { useLanguage } from "@/lib/i18n"
import { useTransactions, getLatestPeriod } from "@/lib/transactions"
import { getCategoryFor } from "@/lib/categories"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Primer vistazo: los cinco mayores gastos individuales del periodo.
// Responde a la pregunta "donde me he dejado mas dinero de una sola vez".
export function TopExpenses() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const period = getLatestPeriod(transactions)
  const top = transactions
    .filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(period))
    .sort((a, b) => a.amount - b.amount)
    .slice(0, 5)

  if (top.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
  }

  return (
    <div className="space-y-3">
      {top.map((transaction) => {
        const category = getCategoryFor(transaction)
        return (
          <div key={transaction.id} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{transaction.name}</p>
                <p className="text-xs text-muted-foreground">
                  {`${transaction.date.slice(8, 10)}/${transaction.date.slice(5, 7)}`} · {t(category.key)}
                </p>
              </div>
            </div>
            <p className="shrink-0 text-sm font-bold tabular-nums text-red-500">
              {formatEuros(-transaction.amount)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
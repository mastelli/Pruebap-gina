"use client"

import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, sortByDateDesc } from "@/lib/transactions"

export function ExpenseList({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const prefix = `${now.getFullYear()}-${month}`

  const expenses = sortByDateDesc(
    transactions.filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(prefix)),
  )

  return (
    <div className="h-full max-h-[840px] overflow-y-auto px-2">
      <div className="divide-y divide-border">
        {expenses.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{t(transaction.name)}</p>
              <p className="text-xs text-muted-foreground">{transaction.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{t("Expense")}</Badge>
              <span className="text-sm tabular-nums text-red-600 dark:text-red-400">
                {transaction.amount.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
        )}
      </div>
    </div>
  )
}

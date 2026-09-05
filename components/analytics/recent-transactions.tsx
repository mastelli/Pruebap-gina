"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getPeriodPrefix, sortByDateDesc } from "@/lib/transactions"

export function RecentTransactions({ month }: { month?: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const scoped = month
    ? transactions.filter((transaction) => transaction.date.startsWith(getPeriodPrefix(transactions, month)))
    : transactions
  const recent = sortByDateDesc(scoped)

  if (recent.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
  }

  return (
    <div className="max-h-[330px] space-y-1 overflow-y-auto pr-1">
      {recent.map((transaction) => (
        <div key={transaction.id} className="flex items-center py-2">
          <Badge variant={transaction.amount >= 0 ? "default" : "secondary"} className="mr-3">
            {transaction.amount >= 0 ? t("Income") : t("Expense")}
          </Badge>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-sm font-medium leading-none">{t(transaction.name)}</p>
            <p className="text-xs text-muted-foreground">{transaction.date}</p>
          </div>
          <div className="ml-auto text-right">
            <p
              className={`text-sm font-medium tabular-nums ${
                transaction.amount >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {transaction.amount >= 0 ? "+" : ""}
              {transaction.amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
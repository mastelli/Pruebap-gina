"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, sortByDateDesc } from "@/lib/transactions"

export default function TransactionsPage() {
  const { t } = useLanguage()
  const { transactions, removeTransaction } = useTransactions()
  const sorted = sortByDateDesc(transactions)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("Transactions")}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{t("All Transactions")}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {sorted.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t(transaction.name)}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={transaction.amount >= 0 ? "default" : "secondary"}>
                    {transaction.amount >= 0 ? t("Income") : t("Expense")}
                  </Badge>
                  <span
                    className={`text-sm tabular-nums ${
                      transaction.amount >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.amount >= 0 ? "+" : ""}
                    {transaction.amount.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeTransaction(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t("Delete")}</span>
                  </Button>
                </div>
              </div>
            ))}
            {sorted.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

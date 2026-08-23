"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, sortByDateDesc } from "@/lib/transactions"

export function RecentTransactions() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const recent = sortByDateDesc(transactions).slice(0, 4)

  return (
    <Card className="flex h-[390px] w-full flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{t("Recent Transactions")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="space-y-4">
          {recent.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t(transaction.name)}</p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
              <span
                className={`text-sm tabular-nums shrink-0 ${
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
            </div>
          ))}
          {recent.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
          )}
        </div>
        <Button className="w-full mt-auto" variant="outline" asChild>
          <Link href="/transactions">{t("View All Transactions")}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

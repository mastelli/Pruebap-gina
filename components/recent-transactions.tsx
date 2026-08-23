"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, sortByDateDesc } from "@/lib/transactions"

export function RecentTransactions() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const recent = sortByDateDesc(transactions).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{t("Recent Transactions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent.map((transaction) => (
            <div key={transaction.id} className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium">{t(transaction.name)}</p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" variant="outline" asChild>
          <Link href="/transactions">{t("View All Transactions")}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

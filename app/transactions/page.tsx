"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Wallet, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, sortByDateDesc } from "@/lib/transactions"
import {
  classifyTransaction,
  getCategoryFor,
  getStoredCategory,
  storeCategory,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORY_DEFS,
  type TransactionCategory,
} from "@/lib/categories"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function getCurrentMonth(): string {
  return String(new Date().getMonth() + 1).padStart(2, "0")
}

export default function TransactionsPage() {
  const { t } = useLanguage()
  const { transactions, removeTransaction } = useTransactions()
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth)
  const [overrides, setOverrides] = useState<Record<string, TransactionCategory>>({})

  const handleTypeChange = (id: string, category: TransactionCategory) => {
    storeCategory(id, category)
    setOverrides((prev) => ({ ...prev, [id]: category }))
  }

  const monthMovements = sortByDateDesc(
    transactions.filter((transaction) => transaction.date.slice(5, 7) === selectedMonth),
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("Transactions")}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-4">
          <CardTitle className="text-lg font-medium">{t("All Transactions")}</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[480px]">
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={String(index + 1).padStart(2, "0")}>
                    {t(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {monthMovements.map((transaction) => {
              const category =
                overrides[transaction.id] ??
                getStoredCategory(transaction.id) ??
                classifyTransaction(transaction)
              const options =
                transaction.amount >= 0
                  ? INCOME_CATEGORIES
                  : EXPENSE_CATEGORY_DEFS.map((def) => def.key)
              return (
                <div key={transaction.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t(transaction.name)}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={transaction.amount >= 0 ? "default" : "secondary"}>
                      {transaction.amount >= 0 ? t("Income") : t("Expense")}
                    </Badge>
                    <Select value={category} onValueChange={(value) => handleTypeChange(transaction.id, value as TransactionCategory)}>
                      <SelectTrigger className="h-8 w-[170px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[480px]">
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {t(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              )
            })}
            {monthMovements.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useMemo, useCallback } from "react"
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
import { Trash2, RotateCcw, Calendar, Settings, Search } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, sortByDateDesc } from "@/lib/transactions"
import { CategoryManager } from "@/components/category-manager"
import {
  classifyTransaction,
  getCategoryFor,
  getStoredCategory,
  storeCategory,
  INCOME_CATEGORIES,
  getAllExpenseCategories,
  type TransactionCategory,
} from "@/lib/categories"

const ALL_TIME_FROM = "1970-01-01"

function getTodayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function toISODate(dateStr: string): string {
  if (!dateStr) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const parts = dateStr.split("/")
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`
  return dateStr
}

export default function TransactionsPage() {
  const { t } = useLanguage()
  const { transactions, removeTransaction } = useTransactions()

  const defaultRange = { from: ALL_TIME_FROM, to: getTodayISO() }
  const [dateFrom, setDateFrom] = useState(defaultRange.from)
  const [dateTo, setDateTo] = useState(defaultRange.to)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [overrides, setOverrides] = useState<Record<string, TransactionCategory>>({})
  const [catVersion, setCatVersion] = useState(0)

  const isCustomRange = dateFrom !== defaultRange.from || dateTo !== defaultRange.to

  const resetRange = () => {
    setDateFrom(ALL_TIME_FROM)
    setDateTo(getTodayISO())
  }

  const handleTypeChange = (id: string, category: TransactionCategory) => {
    storeCategory(id, category)
    setOverrides((prev) => ({ ...prev, [id]: category }))
  }

  const filteredTransactions = useMemo(() => {
    const from = toISODate(dateFrom)
    const to = toISODate(dateTo)
    const query = search.trim().toLowerCase()
    return sortByDateDesc(
      transactions.filter((transaction) => {
        const d = toISODate(transaction.date)
        if (d < from || d > to) return false
        if (categoryFilter !== "all") {
          const cat = overrides[transaction.id] ?? getStoredCategory(transaction.id) ?? classifyTransaction(transaction)
          if (cat !== categoryFilter) return false
        }
        if (query && !transaction.name.toLowerCase().includes(query)) return false
        return true
      }),
    )
  }, [transactions, dateFrom, dateTo, categoryFilter, overrides, search])

  const allCategories = useMemo(() => {
    const expense = getAllExpenseCategories().map((def) => def.key)
    const all = [...INCOME_CATEGORIES, ...expense]
    return all.sort((a, b) => t(a).localeCompare(t(b), "es"))
  }, [t, catVersion])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("Transactions")}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-4">
          <CardTitle className="text-lg font-medium">{t("All Transactions")}</CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              />
              <span className="text-sm text-muted-foreground">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              />
            </div>
            {isCustomRange && (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={resetRange} title={t("Reset")}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search")}
                className="h-9 w-[200px] rounded-md border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("All categories")} />
              </SelectTrigger>
              <SelectContent className="max-h-[480px]">
                <SelectItem value="all">{t("All categories")}</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CategoryManager key={catVersion} onChange={() => setCatVersion((v) => v + 1)} trigger={
              <Button variant="ghost" size="icon" className="h-9 w-9" title={t("Categories")}>
                <Settings className="h-4 w-4" />
              </Button>
            } />
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {filteredTransactions.map((transaction) => {
              const category =
                overrides[transaction.id] ??
                getStoredCategory(transaction.id) ??
                classifyTransaction(transaction)
              const options =
                transaction.amount >= 0
                  ? INCOME_CATEGORIES
                  : allCategories
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
            {filteredTransactions.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { AlertTriangle, Lightbulb, Receipt, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getPeriodPrefix } from "@/lib/transactions"
import { getCategoryFor, getAllExpenseCategories } from "@/lib/categories"
import { storageGetItem } from "@/lib/auth"

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

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })
}

interface InsightRow {
  id: string
  icon: LucideIcon
  color: string
  title: string
  desc: string
}

// Mensajes de ayuda sobre el gasto del mes: donde se fue el dinero,
// como va frente al mes anterior, presupuestos y una sugerencia.
export function ExpenseInsights({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const [budgets, setBudgets] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      const raw = storageGetItem("appExpenseBudgets")
      if (raw) setBudgets(JSON.parse(raw) as Record<string, number>)
    } catch {
      // almacenamiento no disponible
    }
  }, [])

  const prefix = getPeriodPrefix(transactions, month)
  const yearNum = Number(prefix.slice(0, 4))
  const monthNum = Number(prefix.slice(5, 7))

  const allDefs = getAllExpenseCategories()
  const spentByCategory: Record<string, number> = {}
  for (const def of allDefs) spentByCategory[def.key] = 0
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
    spentByCategory[getCategoryFor(transaction)] += Math.abs(transaction.amount)
  }

  const total = Object.values(spentByCategory).reduce((sum, value) => sum + value, 0)

  const top = Object.entries(spentByCategory)
    .map(([key, value]) => ({ key, value }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)[0]

  // Para el consejo no se sugiere nunca Alquiler/Hipoteca, al ser un
  // gasto fijo dificil de recortar; se toma la siguiente categoria
  const tipTop = Object.entries(spentByCategory)
    .filter(([key, value]) => value > 0 && key !== "Rent/Mortgage")
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)[0]

  const prevDate = new Date(yearNum, monthNum - 2, 1)
  const prevPrefix = getPeriodPrefix(
    transactions,
    String(prevDate.getMonth() + 1).padStart(2, "0"),
  )
  const prevTotal = transactions
    .filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(prevPrefix))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  const delta = prevTotal > 0 ? (total - prevTotal) / prevTotal : null

  const overBudget = Object.entries(budgets)
    .map(([key, budget]) => ({ key, budget, spent: spentByCategory[key] ?? 0 }))
    .filter((row) => row.budget > 0 && row.spent > row.budget)
    .sort((a, b) => b.spent / b.budget - a.spent / a.budget)

  const hasBudgets = Object.values(budgets).some((value) => value > 0)
  const pctOf = (value: number): number => (total > 0 ? Math.round((value / total) * 100) : 0)

  const rows: InsightRow[] = [
    {
      id: "top",
      icon: Receipt,
      color: "#10b981",
      title: t("Where did the money go?"),
      desc: top
        ? `${t(top.key)}: ${formatEuros(top.value)} · ${pctOf(top.value)}% ${t("of your spending")}`
        : t("No transactions yet"),
    },
    {
      id: "delta",
      icon: TrendingUp,
      color: "#3b82f6",
      title: t("Compared to last month"),
      desc:
        delta !== null
          ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1).replace(".", ",")}% ${t(
              delta >= 0 ? "more than last month" : "less than last month",
            )}`
          : t("First complete month here"),
    },
    {
      id: "budget",
      icon: overBudget.length > 0 || !hasBudgets ? AlertTriangle : Lightbulb,
      color: overBudget.length > 0 ? "#ef4444" : !hasBudgets ? "#eab308" : "#22c55e",
      title: t(
        overBudget.length > 0
          ? "Over budget alert"
          : hasBudgets
            ? "Under budget"
            : "Set budgets",
      ),
      desc:
        overBudget.length > 0
          ? `${t(overBudget[0].key)}: ${formatEuros(overBudget[0].spent)} · ${formatEuros(
              overBudget[0].spent - overBudget[0].budget,
            )} ${t("over the budget")}`
          : hasBudgets
            ? t("No budget exceeded this month")
            : t("Set budgets invite"),
    },
    {
      id: "tip",
      icon: Lightbulb,
      color: "#f59e0b",
      title: t("Tip"),
      desc: tipTop ? `${t("Biggest opportunity")} ${t(tipTop.key)} (${pctOf(tipTop.value)}%)` : t("No transactions yet"),
    },
  ].filter((row) => (row.id === "tip" ? tipTop !== undefined : true))

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {rows.map((row) => {
        const Icon = row.icon
        return (
          <div key={row.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${row.color}1a` }}
              >
                <Icon className="h-4 w-4" style={{ color: row.color }} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{row.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{row.desc}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
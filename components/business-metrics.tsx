"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

const linkClasses =
  "flex items-center justify-between gap-3 rounded-xl border border-[#ef9a9a] bg-[#ffcdd2] p-4 text-[#7f1d1d] shadow-sm transition-colors hover:bg-[#f8b9c0]"

export function BusinessMetrics() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const currentYear = `${now.getFullYear()}`
  const monthsElapsed = now.getMonth() + 1

  const yearlyIncome = transactions
    .filter((transaction) => transaction.amount > 0 && transaction.date.startsWith(currentYear))
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const yearlyExpenses = transactions
    .filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(currentYear))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

  const monthlyAverage = yearlyIncome / monthsElapsed
  const monthlyExpenseAverage = yearlyExpenses / monthsElapsed

  const cards = [
    {
      href: "/analytics?tab=income",
      titleKey: "Revenue",
      value: formatEuros(yearlyIncome),
      sub: `${t("Monthly average")}: ${formatEuros(monthlyAverage)}`,
    },
    {
      href: "/analytics?tab=expenses",
      titleKey: "Expenses",
      value: formatEuros(yearlyExpenses),
      sub: `${t("Monthly average")}: ${formatEuros(monthlyExpenseAverage)}`,
    },
    {
      href: "/analytics?tab=savings",
      titleKey: "Savings/Investment",
      value: formatEuros(0),
      sub: null,
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("Breakdown")}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className={linkClasses}>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t(card.titleKey)}</p>
              <p className="text-2xl font-bold tabular-nums">{card.value}</p>
              {card.sub && <p className="text-xs opacity-80">{card.sub}</p>}
            </div>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}

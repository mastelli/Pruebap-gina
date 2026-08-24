"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, DollarSign, Receipt, LineChart, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { usePortfolioEurTotal } from "@/components/portfolio-total"

function formatEuros(value: number, decimals = 2): string {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// "YYYY-MM" del mes en curso y del anterior (cruza de ano correctamente)
function monthPrefixes(): { cur: string; prev: string } {
  const now = new Date()
  const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prev = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`
  return { cur, prev }
}

interface CardModel {
  title: string
  icon: LucideIcon
  amount: string
  pct: number | null
  // para los gastos subir es malo: se invierten los colores
  invertColor?: boolean
}

export function OverviewCards() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const { total: investment, momPct } = usePortfolioEurTotal()

  const { cur, prev } = monthPrefixes()
  let incCur = 0
  let incPrev = 0
  let expCur = 0
  let expPrev = 0
  for (const transaction of transactions) {
    if (transaction.date.startsWith(cur)) {
      if (transaction.amount > 0) incCur += transaction.amount
      else expCur += -transaction.amount
    } else if (transaction.date.startsWith(prev)) {
      if (transaction.amount > 0) incPrev += transaction.amount
      else expPrev += -transaction.amount
    }
  }

  // variacion porcentual; null cuando no hay dato del mes anterior
  const pct = (current: number, previous: number): number | null =>
    previous > 0 ? ((current - previous) / previous) * 100 : null

  const pctText = (value: number): string =>
    `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(2).replace(".", ",")}%`

  const cards: CardModel[] = [
    {
      title: "Monthly Remainder",
      icon: Wallet,
      amount: formatEuros(incCur - expCur),
      pct: null,
    },
    {
      title: "Total Income",
      icon: DollarSign,
      amount: formatEuros(incCur),
      pct: pct(incCur, incPrev),
    },
    {
      title: "Total Expenses",
      icon: Receipt,
      amount: formatEuros(expCur),
      pct: pct(expCur, expPrev),
      invertColor: true,
    },
    {
      title: "Total Investment",
      icon: LineChart,
      amount: investment === null ? "…" : formatEuros(investment, 0),
      pct: momPct,
    },
  ]

  return (
    <>
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t(card.title)}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{card.amount}</div>
            {card.pct === null ? (
              <p className="mt-2 text-xs text-muted-foreground">—</p>
            ) : (
              <div
                className={`mt-2 flex items-center text-xs ${
                  (card.pct >= 0) !== Boolean(card.invertColor) ? "text-green-500" : "text-red-500"
                }`}
              >
                <TrendingUp
                  className={`mr-1 h-3 w-3 ${card.pct < 0 ? "transform rotate-180" : ""}`}
                />
                {`${pctText(card.pct)} ${t("from last month")}`}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  )
}

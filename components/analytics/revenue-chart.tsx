"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { usePortfolioEurTotal } from "@/components/portfolio-total"
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

const HISTORY_STORAGE_KEY = "appPortfolioHistory"

interface ChartPoint {
  month: string
  income: number | null
  expenses: number | null
  difference: number | null
  investment: number | null
}

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })
}

// Resumen mensual del ano en curso: columnas de ingresos y gastos de cada
// mes, linea naranja con la diferencia (ingresos - gastos) y linea azul
// con la evolucion de la inversion total
export function RevenueChart() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const { total: investmentNow } = usePortfolioEurTotal()
  const [investmentHistory, setInvestmentHistory] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      const raw = storageGetItem(HISTORY_STORAGE_KEY)
      if (raw) setInvestmentHistory(JSON.parse(raw) as Record<string, number>)
    } catch {
      // almacenamiento no disponible
    }
  }, [])

  const now = new Date()
  const year = now.getFullYear()
  const lastMonthIndex = now.getMonth()

  const data: ChartPoint[] = []
  for (let m = 0; m <= lastMonthIndex; m++) {
    const prefix = `${year}-${String(m + 1).padStart(2, "0")}`
    let income = 0
    let expenses = 0
    for (const transaction of transactions) {
      if (!transaction.date.startsWith(prefix)) continue
      if (transaction.amount > 0) income += transaction.amount
      else expenses += -transaction.amount
    }
    const isCurrentMonth = m === lastMonthIndex
    const investment =
      investmentHistory[prefix] ??
      (isCurrentMonth && investmentNow !== null ? investmentNow : null)
    data.push({
      month: t(MONTHS[m]).slice(0, 3),
      income,
      expenses,
      difference: income - expenses,
      investment,
    })
  }

  const tooltipLabelFor = (dataKey?: string | number): string => {
    switch (dataKey) {
      case "income":
        return t("Total Income")
      case "expenses":
        return t("Total Expenses")
      case "difference":
        return t("Difference")
      default:
        return t("Total Investment")
    }
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ dataKey?: string | number; value?: number }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <Card className="border-none shadow-lg">
          <CardContent className="p-2">
            <p className="text-sm font-semibold">{label}</p>
            {payload.map((entry) => (
              <p key={String(entry.dataKey)} className="text-sm text-muted-foreground">
                {tooltipLabelFor(entry.dataKey)}: {formatEuros(Number(entry.value))}
              </p>
            ))}
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis
          dataKey="month"
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatEuros(value)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatEuros(value)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="income"
          name={t("Total Income")}
          fill={theme === "dark" ? "#22c55e" : "#16a34a"}
          maxBarSize={28}
          radius={[3, 3, 0, 0]}
        />
        <Bar
          yAxisId="left"
          dataKey="expenses"
          name={t("Total Expenses")}
          fill={theme === "dark" ? "#f87171" : "#dc2626"}
          maxBarSize={28}
          radius={[3, 3, 0, 0]}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="difference"
          name={t("Difference")}
          stroke={theme === "dark" ? "#fb923c" : "#ea580c"}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="investment"
          name={t("Total Investment")}
          stroke={theme === "dark" ? "#60a5fa" : "#1d4ed8"}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

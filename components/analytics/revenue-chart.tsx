"use client"

import { useEffect, useState } from "react"
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { usePortfolioEurTotal } from "@/components/portfolio-total"

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
  remainder: number | null
  investment: number | null
}

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })
}

// Resto mensual (ingresos - gastos) de cada mes del ano en curso junto
// con la evolucion de la inversion total (historico guardado por el
// dashboard; los meses sin instantanea quedan sin punto)
export function RevenueChart() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const { total: investmentNow } = usePortfolioEurTotal()
  const [investmentHistory, setInvestmentHistory] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
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
    const key = prefix
    const isCurrentMonth = m === lastMonthIndex
    const investment =
      investmentHistory[key] ?? (isCurrentMonth && investmentNow !== null ? investmentNow : null)
    data.push({
      month: t(MONTHS[m]).slice(0, 3),
      remainder: income - expenses,
      investment,
    })
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
                {t(entry.dataKey === "remainder" ? "Monthly Remainder" : "Total Investment")}:{" "}
                {formatEuros(Number(entry.value))}
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
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="remainder"
          name={t("Monthly Remainder")}
          stroke={theme === "dark" ? "#adfa1d" : "#0ea5e9"}
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="investment"
          name={t("Total Investment")}
          stroke={theme === "dark" ? "#60a5fa" : "#1d4ed8"}
          strokeWidth={2}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

"use client"

import { Bar, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"

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
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })
}

interface ChartPoint {
  month: string
  net: number
  cumulative: number
}

// Neto mensual (ingresos - gastos) del ano en curso en barras y saldo
// acumulado en linea: muestra como evoluciona el dinero mes a mes
export function CumulativeBalanceChart() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const year = now.getFullYear()

  const data: ChartPoint[] = []
  let cumulative = 0
  for (let m = 0; m <= now.getMonth(); m++) {
    const prefix = `${year}-${String(m + 1).padStart(2, "0")}`
    let income = 0
    let expenses = 0
    for (const transaction of transactions) {
      if (!transaction.date.startsWith(prefix)) continue
      if (transaction.amount > 0) income += transaction.amount
      else expenses += -transaction.amount
    }
    const net = income - expenses
    cumulative += net
    data.push({ month: t(MONTHS[m]).slice(0, 3), net, cumulative })
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
                {String(entry.dataKey) === "cumulative"
                  ? t("Cumulative Balance")
                  : t("Monthly Net")}
                : {formatEuros(Number(entry.value))}
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
      <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <XAxis
          dataKey="month"
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={theme === "dark" ? "#888888" : "#333333"}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatEuros(value)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
        <Legend />
        <Bar
          dataKey="net"
          name={t("Monthly Net")}
          fill={theme === "dark" ? "#80cbc4" : "#26a69a"}
          maxBarSize={32}
          radius={[3, 3, 0, 0]}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          name={t("Cumulative Balance")}
          stroke={theme === "dark" ? "#60a5fa" : "#1d4ed8"}
          strokeWidth={3}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
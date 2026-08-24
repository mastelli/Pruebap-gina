"use client"

import { ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts"
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
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Puntos con la suma mensual de gastos a lo largo del ano
export function ExpenseHistory() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`

  const data = MONTHS.map((month, index) => {
    const prefix = `${currentYear}-${String(index + 1).padStart(2, "0")}`
    const total = transactions
      .filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(prefix))
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

    return { monthIndex: index + 1, total }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart>
        <XAxis
          type="number"
          dataKey="monthIndex"
          domain={[1, 12]}
          ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          tickFormatter={(value) => t(MONTHS[value - 1]).slice(0, 3)}
          tick={{ fontSize: 11 }}
        />
        <YAxis />
        <Tooltip
          cursor={{ strokeDasharray: "4 4" }}
          formatter={(value) => formatEuros(Number(value))}
          labelFormatter={() => ""}
          contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8 }}
          labelStyle={{ color: "#000000", fontWeight: 600 }}
          itemStyle={{ color: "#000000" }}
        />
        <Scatter data={data} dataKey="total" name={t("Expenses")} fill="#e53935" />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

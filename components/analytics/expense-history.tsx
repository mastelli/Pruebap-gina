"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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

// Linea con puntos marcando la suma mensual de gastos a lo largo del ano
export function ExpenseHistory() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`

  const data = MONTHS.map((month, index) => {
    const prefix = `${currentYear}-${String(index + 1).padStart(2, "0")}`
    const total = transactions
      .filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(prefix))
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

    return { month: t(month), total }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis />
        <Tooltip
          formatter={(value) => formatEuros(Number(value))}
          cursor={{ strokeDasharray: "4 4" }}
          contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8 }}
          labelStyle={{ color: "#000000", fontWeight: 600 }}
          itemStyle={{ color: "#000000" }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name={t("Expenses")}
          stroke="#e53935"
          strokeWidth={2}
          dot={{ r: 4, fill: "#e53935" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

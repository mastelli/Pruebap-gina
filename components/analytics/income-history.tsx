"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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

// Evolucion de los ingresos totales mes a mes durante el ano en curso
export function IncomeHistory() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`

  const data = MONTHS.map((month, index) => {
    const monthKey = String(index + 1).padStart(2, "0")
    const total = transactions
      .filter(
        (transaction) =>
          transaction.amount > 0 &&
          transaction.date.startsWith(`${currentYear}-${monthKey}`),
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return { month: t(month), total }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tickFormatter={(value) => t(value)} tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis />
        <Tooltip formatter={(value) => formatEuros(Number(value))} />
        <Line type="monotone" dataKey="total" stroke="#2e7d32" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

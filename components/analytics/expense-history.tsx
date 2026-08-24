"use client"

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getCategoryFor, EXPENSE_CATEGORY_DEFS } from "@/lib/categories"

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

// Columnas apiladas por mes con el gasto del ano repartido por tipo
export function ExpenseHistory() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`

  const data = MONTHS.map((month, index) => {
    const monthKey = String(index + 1).padStart(2, "0")
    const prefix = `${currentYear}-${monthKey}`
    const totals: Record<string, number> = {}
    for (const def of EXPENSE_CATEGORY_DEFS) totals[def.key] = 0

    for (const transaction of transactions) {
      if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
      totals[getCategoryFor(transaction)] += Math.abs(transaction.amount)
    }

    return { month: t(month), ...totals }
  })

  // Solo mostrar series con algun gasto en el ano para no saturar la leyenda
  const activeDefs = EXPENSE_CATEGORY_DEFS.filter((def) =>
    data.some((row) => row[def.key] > 0),
  )

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis />
        <Tooltip
          formatter={(value) => formatEuros(Number(value))}
          cursor={{ fill: "rgba(0,0,0,0.05)" }}
          contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8 }}
          labelStyle={{ color: "#000000", fontWeight: 600 }}
          itemStyle={{ color: "#000000" }}
        />
        <Legend />
        {activeDefs.map((def, index) => (
          <Bar
            key={def.key}
            dataKey={def.key}
            name={t(def.key)}
            stackId="expenses"
            fill={def.color}
            radius={index === activeDefs.length - 1 ? [4, 4, 0, 0] : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

// Tonos verdes, uno por categoria
const SLICE_COLORS = ["#66bb6a", "#43a047", "#2e7d32"]

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

interface IncomeCategoriesChartProps {
  scope?: "month" | "year"
  month?: string
}

export function IncomeCategoriesChart({ scope = "month", month }: IncomeCategoriesChartProps) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const year = `${now.getFullYear()}`
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
  const selectedMonth = month ?? currentMonth
  const { salary, transfers, bizum } = getIncomeBreakdown(
    transactions,
    scope === "month" ? `${year}-${selectedMonth}` : year,
  )

  const data = [
    { label: "Salary", total: salary },
    { label: "Transfers", total: transfers },
    { label: "Bizum", total: bizum },
  ].map((row) => ({ ...row, label: t(row.label) }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="label"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatEuros(Number(value))}
          contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8 }}
          labelStyle={{ color: "#000000", fontWeight: 600 }}
          itemStyle={{ color: "#000000" }}
        />
        <Legend verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  )
}

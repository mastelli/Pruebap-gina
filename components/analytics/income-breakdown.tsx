"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getPeriodPrefix } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

// Tonos verdes, uno por categoria
const SLICE_COLORS = ["#66bb6a", "#2e7d32"] // Salary y Bizum/Transferencia (sin Transfers separado)

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
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
  const selectedMonth = month ?? currentMonth
  const year = scope === "month" ? getPeriodPrefix(transactions, selectedMonth) : `${now.getFullYear()}`
  const { salary, transfers } = getIncomeBreakdown(transactions, year)

  const data = [
    { label: "Salary", total: salary, color: SLICE_COLORS[0] },
    { label: "Bizum/Transferencia", total: transfers, color: SLICE_COLORS[1] },
  ]
    .map((row) => ({ ...row, label: t(row.label) }))
    .filter((row) => row.total > 0)

  const totalIncome = data.reduce((sum, d) => sum + d.total, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        {t("No transactions yet")}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="label"
          innerRadius={75}
          outerRadius={118}
          paddingAngle={2}
          cy="50%"
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Pie>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground">
          <tspan fontSize={20} fontWeight={700}>{formatEuros(totalIncome)}</tspan>
        </text>
        <Tooltip
          formatter={(value) => formatEuros(Number(value))}
          contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8 }}
          labelStyle={{ color: "#000000", fontWeight: 600 }}
          itemStyle={{ color: "#000000" }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

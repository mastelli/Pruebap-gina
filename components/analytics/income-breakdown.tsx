"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

// Tonos verdes, uno por categoria
const SLICE_COLORS = ["#66bb6a", "#43a047", "#2e7d32"]

const RADIAN = Math.PI / 180

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
    { label: "Salary", total: salary, color: SLICE_COLORS[0] },
    { label: "Transfers", total: transfers, color: SLICE_COLORS[1] },
    { label: "Bizum", total: bizum, color: SLICE_COLORS[2] },
  ]
    .map((row) => ({ ...row, label: t(row.label) }))
    .filter((row) => row.total > 0)

  // Etiqueta exterior en dos lineas: categoria e importe con linea que
  // senala la porcion correspondiente
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    name,
    value,
    payload,
  }: {
    cx?: number
    cy?: number
    midAngle?: number
    outerRadius?: number
    name?: string
    value?: number
    payload?: { color?: string }
  }) => {
    const angle = -(midAngle ?? 0) * RADIAN
    const x = (cx ?? 0) + ((outerRadius ?? 0) + 10) * Math.cos(angle)
    const y = (cy ?? 0) + ((outerRadius ?? 0) + 10) * Math.sin(angle)
    const anchor = Math.cos(angle) >= 0 ? "start" : "end"
    return (
      <text x={x} y={y} textAnchor={anchor} dominantBaseline="central">
        <tspan x={x} dy={-7} fill="#78909c" fontSize={10} fontWeight={500}>
          {name}
        </tspan>
        <tspan
          x={x}
          dy={13}
          fill={payload?.color ?? "#37474f"}
          fontSize={12}
          fontWeight={700}
        >
          {formatEuros(Number(value))}
        </tspan>
      </text>
    )
  }

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
          innerRadius={45}
          outerRadius={72}
          paddingAngle={2}
          label={renderLabel}
          labelLine={{ stroke: "#b0bec5", strokeWidth: 1 }}
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Pie>
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

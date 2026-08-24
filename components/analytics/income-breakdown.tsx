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

  // Etiqueta exterior en dos lineas con linea de senalacion propia:
  // categoria e importe, mas separadas del borde de la porcion
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
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const startR = (outerRadius ?? 0) + 10
    const endR = (outerRadius ?? 0) + 26
    const sx = (cx ?? 0) + startR * cos
    const sy = (cy ?? 0) + startR * sin
    const ex = (cx ?? 0) + endR * cos
    const ey = (cy ?? 0) + endR * sin
    const anchor = cos >= 0 ? "start" : "end"
    const tx = ex + (cos >= 0 ? 8 : -8)
    return (
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#b0bec5" strokeWidth={1} />
        <text x={tx} y={ey} textAnchor={anchor} dominantBaseline="central">
          <tspan x={tx} dy={-7} fill="#78909c" fontSize={10} fontWeight={500}>
            {name}
          </tspan>
          <tspan
            x={tx}
            dy={13}
            fill={payload?.color ?? "#37474f"}
            fontSize={12}
            fontWeight={700}
          >
            {formatEuros(Number(value))}
          </tspan>
        </text>
      </g>
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
          innerRadius={62}
          outerRadius={98}
          paddingAngle={2}
          cy="50%"
          label={renderLabel}
          labelLine={false}
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

// Total de ingresos del mes seleccionado, mostrado en la cabecera
export function IncomeTotal({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const year = `${new Date().getFullYear()}`
  const { salary, transfers, bizum } = getIncomeBreakdown(transactions, `${year}-${month}`)
  const total = salary + transfers + bizum

  return (
    <div className="text-right">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Total")}</p>
      <p className="text-lg font-bold tabular-nums">{formatEuros(total)}</p>
    </div>
  )
}

"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getCategoryFor, getAllExpenseCategories } from "@/lib/categories"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

const RADIAN = Math.PI / 180

export function ExpenseDoughnut({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const prefix = `${now.getFullYear()}-${month}`

  const allDefs = getAllExpenseCategories()
  const totals: Record<string, number> = {}
  for (const def of allDefs) totals[def.key] = 0
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
    const cat = getCategoryFor(transaction)
    if (!totals[cat]) totals[cat] = 0
    totals[cat] += Math.abs(transaction.amount)
  }

  const data = allDefs.filter((def) => totals[def.key] > 0)
    .map((def) => ({
      label: t(def.key),
      total: totals[def.key],
      color: def.color,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"))

  const totalExpenses = data.reduce((sum, d) => sum + d.total, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("No transactions yet")}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={100}
          outerRadius={160}
          paddingAngle={2}
          label={(props: any) => {
            const { cx, cy, midAngle, outerRadius, percent, label: nameLabel, total: entryTotal } = props
            if (!percent || percent < 0.02 || !midAngle) return null
            const radius = outerRadius + 38
            const x = cx + radius * Math.cos(-midAngle * RADIAN)
            const y = cy + radius * Math.sin(-midAngle * RADIAN)
            const anchor = x > cx ? "start" : "end"
            return (
              <text x={x} y={y} fill="currentColor" textAnchor={anchor} dominantBaseline="central" fontSize={11}>
                <tspan x={x} dy={-6} fontWeight={600}>{nameLabel}</tspan>
                <tspan x={x} dy={14} fill="currentColor" opacity={0.6}>{formatEuros(entryTotal)}</tspan>
              </text>
            )
          }}
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Pie>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground">
          <tspan fontSize={20} fontWeight={700}>{formatEuros(totalExpenses)}</tspan>
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

export function ExpenseTotal({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const prefix = `${now.getFullYear()}-${month}`
  const total = transactions.reduce(
    (sum, transaction) =>
      transaction.amount < 0 && transaction.date.startsWith(prefix)
        ? sum + Math.abs(transaction.amount)
        : sum,
    0,
  )

  return (
    <div className="text-right">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("Total")}</p>
      <p className="text-lg font-bold tabular-nums">{formatEuros(total)}</p>
    </div>
  )
}

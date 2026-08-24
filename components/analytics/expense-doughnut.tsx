"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { classifyTransaction, EXPENSE_CATEGORY_DEFS } from "@/lib/categories"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Doughnut con el gasto del mes seleccionado repartido por tipo
export function ExpenseDoughnut({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const prefix = `${now.getFullYear()}-${month}`

  const totals: Record<string, number> = {}
  for (const def of EXPENSE_CATEGORY_DEFS) totals[def.key] = 0
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
    totals[classifyTransaction(transaction)] += Math.abs(transaction.amount)
  }

  const data = EXPENSE_CATEGORY_DEFS.filter((def) => totals[def.key] > 0).map((def) => ({
    label: t(def.key),
    total: totals[def.key],
    color: def.color,
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("No transactions yet")}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="label" innerRadius={60} outerRadius={95} paddingAngle={2}>
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
        <Legend verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  )
}

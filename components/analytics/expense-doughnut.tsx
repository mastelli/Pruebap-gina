"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getCategoryFor, getAllExpenseCategories, isInternalTransferTransaction } from "@/lib/categories"
import { getPeriodPrefix } from "@/lib/transactions"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function ExpenseDoughnut({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const prefix = getPeriodPrefix(transactions, month)

  const allDefs = getAllExpenseCategories()
  const totals: Record<string, number> = {}
  for (const def of allDefs) totals[def.key] = 0
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
    if (isInternalTransferTransaction(transaction)) continue
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

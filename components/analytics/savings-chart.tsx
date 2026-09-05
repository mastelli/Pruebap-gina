"use client"

import {
  Area,
  Bar,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useState } from "react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getLatestPeriod } from "@/lib/transactions"

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
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
}

function formatCompact(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1000000) return `${sign}${(abs / 1000000).toLocaleString("es-ES", { maximumFractionDigits: 1 })}M €`
  if (abs >= 1000) return `${sign}${(abs / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })}k €`
  return `${sign}${Math.round(abs).toLocaleString("es-ES")} €`
}

// Ingresos, gastos y ahorro (ingresos - gastos) de cada mes del ano
// de los datos, con el ahorro destacado como area sobre las columnas
export function SavingsChart() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const year = getLatestPeriod(transactions).slice(0, 4)

  const data = MONTHS.map((name, index) => {
    const prefix = `${year}-${String(index + 1).padStart(2, "0")}`
    let income = 0
    let expenses = 0
    for (const transaction of transactions) {
      if (!transaction.date.startsWith(prefix)) continue
      if (transaction.amount > 0) income += transaction.amount
      else expenses += -transaction.amount
    }
    return { month: `${t(name).slice(0, 3)}`, income, expenses, savings: income - expenses }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={50}
        />
        <YAxis tickFormatter={formatCompact} tick={{ fontSize: 11 }} width={70} />
        <Tooltip
          formatter={(value) => formatEuros(Number(value))}
          cursor={{ fill: "rgba(128,128,128,0.08)" }}
        />
        <Legend />
        <Bar dataKey="income" name={t("Total Income")} fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={22} />
        <Bar dataKey="expenses" name={t("Expenses")} fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={22} />
        <Area
          type="monotone"
          dataKey="savings"
          name={t("Savings this month")}
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#savingsGradient)"
          dot={{ r: 3, fill: "#6366f1" }}
        />
        <defs>
          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
      </ComposedChart>
    </ResponsiveContainer>
  )
}
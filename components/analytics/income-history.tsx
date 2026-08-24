"use client"

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { classifyTransaction } from "@/lib/categories"

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

// Verdes para ingresos; rojos/morado/gris para tipos de gasto
const CATEGORY_COLORS = {
  Salary: "#66bb6a",
  Transfers: "#43a047",
  Bizum: "#2e7d32",
  Electricity: "#ef5350",
  Internet: "#e53935",
  Water: "#ff8a65",
  Subscriptions: "#ba68c8",
  Other: "#90a4ae",
}

const CATEGORY_LABEL_KEYS = {
  Salary: "Salary",
  Transfers: "Transfers",
  Bizum: "Bizum",
  Electricity: "Electricity",
  Internet: "Internet",
  Water: "Water",
  Subscriptions: "Subscriptions",
  Other: "Other Expenses",
} as const

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Columnas apiladas por mes con todas las transacciones del ano:
// ingresos por encima del eje y gastos por debajo
export function IncomeHistory() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`

  const data = MONTHS.map((month, index) => {
    const monthKey = String(index + 1).padStart(2, "0")
    const prefix = `${currentYear}-${monthKey}`
    const totals: Record<string, number> = {
      Salary: 0,
      Transfers: 0,
      Bizum: 0,
      Electricity: 0,
      Internet: 0,
      Water: 0,
      Subscriptions: 0,
      Other: 0,
    }

    for (const transaction of transactions) {
      if (!transaction.date.startsWith(prefix)) continue
      if (transaction.amount > 0) {
        totals[classifyTransaction(transaction)] += transaction.amount
      } else {
        totals[classifyTransaction(transaction)] -= Math.abs(transaction.amount)
      }
    }

    return {
      month: t(month),
      Salary: totals.Salary,
      Transfers: totals.Transfers,
      Bizum: totals.Bizum,
      Electricity: -totals.Electricity,
      Internet: -totals.Internet,
      Water: -totals.Water,
      Subscriptions: -totals.Subscriptions,
      Other: -totals.Other,
    }
  })

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
        <Bar dataKey="Salary" name={t("Salary")} stackId="income" fill={CATEGORY_COLORS.Salary} />
        <Bar dataKey="Transfers" name={t("Transfers")} stackId="income" fill={CATEGORY_COLORS.Transfers} />
        <Bar dataKey="Bizum" name={t("Bizum")} stackId="income" fill={CATEGORY_COLORS.Bizum} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Electricity" name={t("Electricity")} stackId="expenses" fill={CATEGORY_COLORS.Electricity} />
        <Bar dataKey="Internet" name={t("Internet")} stackId="expenses" fill={CATEGORY_COLORS.Internet} />
        <Bar dataKey="Water" name={t("Water")} stackId="expenses" fill={CATEGORY_COLORS.Water} />
        <Bar dataKey="Subscriptions" name={t("Subscriptions")} stackId="expenses" fill={CATEGORY_COLORS.Subscriptions} />
        <Bar dataKey="Other" name={t("Other Expenses")} stackId="expenses" fill={CATEGORY_COLORS.Other} radius={[0, 0, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

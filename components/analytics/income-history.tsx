"use client"

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

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

// Mismos colores que en Desglose de ingresos
const STACK_COLORS = {
  salary: "#66bb6a",
  transfers: "#43a047",
  bizum: "#2e7d32",
}

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Columnas apiladas por mes con nomina, transferencias y bizum
export function IncomeHistory() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`

  const data = MONTHS.map((month, index) => {
    const monthKey = String(index + 1).padStart(2, "0")
    const totals = getIncomeBreakdown(transactions, `${currentYear}-${monthKey}`)

    return {
      month: t(month),
      salary: totals.salary,
      transfers: totals.transfers,
      bizum: totals.bizum,
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
        <Bar dataKey="salary" name={t("Salary")} stackId="income" fill={STACK_COLORS.salary} />
        <Bar dataKey="transfers" name={t("Transfers")} stackId="income" fill={STACK_COLORS.transfers} />
        <Bar dataKey="bizum" name={t("Bizum")} stackId="income" fill={STACK_COLORS.bizum} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

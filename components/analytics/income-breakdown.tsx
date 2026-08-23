"use client"

import { useTheme } from "next-themes"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getIncomeBreakdown } from "@/lib/income"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function IncomeBreakdown() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const currentYear = `${new Date().getFullYear()}`
  const { salary, transfers, bizum } = getIncomeBreakdown(transactions, currentYear)

  const data = [
    { label: "Salary", total: salary },
    { label: "Transfers", total: transfers },
    { label: "Bizum", total: bizum },
  ].map((row) => ({ ...row, label: t(row.label) }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip formatter={(value) => formatEuros(Number(value))} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
        <Bar dataKey="total" fill={theme === "dark" ? "#adfa1d" : "#0ea5e9"} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

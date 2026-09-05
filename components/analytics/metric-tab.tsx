"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"

const customerSegmentationData = [
  { segment: "High Value", count: 1200 },
  { segment: "Medium Value", count: 5300 },
  { segment: "Low Value", count: 8500 },
  { segment: "At Risk", count: 1700 },
  { segment: "Lost", count: 800 },
]

const retentionRateData = [
  { month: "Jan", rate: 95 },
  { month: "Feb", rate: 93 },
  { month: "Mar", rate: 94 },
  { month: "Apr", rate: 95 },
  { month: "May", rate: 97 },
  { month: "Jun", rate: 98 },
]

const channelPerformanceData = [
  { channel: "Direct", acquisitions: 1200, revenue: 50000 },
  { channel: "Organic Search", acquisitions: 2500, revenue: 75000 },
  { channel: "Paid Search", acquisitions: 1800, revenue: 60000 },
  { channel: "Social Media", acquisitions: 1500, revenue: 45000 },
  { channel: "Email", acquisitions: 900, revenue: 30000 },
]

const MONTHS = [
  { key: "01", label: "Ene" },
  { key: "02", label: "Feb" },
  { key: "03", label: "Mar" },
  { key: "04", label: "Abr" },
  { key: "05", label: "May" },
  { key: "06", label: "Jun" },
  { key: "07", label: "Jul" },
  { key: "08", label: "Ago" },
  { key: "09", label: "Sep" },
  { key: "10", label: "Oct" },
  { key: "11", label: "Nov" },
  { key: "12", label: "Dic" },
]

function getCurrentMonth(): string {
  return String(new Date().getMonth() + 1).padStart(2, "0")
}

interface MetricTabProps {
  titleKey: string
  hideTitle?: boolean
  customBody?: (month: string, setMonth: (m: string) => void) => ReactNode
  firstCardTitleKey?: string
  firstCardAction?: ReactNode | ((month: string) => ReactNode)
  firstCard?: (month: string) => ReactNode
  secondCardTitleKey?: string
  secondCard?: ReactNode
  thirdCardTitleKey?: string
  thirdCard?: ReactNode | ((month: string) => ReactNode)
  metricsTitleKey?: string
  metricsCard?: ReactNode
}

// Plantilla comun para las pestanas de Ingresos, Gastos y Ahorro/Inversion;
// cada seccion personalizara sus datos sobre esta misma estructura.
// customBody sustituye las cuatro ventanas por un layout a medida
export function MetricTab({
  titleKey,
  hideTitle = false,
  customBody,
  firstCardTitleKey,
  firstCardAction,
  firstCard,
  secondCardTitleKey,
  secondCard,
  thirdCardTitleKey,
  thirdCard,
  metricsTitleKey,
  metricsCard,
}: MetricTabProps) {
  const { theme } = useTheme()
  const { transactions } = useTransactions()
  // El mes seleccionado por defecto es el de la ultima transaccion,
  // asi las pestanas de Ingresos y Gastos abren mostrando datos reales
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const latestDate = transactions.reduce((max, transaction) => (transaction.date > max ? transaction.date : max), "")
    return latestDate.length >= 7 ? latestDate.slice(5, 7) : getCurrentMonth()
  })
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      {customBody ? (
        customBody(selectedMonth, setSelectedMonth)
      ) : (
        <>
          {!hideTitle && (
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold">{t(titleKey)}</h3>
            </div>
          )}
          <div className="flex items-center justify-center gap-1">
            {MONTHS.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedMonth(m.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  selectedMonth === m.key
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-semibold">
                  {t(firstCardTitleKey ?? "Customer Segmentation")}
                </CardTitle>
                {typeof firstCardAction === "function" ? firstCardAction(selectedMonth) : firstCardAction}
              </CardHeader>
              <CardContent>
                {firstCard ? (
                  firstCard(selectedMonth)
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={customerSegmentationData}>
                      <XAxis dataKey="segment" tickFormatter={(value) => t(value)} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill={theme === "dark" ? "#adfa1d" : "#0ea5e9"} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {t(secondCardTitleKey ?? "Customer Retention Rate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {secondCard ?? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={retentionRateData}>
                      <XAxis dataKey="month" tickFormatter={(value) => t(value)} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke={theme === "dark" ? "#adfa1d" : "#0ea5e9"} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {t(thirdCardTitleKey ?? "Channel Performance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeof thirdCard === "function" ? (
                  thirdCard(selectedMonth)
                ) : (
                  thirdCard ?? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={channelPerformanceData}>
                        <XAxis dataKey="channel" tickFormatter={(value) => t(value)} />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="acquisitions" fill={theme === "dark" ? "#adfa1d" : "#0ea5e9"} />
                        <Bar yAxisId="right" dataKey="revenue" fill={theme === "dark" ? "#1e40af" : "#3b82f6"} />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{t(metricsTitleKey ?? "Key Metrics")}</CardTitle>
              </CardHeader>
              {metricsCard ?? (
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("Customer Lifetime Value")}</p>
                    <p className="text-2xl font-bold">$1,250</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("Net Promoter Score")}</p>
                    <p className="text-2xl font-bold">72</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("Customer Acquisition Cost")}</p>
                    <p className="text-2xl font-bold">$75</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t("Average Order Value")}</p>
                    <p className="text-2xl font-bold">$120</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

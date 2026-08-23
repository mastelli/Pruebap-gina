"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useLanguage } from "@/lib/i18n"

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

interface MetricTabProps {
  titleKey: string
  firstCardTitleKey?: string
  firstCard?: ReactNode
  secondCardTitleKey?: string
  secondCard?: ReactNode
  thirdCardTitleKey?: string
  thirdCard?: ReactNode
}

// Plantilla comun para las pestanas de Ingresos, Gastos y Ahorro/Inversion;
// cada seccion personalizara sus datos sobre esta misma estructura
export function MetricTab({
  titleKey,
  firstCardTitleKey,
  firstCard,
  secondCardTitleKey,
  secondCard,
  thirdCardTitleKey,
  thirdCard,
}: MetricTabProps) {
  const { theme } = useTheme()
  const [timeFrame, setTimeFrame] = useState("last_30_days")
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">{t(titleKey)}</h3>
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("Last 30 Days")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7_days">{t("Last 7 Days")}</SelectItem>
            <SelectItem value="last_30_days">{t("Last 30 Days")}</SelectItem>
            <SelectItem value="last_90_days">{t("Last 90 Days")}</SelectItem>
            <SelectItem value="last_12_months">{t("Last 12 Months")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {t(firstCardTitleKey ?? "Customer Segmentation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {firstCard ?? (
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
        <Card className="col-span-3">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {t(thirdCardTitleKey ?? "Channel Performance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {thirdCard ?? (
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
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Key Metrics")}</CardTitle>
          </CardHeader>
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
        </Card>
      </div>
    </div>
  )
}

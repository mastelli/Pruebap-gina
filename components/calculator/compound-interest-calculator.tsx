"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts"
import { useLanguage } from "@/lib/i18n"

type Frequency = "monthly" | "bimonthly" | "quarterly" | "semiannual" | "annual"

const FREQUENCY_KEYS: Record<Frequency, string> = {
  monthly: "Monthly",
  bimonthly: "Bimonthly",
  quarterly: "Quarterly",
  semiannual: "Semiannual",
  annual: "Annual",
}

const FREQUENCY_MULTIPLIERS: Record<Frequency, number> = {
  monthly: 12,
  bimonthly: 6,
  quarterly: 4,
  semiannual: 2,
  annual: 1,
}

interface ChartPoint {
  year: number
  aportaciones: number
  total: number
}

export function CompoundInterestCalculator() {
  const { lang, t } = useLanguage()
  const currency = lang === "es" ? "EUR" : "USD"

  const [initialInvestment, setInitialInvestment] = useState("10000")
  const [contribution, setContribution] = useState("500")
  const [frequency, setFrequency] = useState<Frequency>("monthly")
  const [rate, setRate] = useState("7")
  const [horizon, setHorizon] = useState("20")

  const calculation = useMemo(() => {
    const P = parseFloat(initialInvestment) || 0
    const C = parseFloat(contribution) || 0
    const annualRate = (parseFloat(rate) || 0) / 100
    const years = parseInt(horizon, 10) || 0
    const periodsPerYear = FREQUENCY_MULTIPLIERS[frequency]
    const periodRate = annualRate / periodsPerYear

    if (years <= 0) {
      return { results: [] as ChartPoint[], finalTotal: 0, finalContributions: 0, finalInterest: 0 }
    }

    const data: ChartPoint[] = []
    let balance = P
    let totalContributions = P

    data.push({ year: 0, aportaciones: totalContributions, total: balance })

    for (let y = 1; y <= years; y++) {
      for (let p = 0; p < periodsPerYear; p++) {
        balance = balance * (1 + periodRate) + C
        totalContributions += C
      }
      data.push({
        year: y,
        aportaciones: Math.round(totalContributions),
        total: Math.round(balance),
      })
    }

    return {
      results: data,
      finalTotal: Math.round(balance),
      finalContributions: Math.round(totalContributions),
      finalInterest: Math.round(balance - totalContributions),
    }
  }, [initialInvestment, contribution, frequency, rate, horizon])

  const formatCurrency = (v: number) =>
    v.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

  const formatYAxis = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
    return `${v}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("Compound Interest Calculator")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <Label>{t("Initial Investment")} ({lang === "es" ? "€" : "$"})</Label>
            <Input
              type="number"
              placeholder="10000"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Contribution")} ({lang === "es" ? "€" : "$"})</Label>
            <Input
              type="number"
              placeholder="500"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Frequency")}</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(FREQUENCY_KEYS) as [Frequency, string][]).map(
                  ([key, labelKey]) => (
                    <SelectItem key={key} value={key}>
                      {t(labelKey)}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("Annual Interest Rate")}</Label>
            <Input
              type="number"
              placeholder="7"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              min={0}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Horizon (years)")}</Label>
            <Input
              type="number"
              placeholder="20"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              min={1}
            />
          </div>
        </div>

        {calculation.results.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mt-8 text-center">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">{t("Total Invested")}</p>
                <p className="text-lg font-semibold">{formatCurrency(calculation.finalContributions)}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">{t("Future Interest")}</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(calculation.finalInterest)}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">{t("Final Value")}</p>
                <p className="text-lg font-semibold">{formatCurrency(calculation.finalTotal)}</p>
              </div>
            </div>

            <div className="mt-8 w-full" style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calculation.results}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="year"
                    label={{ value: t("Years"), position: "insideBottom", offset: -5 }}
                    className="text-xs"
                  />
                  <YAxis tickFormatter={formatYAxis} className="text-xs" />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px" }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "total" ? t("Total Value") : t("Contributions"),
                    ]}
                    labelFormatter={(label) => `${t("Years")} ${label}`}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "24px" }}
                    formatter={(value) => (value === "total" ? t("Total Value") : t("Contributions"))}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    fill="url(#gradTotal)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="aportaciones"
                    stroke="#16a34a"
                    fill="url(#gradAport)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

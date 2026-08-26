"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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

type Frequency = "monthly" | "bimonthly" | "quarterly" | "semiannual" | "annual"

const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: "Mensual",
  bimonthly: "Bimestral",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
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

export default function CalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState("")
  const [contribution, setContribution] = useState("")
  const [frequency, setFrequency] = useState<Frequency>("monthly")
  const [rate, setRate] = useState("")
  const [horizon, setHorizon] = useState("")
  const [results, setResults] = useState<ChartPoint[]>([])
  const [finalTotal, setFinalTotal] = useState<number | null>(null)
  const [finalContributions, setFinalContributions] = useState<number | null>(null)
  const [finalInterest, setFinalInterest] = useState<number | null>(null)

  const calculate = () => {
    const P = parseFloat(initialInvestment) || 0
    const C = parseFloat(contribution) || 0
    const annualRate = (parseFloat(rate) || 0) / 100
    const years = parseInt(horizon) || 0
    const periodsPerYear = FREQUENCY_MULTIPLIERS[frequency]
    const periodRate = annualRate / periodsPerYear

    if (years <= 0) return

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

    setResults(data)
    setFinalTotal(Math.round(balance))
    setFinalContributions(Math.round(totalContributions))
    setFinalInterest(Math.round(balance - totalContributions))
  }

  const maxVal = useMemo(() => {
    if (results.length === 0) return 0
    return Math.max(...results.map((r) => r.total))
  }, [results])

  const formatCurrency = (v: number) =>
    v.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

  const formatYAxis = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
    return `${v}`
  }

  return (
    <div className="space-y-6">
      <div aria-hidden="true" className="h-9" />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Calculadora de Interés Compuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Inversión Inicial (€)</Label>
              <Input
                type="number"
                placeholder="10000"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(e.target.value)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label>Aportación (€)</Label>
              <Input
                type="number"
                placeholder="500"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(FREQUENCY_LABELS) as [Frequency, string][]).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tasa de Interés (% anual)</Label>
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
              <Label>Horizonte (años)</Label>
              <Input
                type="number"
                placeholder="20"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                min={1}
              />
            </div>
          </div>

          <Button className="mt-4 w-full" onClick={calculate}>
            Calcular
          </Button>

          {results.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Total Invertido</p>
                  <p className="text-lg font-semibold">{formatCurrency(finalContributions!)}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Intereses Ganados</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(finalInterest!)}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Valor Final</p>
                  <p className="text-lg font-semibold">{formatCurrency(finalTotal!)}</p>
                </div>
              </div>

              <div className="mt-6 w-full" style={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results}>
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
                      label={{ value: "Años", position: "insideBottom", offset: -5 }}
                      className="text-xs"
                    />
                    <YAxis tickFormatter={formatYAxis} className="text-xs" />
                    <RechartsTooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "total" ? "Valor Total" : "Aportaciones",
                      ]}
                      labelFormatter={(label) => `Año ${label}`}
                    />
                    <Legend
                      formatter={(value) => (value === "total" ? "Valor Total" : "Aportaciones")}
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
    </div>
  )
}

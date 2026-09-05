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
import { Sparkles, Sprout, TrendingUp, Layers, Sigma, Lightbulb, Info } from "lucide-react"

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

  const p = (v: string) => parseFloat(v) || 0

  const formatYAxis = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
    return `${v}`
  }

  return (
    <>
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

      {/* ── Sección educativa ── */}
      <div className="mt-10 space-y-6">
        <div className="flex items-center gap-2.5">
          <Sprout className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">¿Cómo funciona el interés compuesto?</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">
          Ajusta arriba tus posibilidades de ahorro e inversión y descubre cuánto podrás acumular.
        </p>

        {/* Callout motivacional */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ejemplo real</p>
          <p className="mt-2 text-xl font-bold text-foreground">
            Aportando <span className="text-primary">300 € al mes</span> durante <span className="text-primary">35 años</span> con una
            revalorización del <span className="text-primary">10% anual</span>, superarás el{" "}
            <span className="text-emerald-600">millón de euros</span> (cerca de 1.138.000 €).
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            La magia está en el tiempo: los intereses de cada año se suman al capital y generan, a su vez, nuevos
            intereses. Al final, casi la mitad de lo acumulado no lo has aportado tú: lo han generado tus propios
            intereses.
          </p>
        </div>

        {/* Qué es / Dónde se aplica */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">¿Por qué crece cada vez más rápido?</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              El primer año, un 10% de 10.000 € son 1.000 €. Pero el segundo año ese interés se calcula sobre los
              11.000 € ya acumulados, y genera 1.100 €. El tercero, 1.210 €. Es el efecto <strong>bola de nieve</strong>:
              cuanto más crece tu capital, más intereses produce, y cuantos más años estés invertido, más se nota.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">¿Dónde se aplica?</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Funciona en cualquier activo cuyos beneficios se reinviertan: fondos indexados, ETFs, acciones,
              criptomonedas o incluso depósitos renovados. La única condición es dejar el capital trabajando y no retirar
              lo que genera.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Fondos indexados", "ETFs", "Acciones", "Criptomonedas", "Depósitos"].map((item) => (
                <span key={item} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fórmula / Consejos */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Sigma className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">La fórmula</h3>
            </div>
            <div className="mt-3 rounded-xl bg-muted p-4 text-center font-mono text-lg text-foreground">
              C<sub>n</sub> = C<sub>0</sub> × (1 + i)<sup>n</sup>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">C<sub>0</sub></span> — capital inicial que aportas.
              </li>
              <li>
                <span className="font-semibold text-foreground">i</span> — interés por periodo (si es mensual: tipo anual ÷ 12).
              </li>
              <li>
                <span className="font-semibold text-foreground">n</span> — número de periodos (años o meses invertidos).
              </li>
              <li>
                <span className="font-semibold text-foreground">C<sub>n</sub></span> — capital final al terminar.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Consejos para sacarle partido</h3>
            </div>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="text-primary">1.</span>
                <span><strong className="text-foreground">Empieza cuanto antes.</strong> Cada año de retraso te cuesta cientos de miles de euros a 30-40 años.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">2.</span>
                <span><strong className="text-foreground">Aporta de forma constante.</strong> Poco cada mes vence a mucho de vez en cuando.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">3.</span>
                <span><strong className="text-foreground">Reinvierte siempre</strong> los intereses y dividendos; es lo que dispara la bola de nieve.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">4.</span>
                <span><strong className="text-foreground">Cuida los costes.</strong> Una comisión del 1,5% frente al 0,1% puede costarte decenas de miles de euros.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">5.</span>
                <span><strong className="text-foreground">Sé realista con el interés.</strong> Para índices diversificados como el S&P 500, un 7-10% anual histórico es una referencia razonada; desconfía de rentabilidades mucho mayores.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Callout con los datos actuales de la calculadora */}
        <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground/90 leading-relaxed">
            Con tus datos actuales —{formatCurrency(p(initialInvestment))} iniciales y {formatCurrency(p(contribution))} al
            {frequency === "monthly" ? " mes" : frequency === "bimonthly" ? " bimestre" : frequency === "quarterly" ? " trimestre" : frequency === "semiannual" ? " semestre" : " año"} al {p(rate)}% durante{" "}
            {p(horizon)} años— acumularías <strong>{formatCurrency(calculation.finalTotal)}</strong>, de los que{" "}
            <strong className="text-emerald-600">{formatCurrency(calculation.finalInterest)}</strong> serían puros
            intereses sobre tu capital inicial aportado.
          </p>
        </div>

        {/* Aviso */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-dashed p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Proyección orientativa con capitalización periódica. Las rentabilidades pasadas de un índice no garantizan
            resultados futuros: el mercado sube y baja, y el interés compuesto funciona de verdad cuando el horizonte es
            largo y las aportaciones constantes. Antes de invertir, contrasta la información con un asesor.
          </p>
        </div>
      </div>
    </>
  )
}

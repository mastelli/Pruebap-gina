"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ComposedChart,
} from "recharts"
import {
  Home, DollarSign, TrendingUp, Building2, Percent,
  Info, Landmark, PiggyBank, BarChart3, Scale, ChevronRight, ChevronLeft,
  KeyRound, ReceiptText, Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type {
  RealEstateInput,
  Currency,
  ScenarioResult,
  SensitivityValueKind,
} from "@/lib/calculators/real-estate-types"
import { totalInitialInvestment } from "@/lib/calculators/real-estate-types"
import {
  calculateKPIs,
  buildProjection,
  buildAmortizationSchedule,
  monthlyMortgagePayment,
} from "@/lib/calculators/real-estate-formulas"
import { runAllScenarios } from "@/lib/calculators/real-estate-scenarios"
import { analyzeSensitivity } from "@/lib/calculators/real-estate-sensitivity"
import { formatCurrency, formatPercent } from "@/lib/calculators/real-estate-format"

// ── Default input (supuestos realistas de España) ─────
function defaultInput(): RealEstateInput {
  return {
    purchase: {
      price: 150_000,
      purchaseExpenses: 2_500, // notaría, registro, gestoría
      taxes: 12_000, // ITP ~8%
      renovationCost: 0,
      furnitureCost: 0,
      otherInitialCost: 0,
    },
    financing: {
      enabled: true,
      ltvPct: 70,
      mortgageAmount: 105_000,
      downPayment: 45_000,
      annualInterestRate: 3, // fija a 30 años ~2.5-3.5% (2026)
      termYears: 30,
      type: "fixed",
      paymentFrequency: "monthly",
    },
    rental: {
      monthlyRent: 900,
      otherMonthlyIncome: 0,
      rentedMonthsPerYear: 12,
      vacancyRate: 5,
      annualRentGrowthPct: 2,
    },
    expenses: {
      communityFee: 60, // €/mes
      ibi: 600, // €/año
      insurance: 250, // €/año
      maintenance: 500, // €/año
      repairs: 300, // €/año
      propertyManagementPct: 8, // % de la renta
      utilities: 0, // €/mes si los paga el dueño
      otherTaxes: 0, // €/año
      otherExpenses: 200, // €/año
      variableExpensePct: 0, // % de la renta
    },
    appreciation: {
      annualAppreciationPct: 2,
      investmentHorizonYears: 10,
    },
    currency: "EUR",
  }
}

// ── Helpers ───────────────────────────────────────────
const p = (v: string | number) => parseFloat(String(v)) || 0

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

// ── Field component ───────────────────────────────────
function Field({
  label, value, onChange, suffix, tooltip, placeholder, type = "number", rightText,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  suffix?: string
  tooltip?: string
  placeholder?: string
  type?: string
  rightText?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm flex items-center gap-1">
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger type="button"><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </Label>
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            min={0}
            step="any"
          />
        </div>
        {suffix && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">{suffix}</span>
        )}
        {rightText && (
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">{rightText}</span>
        )}
      </div>
    </div>
  )
}

// ── Footer row for the form (section totals) ──────────
function FooterRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full pt-3 mt-2 border-t">
      <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">{children}</p>
    </div>
  )
}

function FooterValue({ children }: { children: React.ReactNode }) {
  return <span className="font-bold text-foreground">{children}</span>
}

// ── KPI Card ──────────────────────────────────────────
function KPICard({
  label, value, icon: Icon, tooltip, color = "text-foreground",
}: {
  label: string
  value: string
  icon: LucideIcon
  tooltip: string
  color?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="relative overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-lg font-bold truncate ${color}`}>{value}</p>
              </div>
              <div className="p-2 rounded-full bg-muted shrink-0">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

// ── Summary row (key-value) ───────────────────────────
function SummaryRow({ label, value, strong, positive }: {
  label: string
  value: string
  strong?: boolean
  positive?: boolean
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${strong ? "font-bold text-foreground" : ""} ${positive === undefined ? "" : positive ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}`}>{value}</span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────
export default function AdvancedRealEstateCalculator() {
  const [input, setInput] = useState<RealEstateInput>(defaultInput)
  const [activeStep, setActiveStep] = useState(0)
  const [activeResultsTab, setActiveResultsTab] = useState("overview")
  const [sensitivityVar, setSensitivityVar] = useState<"price" | "rent" | "interestRate" | "ltv" | "appreciation">("price")

  const sym = input.currency === "EUR" ? "€" : input.currency === "GBP" ? "£" : "$"

  // Recalculate mortgage when inputs change (always consistent with price × LTV)
  const resolvedInput = useMemo(() => {
    const inp = { ...input }
    if (inp.financing.enabled) {
      inp.financing.ltvPct = clamp(inp.financing.ltvPct, 0, 100)
      inp.financing.mortgageAmount = inp.purchase.price * inp.financing.ltvPct / 100
      inp.financing.downPayment = Math.max(0, inp.purchase.price - inp.financing.mortgageAmount)
    } else {
      inp.financing.mortgageAmount = 0
      inp.financing.downPayment = 0
      inp.financing.ltvPct = 0
    }
    return inp
  }, [input])

  const kpis = useMemo(() => calculateKPIs(resolvedInput), [resolvedInput])
  const projection = useMemo(() => buildProjection(resolvedInput), [resolvedInput])
  const scenarios = useMemo(() => runAllScenarios(resolvedInput), [resolvedInput])
  const sensitivity = useMemo(
    () => analyzeSensitivity(resolvedInput, sensitivityVar, [-20, -10, 0, 10, 20]),
    [resolvedInput, sensitivityVar],
  )

  // Full amortization schedule (independent of the investment horizon)
  const amortSchedule = useMemo(() => {
    if (!input.financing.enabled || resolvedInput.financing.mortgageAmount <= 0) return []
    return buildAmortizationSchedule(
      resolvedInput.financing.mortgageAmount,
      input.financing.annualInterestRate,
      input.financing.termYears,
    )
  }, [input.financing, resolvedInput])

  const update = useCallback(<K extends keyof RealEstateInput>(key: K, val: RealEstateInput[K]) => {
    setInput(prev => ({ ...prev, [key]: val }))
  }, [])

  const updatePurchase = useCallback((key: keyof RealEstateInput["purchase"], val: string) => {
    setInput(prev => ({
      ...prev,
      purchase: { ...prev.purchase, [key]: p(val) },
    }))
  }, [])

  const updateFinancing = useCallback((key: keyof RealEstateInput["financing"], val: string | boolean) => {
    setInput(prev => ({
      ...prev,
      financing: { ...prev.financing, [key]: typeof val === "string" ? (key === "type" || key === "paymentFrequency" ? val : p(val)) : val },
    }))
  }, [])

  const updateRental = useCallback((key: keyof RealEstateInput["rental"], val: string) => {
    setInput(prev => ({
      ...prev,
      rental: { ...prev.rental, [key]: key === "rentedMonthsPerYear" ? clamp(Math.round(p(val)), 0, 12) : p(val) },
    }))
  }, [])

  const updateExpenses = useCallback((key: keyof RealEstateInput["expenses"], val: string) => {
    setInput(prev => ({
      ...prev,
      expenses: { ...prev.expenses, [key]: key === "propertyManagementPct" || key === "variableExpensePct" ? clamp(p(val), 0, 100) : p(val) },
    }))
  }, [])

  const updateAppreciation = useCallback((key: keyof RealEstateInput["appreciation"], val: string) => {
    setInput(prev => ({
      ...prev,
      appreciation: { ...prev.appreciation, [key]: key === "investmentHorizonYears" ? clamp(Math.round(p(val)), 1, 50) : p(val) },
    }))
  }, [])

  // Chart data
  const chartData = useMemo(() =>
    projection.map(y => ({
      year: `Y${y.year}`,
      propertyValue: y.propertyValue,
      equity: y.equity,
      debt: y.remainingDebt,
      cashFlow: y.annualCashFlow,
      cumulativeCF: y.cumulativeCashFlow,
      income: y.totalIncome,
      expenses: y.operatingExpenses,
      financing: y.financingCosts,
    })),
  [projection])

  const scenarioChartData = useMemo(() => {
    const maxLen = Math.max(0, ...scenarios.map(s => s.projection.length))
    return Array.from({ length: maxLen }, (_, i) => {
      const row: Record<string, number | string> = { year: `Y${i + 1}` }
      scenarios.forEach(s => {
        const proj = s.projection[i]
        if (proj) {
          row[`${s.name}_equity`] = proj.equity
          row[`${s.name}_cashFlow`] = proj.cumulativeCashFlow
        }
      })
      return row
    })
  }, [scenarios])

  const scenarioLabels: Record<string, string> = {
    Conservative: "Conservador",
    Base: "Base",
    Optimistic: "Optimista",
  }
  const scenarioColors: Record<string, string> = {
    Conservative: "#ef4444",
    Base: "#3b82f6",
    Optimistic: "#10b981",
  }

  // Form steps
  const steps: { label: string; icon: LucideIcon }[] = [
    { label: "Compra", icon: Home },
    { label: "Financiación", icon: Landmark },
    { label: "Alquiler", icon: KeyRound },
    { label: "Gastos", icon: ReceiptText },
    { label: "Supuestos", icon: TrendingUp },
  ]

  const formatSensitivityValue = (kind: SensitivityValueKind, val: number) => {
    if (kind === "currency") return formatCurrency(val, input.currency)
    if (kind === "months") return val > 0 ? `${Math.round(val)} mes${Math.round(val) !== 1 ? "es" : ""}` : "—"
    return formatPercent(val)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Hero ── */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-orange-700 text-white p-6 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <p className="text-sm font-medium text-amber-100">Activos Inmobiliarios</p>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">¿Cuánto rinde tu vivienda en alquiler?</h2>
              <p className="text-amber-100/90 text-sm mt-1 max-w-xl">
                Cuenta real de la inversión: cuota hipotecaria, impuestos, comunidad, seguro, mantenimiento y revalorización.
              </p>
            </div>
            <Select value={input.currency} onValueChange={(v) => update("currency", v as Currency)}>
              <SelectTrigger className="w-28 bg-white/15 border-white/25 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR €</SelectItem>
                <SelectItem value="USD">USD $</SelectItem>
                <SelectItem value="GBP">GBP £</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mt-6">
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-amber-100">Capital invertido</p>
              <p className="text-lg font-bold">{formatCurrency(kpis.cashInvested, input.currency)}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-amber-100">Cuota hipoteca</p>
              <p className="text-lg font-bold">
                {input.financing.enabled ? `${formatCurrency(kpis.monthlyMortgage, input.currency)}/mes` : "Sin hipoteca"}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-amber-100">Cash flow mensual</p>
              <p className={`text-lg font-bold ${kpis.monthlyCashFlow >= 0 ? "" : "text-amber-100"}`}>
                {formatCurrency(kpis.monthlyCashFlow, input.currency)}/mes
              </p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-amber-100">ROI sobre capital</p>
              <p className="text-lg font-bold">{formatPercent(kpis.yieldOnEquity)}</p>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-1 mb-4 overflow-x-auto">
              {steps.map((step, i) => (
                <button
                  key={step.label}
                  onClick={() => setActiveStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                    activeStep === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-3.5 h-3.5" />
                  {step.label}
                </button>
              ))}
            </div>

            {/* Step 0: Purchase */}
            {activeStep === 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Precio de compra" value={input.purchase.price} onChange={v => updatePurchase("price", v)} suffix={sym} tooltip="Precio de adquisición del inmueble" />
                <Field label="Impuestos (ITP/AJD)" value={input.purchase.taxes} onChange={v => updatePurchase("taxes", v)} suffix={sym} tooltip="Impuesto de Transmisiones Patrimoniales (vivienda usada, 6-10% según CC.AA.) o AJD/IVA en obra nueva" rightText={input.purchase.price > 0 ? `${((input.purchase.taxes / input.purchase.price) * 100).toFixed(1)}%` : ""} />
                <Field label="Notaría + registro" value={input.purchase.purchaseExpenses} onChange={v => updatePurchase("purchaseExpenses", v)} suffix={sym} tooltip="Notaría, registro de la propiedad y gestoría (~2-3 k€ habituales)" />
                <Field label="Reforma" value={input.purchase.renovationCost} onChange={v => updatePurchase("renovationCost", v)} suffix={sym} />
                <Field label="Mobiliario" value={input.purchase.furnitureCost} onChange={v => updatePurchase("furnitureCost", v)} suffix={sym} />
                <Field label="Otros costes iniciales" value={input.purchase.otherInitialCost} onChange={v => updatePurchase("otherInitialCost", v)} suffix={sym} />
                <FooterRow>
                  <>Coste total de la compra: <FooterValue>{formatCurrency(totalInitialInvestment(input.purchase), input.currency)}</FooterValue></>
                </FooterRow>
              </div>
            )}

            {/* Step 1: Financing */}
            {activeStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Switch checked={input.financing.enabled} onCheckedChange={v => updateFinancing("enabled", v)} />
                  <Label>Con financiación (hipoteca)</Label>
                </div>
                {input.financing.enabled && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="% Financiación (LTV)" value={input.financing.ltvPct} onChange={v => updateFinancing("ltvPct", v)} suffix="%" tooltip="Porcentaje del precio financiado por el banco. El resto y todos los gastos de compra se pagan con capital propio." />
                    <Field label="Tipo de interés anual" value={input.financing.annualInterestRate} onChange={v => updateFinancing("annualInterestRate", v)} suffix="%" tooltip="Referencia 2026: hipotecas fijas ~2.5-3.5%; variables a Euríbor 12m + margen ~0.9-1.2%." />
                    <Field label="Plazo" value={input.financing.termYears} onChange={v => updateFinancing("termYears", v)} suffix="años" />
                    <div className="space-y-1">
                      <Label className="text-sm">Tipo de hipoteca</Label>
                      <Select value={input.financing.type} onValueChange={v => updateFinancing("type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fijo</SelectItem>
                          <SelectItem value="variable">Variable (Euríbor)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:col-span-2">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Cuota mensual</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(monthlyMortgagePayment(resolvedInput.financing.mortgageAmount, input.financing.annualInterestRate, input.financing.termYears), input.currency)}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Desembolso inicial</p>
                        <p className="text-lg font-bold text-foreground">{formatCurrency(kpis.cashInvested, input.currency)}</p>
                      </div>
                    </div>
                    <FooterRow>
                      <>
                        Préstamo: <FooterValue>{formatCurrency(resolvedInput.financing.mortgageAmount, input.currency)}</FooterValue>
                        {" · "}Entrada: <FooterValue>{formatCurrency(resolvedInput.financing.downPayment, input.currency)}</FooterValue>
                      </>
                    </FooterRow>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Rental */}
            {activeStep === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Alquiler mensual" value={input.rental.monthlyRent} onChange={v => updateRental("monthlyRent", v)} suffix={sym} />
                <Field label="Otros ingresos al mes" value={input.rental.otherMonthlyIncome} onChange={v => updateRental("otherMonthlyIncome", v)} suffix={sym} tooltip="Parking, trastero, almacén…" />
                <Field label="Meses ocupado/año" value={input.rental.rentedMonthsPerYear} onChange={v => updateRental("rentedMonthsPerYear", v)} placeholder="12" tooltip="Meses reales con inquilino (p.ej. 11 si vacías 1 mes al cambiar de inquilino)" />
                <Field label="Tasa de vacancia" value={input.rental.vacancyRate} onChange={v => updateRental("vacancyRate", v)} suffix="%" tooltip="% adicional de días vacíos sobre los meses ocupados" />
                <Field label="Subida de alquiler anual" value={input.rental.annualRentGrowthPct} onChange={v => updateRental("annualRentGrowthPct", v)} suffix="%" tooltip="Revisión anual de la renta (ligada al IPC habitualmente)" />
                <FooterRow>
                  <>
                    Ingresos efectivos al año ({input.rental.rentedMonthsPerYear || 0} meses × alquiler y vacancia del {input.rental.vacancyRate}%): <FooterValue>{formatCurrency(kpis.effectiveAnnualIncome, input.currency)}</FooterValue>
                  </>
                </FooterRow>
              </div>
            )}

            {/* Step 3: Expenses */}
            {activeStep === 3 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Comunidad" value={input.expenses.communityFee} onChange={v => updateExpenses("communityFee", v)} suffix={`${sym}/mes`} tooltip="Cuota mensual de la comunidad de propietarios" />
                <Field label="IBI" value={input.expenses.ibi} onChange={v => updateExpenses("ibi", v)} suffix={`${sym}/año`} tooltip="Impuesto de Bienes Inmuebles (~0.4-1.1% del valor catastral)" />
                <Field label="Seguro del hogar" value={input.expenses.insurance} onChange={v => updateExpenses("insurance", v)} suffix={`${sym}/año`} />
                <Field label="Mantenimiento" value={input.expenses.maintenance} onChange={v => updateExpenses("maintenance", v)} suffix={`${sym}/año`} />
                <Field label="Reparaciones" value={input.expenses.repairs} onChange={v => updateExpenses("repairs", v)} suffix={`${sym}/año`} tooltip="Roturas, averías y reparaciones imprevistas" />
                <Field label="Gestión inmobiliaria" value={input.expenses.propertyManagementPct} onChange={v => updateExpenses("propertyManagementPct", v)} suffix="% de la renta" tooltip="Comisión de agencia/gestor: típicamente 5-10% de la renta" />
                <Field label="Suministros" value={input.expenses.utilities} onChange={v => updateExpenses("utilities", v)} suffix={`${sym}/mes`} tooltip="Luz, agua, gas… solo si los paga el propietario" />
                <Field label="Otros impuestos" value={input.expenses.otherTaxes} onChange={v => updateExpenses("otherTaxes", v)} suffix={`${sym}/año`} />
                <Field label="Otros gastos" value={input.expenses.otherExpenses} onChange={v => updateExpenses("otherExpenses", v)} suffix={`${sym}/año`} />
                <FooterRow>
                  <>Gastos operativos al año: <FooterValue>{formatCurrency(kpis.annualOperatingExpenses, input.currency)}</FooterValue></>
                </FooterRow>
              </div>
            )}

            {/* Step 4: Assumptions */}
            {activeStep === 4 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Revalorización anual" value={input.appreciation.annualAppreciationPct} onChange={v => updateAppreciation("annualAppreciationPct", v)} suffix="%" tooltip="Crecimiento anual del valor del inmueble. Referencia orientativa: 2-4%/año en zonas urbanas a largo plazo." />
                <Field label="Horizonte de inversión" value={input.appreciation.investmentHorizonYears} onChange={v => updateAppreciation("investmentHorizonYears", v)} suffix="años" />
                <div className="col-span-full rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
                  Supuesto aplicado: los gastos operativos crecen un 2% anual (inflación) y la renta se revaloriza según el dato definido. El valor del inmueble se proyecta con la revalorización anual compuesta.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t">
              <Button variant="outline" size="sm" disabled={activeStep === 0} onClick={() => setActiveStep(s => Math.max(0, s - 1))}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={activeStep === steps.length - 1} onClick={() => setActiveStep(s => Math.min(steps.length - 1, s + 1))}>
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── KPI Dashboard ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KPICard
            label="ROI sobre Capital"
            value={formatPercent(kpis.yieldOnEquity)}
            icon={TrendingUp}
            tooltip="(Ingresos efectivos − gastos operativos − intereses de la hipoteca) / capital propio desembolsado × 100. Excluye la amortización de capital."
            color={kpis.yieldOnEquity >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Cap Rate"
            value={formatPercent(kpis.capRate)}
            icon={Building2}
            tooltip="NOI (renta − gastos operativos) / precio de compra × 100. Rendimiento operativo sin financiación."
          />
          <KPICard
            label="Cash Flow Mensual"
            value={`${formatCurrency(kpis.monthlyCashFlow, input.currency)}/mes`}
            icon={DollarSign}
            tooltip="(Ingresos efectivos − gastos operativos − cuota hipoteca completa) entre 12"
            color={kpis.monthlyCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Cash Flow Anual"
            value={`${formatCurrency(kpis.annualCashFlow, input.currency)}/año`}
            icon={Wallet}
            tooltip="Renta efectiva − gastos operativos − cuota hipoteca (intereses + capital)"
            color={kpis.annualCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Patrimonio / Año"
            value={`${formatCurrency(kpis.annualWealthCreated, input.currency)}/año`}
            icon={PiggyBank}
            tooltip="Cash flow del año + capital amortizado de la hipoteca. Patrimonio total generado cada año."
            color={kpis.annualWealthCreated >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Rentabilidad Bruta"
            value={formatPercent(kpis.grossYield)}
            icon={Percent}
            tooltip="Alquiler anual según los meses ocupados / precio de compra × 100"
          />
          <KPICard
            label="Rentabilidad Neta"
            value={formatPercent(kpis.netYield)}
            icon={Scale}
            tooltip="Ingresos efectivos − gastos operativos, sobre el coste total de la compra × 100"
          />
          <KPICard
            label="ROI Total"
            value={formatPercent(kpis.roi)}
            icon={BarChart3}
            tooltip="Beneficio total al final del horizonte / capital propio desembolsado × 100"
            color={kpis.roi >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Beneficio Total"
            value={formatCurrency(kpis.totalProfit, input.currency)}
            icon={TrendingUp}
            tooltip="Equity final + cash flow acumulado − capital propio desembolsado"
            color={kpis.totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Equity al final"
            value={formatCurrency(kpis.equity, input.currency)}
            icon={Landmark}
            tooltip="Valor del inmueble al final del horizonte − deuda hipotecaria pendiente"
          />
        </div>

        {/* ── Results tabs ── */}
        <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="amortization">Amortización</TabsTrigger>
            <TabsTrigger value="projection">Proyección</TabsTrigger>
            <TabsTrigger value="scenarios">Escenarios</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensibilidad</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Resumen de la Inversión</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <SummaryRow label="Precio de compra" value={formatCurrency(input.purchase.price, input.currency)} />
                  <SummaryRow label="Impuestos (ITP/AJD)" value={formatCurrency(input.purchase.taxes, input.currency)} />
                  <SummaryRow label="Notaría + registro + reforma" value={formatCurrency(input.purchase.purchaseExpenses + input.purchase.renovationCost + input.purchase.furnitureCost + input.purchase.otherInitialCost, input.currency)} />
                  <Separator />
                  <SummaryRow label="Coste total de la compra" value={formatCurrency(kpis.totalInvestment, input.currency)} strong />
                  {input.financing.enabled ? (
                    <>
                      <SummaryRow label="Capital propio desembolsado" value={formatCurrency(kpis.cashInvested, input.currency)} />
                      <SummaryRow label={`Hipoteca (LTV ${kpis.ltv.toFixed(0)}%)`} value={formatCurrency(kpis.totalInvestment - kpis.cashInvested, input.currency)} />
                    </>
                  ) : (
                    <SummaryRow label="Sin financiación" value="100% capital propio" />
                  )}
                  <Separator />
                  <SummaryRow
                    label={`Valor estimado al año ${input.appreciation.investmentHorizonYears}`}
                    value={formatCurrency(projection[projection.length - 1]?.propertyValue ?? input.purchase.price, input.currency)}
                  />
                  <SummaryRow label="Equity acumulado al final" value={formatCurrency(kpis.equity, input.currency)} positive={kpis.equity >= 0} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Reparto del Alquiler — Año 1</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <SummaryRow label="Ingresos efectivos" value={formatCurrency(kpis.effectiveAnnualIncome, input.currency)} />
                  <SummaryRow label="Gastos operativos" value={`-${formatCurrency(kpis.annualOperatingExpenses, input.currency)}`} />
                  <SummaryRow label="NOI (renta − gastos)" value={formatCurrency(kpis.noi, input.currency)} strong />
                  {input.financing.enabled && (
                    <>
                      <Separator />
                      <SummaryRow label="Cuota hipoteca" value={`-${formatCurrency(kpis.annualMortgage, input.currency)}/año`} />
                      <div className="pl-3 flex justify-between gap-2">
                        <span className="text-muted-foreground text-xs">↳ Intereses</span>
                        <span className="text-xs">{formatCurrency(kpis.annualInterestPaid, input.currency)}</span>
                      </div>
                      <div className="pl-3 flex justify-between gap-2">
                        <span className="text-muted-foreground text-xs">↳ Capital (tu patrimonio)</span>
                        <span className="text-xs text-emerald-600 font-medium">{formatCurrency(kpis.annualPrincipalPaid, input.currency)}</span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <SummaryRow label="Cash flow anual" value={formatCurrency(kpis.annualCashFlow, input.currency)} positive={kpis.annualCashFlow >= 0} />
                  <SummaryRow label="ROI sobre Capital" value={formatPercent(kpis.yieldOnEquity)} positive={kpis.yieldOnEquity >= 0} />
                  <SummaryRow label="Patrimonio generado / año" value={formatCurrency(kpis.annualWealthCreated, input.currency)} positive={kpis.annualWealthCreated >= 0} />
                  <SummaryRow label="Punto de equilibrio" value={kpis.breakevenMonths > 0 ? `${Math.round(kpis.breakevenMonths)} meses` : "No alcanzado"} />
                  {kpis.priceToRentRatio > 0 && (
                    <SummaryRow label="Años para pagar la casa (P/R)" value={`${kpis.priceToRentRatio.toFixed(1)} años`} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Charts ── */}
          <TabsContent value="charts">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Evolución: Valor, Equity y Deuda</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(Math.abs(v) / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Legend />
                      <Area type="monotone" dataKey="propertyValue" name="Valor propiedad" fill="#f59e0b" fillOpacity={0.15} stroke="#f59e0b" />
                      <Area type="monotone" dataKey="equity" name="Equity" fill="#10b981" fillOpacity={0.15} stroke="#10b981" />
                      <Area type="monotone" dataKey="debt" name="Deuda pendiente" fill="#ef4444" fillOpacity={0.1} stroke="#ef4444" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Cash Flow Anual</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(Math.abs(v) / 1000).toFixed(1)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Legend />
                      <Bar dataKey="cashFlow" name="Cash Flow" fill="#f59e0b" />
                      <Bar dataKey="cumulativeCF" name="Cash Flow Acumulado" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Ingresos vs Gastos</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(Math.abs(v) / 1000).toFixed(1)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Legend />
                      <Bar dataKey="income" name="Ingresos" fill="#10b981" fillOpacity={0.6} />
                      <Bar dataKey="expenses" name="Gastos operativos" fill="#f59e0b" fillOpacity={0.6} />
                      {input.financing.enabled && <Bar dataKey="financing" name="Cuota hipoteca" fill="#ef4444" fillOpacity={0.6} />}
                      <Line type="monotone" dataKey="cashFlow" name="Cash Flow" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Beneficio Acumulado</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(Math.abs(v) / 1000).toFixed(1)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Area type="monotone" dataKey="cumulativeCF" name="Cash Flow Acumulado" fill="#f59e0b" fillOpacity={0.2} stroke="#f59e0b" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Amortization ── */}
          <TabsContent value="amortization">
            {input.financing.enabled && amortSchedule.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tabla de Amortización (sistema francés)</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Cuota mensual {formatCurrency(monthlyMortgagePayment(resolvedInput.financing.mortgageAmount, input.financing.annualInterestRate, input.financing.termYears), input.currency)} · Préstamo {formatCurrency(resolvedInput.financing.mortgageAmount, input.currency)} · Plazo {input.financing.termYears} años
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Año</TableHead>
                          <TableHead>Deuda inicio</TableHead>
                          <TableHead>Pago anual</TableHead>
                          <TableHead>Capital amortizado</TableHead>
                          <TableHead>Intereses</TableHead>
                          <TableHead>Deuda fin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {amortSchedule.map(line => (
                          <TableRow key={line.year}>
                            <TableCell className="font-medium">{line.year}</TableCell>
                            <TableCell>{formatCurrency(line.openingBalance, input.currency)}</TableCell>
                            <TableCell>{formatCurrency(line.annualPayment, input.currency)}</TableCell>
                            <TableCell className="text-emerald-600">{formatCurrency(line.principalPaid, input.currency)}</TableCell>
                            <TableCell>{formatCurrency(line.interestPaid, input.currency)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(line.closingBalance, input.currency)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {input.appreciation.investmentHorizonYears < input.financing.termYears && (
                    <p className="text-xs text-muted-foreground mt-3">
                      La hipoteca continúa más allá del horizonte de {input.appreciation.investmentHorizonYears} años definido; la tabla muestra el plazo completo del préstamo.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Sin financiación — no hay tabla de amortización
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Projection ── */}
          <TabsContent value="projection">
            <Card>
              <CardHeader><CardTitle className="text-sm">Proyección Anual Detallada</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Año</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Ingresos</TableHead>
                        <TableHead>Gastos Op.</TableHead>
                        <TableHead>NOI</TableHead>
                        <TableHead>Cuota</TableHead>
                        <TableHead>Cash Flow</TableHead>
                        <TableHead>CF Acum.</TableHead>
                        <TableHead>Equity</TableHead>
                        <TableHead>Deuda</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projection.map(y => (
                        <TableRow key={y.year}>
                          <TableCell className="font-medium">{y.year}</TableCell>
                          <TableCell>{formatCurrency(y.propertyValue, input.currency)}</TableCell>
                          <TableCell>{formatCurrency(y.totalIncome, input.currency)}</TableCell>
                          <TableCell>{formatCurrency(y.operatingExpenses, input.currency)}</TableCell>
                          <TableCell className={y.netOperatingIncome >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(y.netOperatingIncome, input.currency)}</TableCell>
                          <TableCell>{formatCurrency(y.financingCosts, input.currency)}</TableCell>
                          <TableCell className={y.annualCashFlow >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{formatCurrency(y.annualCashFlow, input.currency)}</TableCell>
                          <TableCell className={y.cumulativeCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(y.cumulativeCashFlow, input.currency)}</TableCell>
                          <TableCell>{formatCurrency(y.equity, input.currency)}</TableCell>
                          <TableCell>{formatCurrency(y.remainingDebt, input.currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Scenarios ── */}
          <TabsContent value="scenarios">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Comparación de Escenarios — Año 1</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Métrica</TableHead>
                          {scenarios.map(s => (
                            <TableHead key={s.name} className="text-center">
                              <Badge variant={s.name === "Base" ? "default" : s.name === "Optimistic" ? "outline" : "secondary"}>{scenarioLabels[s.name] ?? s.name}</Badge>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {([
                          ["ROI sobre Capital", (r: ScenarioResult) => formatPercent(r.kpis.yieldOnEquity)],
                          ["Cap Rate", (r: ScenarioResult) => formatPercent(r.kpis.capRate)],
                          ["Cash Flow / mes", (r: ScenarioResult) => `${formatCurrency(r.kpis.monthlyCashFlow, input.currency)}/mes`],
                          ["Cash Flow / año", (r: ScenarioResult) => `${formatCurrency(r.kpis.annualCashFlow, input.currency)}/año`],
                          ["Patrimonio / año", (r: ScenarioResult) => `${formatCurrency(r.kpis.annualWealthCreated, input.currency)}/año`],
                          ["ROI Total", (r: ScenarioResult) => formatPercent(r.kpis.roi)],
                          ["Beneficio Total", (r: ScenarioResult) => formatCurrency(r.kpis.totalProfit, input.currency)],
                          ["Equity final", (r: ScenarioResult) => formatCurrency(r.kpis.equity, input.currency)],
                        ] as const).map(([label, fn]) => (
                          <TableRow key={label}>
                            <TableCell className="font-medium">{label}</TableCell>
                            {scenarios.map(s => (
                              <TableCell key={s.name} className="text-center text-sm">{fn(s)}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Evolución del Equity por Escenario</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={scenarioChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(Math.abs(v) / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Legend />
                      {scenarios.map(s => (
                        <Line key={s.name} type="monotone" dataKey={`${s.name}_equity`} name={scenarioLabels[s.name] ?? s.name} stroke={scenarioColors[s.name] ?? "#3b82f6"} strokeWidth={2} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Sensitivity ── */}
          <TabsContent value="sensitivity">
            <div className="space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="space-y-1">
                  <Label className="text-xs">Variable a analizar</Label>
                  <Select value={sensitivityVar} onValueChange={v => setSensitivityVar(v as typeof sensitivityVar)}>
                    <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Precio de compra</SelectItem>
                      <SelectItem value="rent">Alquiler mensual</SelectItem>
                      <SelectItem value="interestRate">Tipo de interés</SelectItem>
                      <SelectItem value="ltv">% Financiación (LTV)</SelectItem>
                      <SelectItem value="appreciation">Revalorización</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Análisis de Sensibilidad — {sensitivity.variableLabel}</CardTitle>
                  <p className="text-xs text-muted-foreground">Cómo cambia cada métrica al variar {sensitivity.variableLabel.toLowerCase()} entre −20% y +20%.</p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Métrica</TableHead>
                          {sensitivity.variations.map(v => (
                            <TableHead key={v} className="text-center">{v > 0 ? `+${v}%` : `${v}%`}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sensitivity.rows.map(row => (
                          <TableRow key={row.label}>
                            <TableCell className="font-medium">{row.label}</TableCell>
                            {row.values.map((val, i) => {
                              const isBase = sensitivity.variations[i] === 0
                              const isMonths = row.kind === "months"
                              return (
                                <TableCell
                                  key={i}
                                  className={`text-center text-sm ${isBase ? "font-bold bg-muted/50" : ""} ${!isMonths && val > 0 ? "text-emerald-600" : ""} ${!isMonths && val < 0 ? "text-red-600" : ""}`}
                                >
                                  {formatSensitivityValue(row.kind, val)}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Footer metrics strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Scale className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">ROI anualizado</p>
              <p className="font-semibold">{formatPercent(kpis.roiAnnualized)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Cash-on-cash</p>
              <p className="font-semibold">{formatPercent(kpis.cashOnCashReturn)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Landmark className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Años para pagarla (P/R)</p>
              <p className="font-semibold">{kpis.priceToRentRatio > 0 ? `${kpis.priceToRentRatio.toFixed(1)}` : "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <PiggyBank className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Intereses totales</p>
              <p className="font-semibold">{input.financing.enabled ? formatCurrency(amortSchedule.reduce((acc, l) => acc + l.interestPaid, 0), input.currency) : "—"}</p>
            </div>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed pt-4 border-t">
          Los resultados son estimaciones obtenidas a partir de los datos y supuestos introducidos (tipos, ITP, revalorización, gastos e inflación). La rentabilidad real de una inversión inmobiliaria depende de factores financieros, fiscales, de mercado y de la gestión del inmueble. Utiliza esta herramienta como referencia y contrasta los resultados con un profesional antes de decidir.
        </p>
      </div>
    </TooltipProvider>
  )
}
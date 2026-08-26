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
  Home, DollarSign, TrendingUp, Calculator, Building2, Percent,
  ArrowUpRight, ArrowDownRight, Info, Landmark, PiggyBank,
  BarChart3, Scale, Zap, ChevronRight, ChevronLeft,
} from "lucide-react"
import type {
  RealEstateInput,
  RealEstateKPIs,
  YearProjection,
  Currency,
  ScenarioResult,
} from "@/lib/calculators/real-estate-types"
import { totalInitialInvestment } from "@/lib/calculators/real-estate-types"
import {
  calculateKPIs,
  buildProjection,
  monthlyMortgagePayment,
  annualMortgagePayment,
} from "@/lib/calculators/real-estate-formulas"
import { runAllScenarios } from "@/lib/calculators/real-estate-scenarios"
import { analyzeSensitivity } from "@/lib/calculators/real-estate-sensitivity"
import { formatCurrency, formatPercent } from "@/lib/calculators/real-estate-format"

// ── Default input ─────────────────────────────────────
function defaultInput(): RealEstateInput {
  return {
    purchase: {
      price: 150_000,
      purchaseExpenses: 3_000,
      taxes: 12_000,
      renovationCost: 0,
      furnitureCost: 0,
      otherInitialCost: 0,
    },
    financing: {
      enabled: true,
      ltvPct: 70,
      mortgageAmount: 105_000,
      downPayment: 45_000,
      annualInterestRate: 3,
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
      communityFee: 50,
      ibi: 600,
      insurance: 300,
      maintenance: 500,
      repairs: 300,
      propertyManagementPct: 8,
      utilities: 0,
      otherTaxes: 0,
      otherExpenses: 200,
      variableExpensePct: 0,
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
  const inner = (
    <div className="space-y-1.5">
      <Label className="text-sm flex items-center gap-1">
        {label}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
  return inner
}

// ── KPI Card ──────────────────────────────────────────
function KPICard({
  label, value, icon: Icon, tooltip, color = "text-foreground",
}: {
  label: string
  value: string
  icon: React.ElementType
  tooltip: string
  color?: string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="relative overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
                <div className="p-2 rounded-full bg-muted">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ── Main Component ────────────────────────────────────
export default function AdvancedRealEstateCalculator() {
  const [input, setInput] = useState<RealEstateInput>(defaultInput)
  const [activeStep, setActiveStep] = useState(0)
  const [activeResultsTab, setActiveResultsTab] = useState("overview")
  const [sensitivityVar, setSensitivityVar] = useState<"price" | "rent" | "interestRate" | "ltv" | "appreciation">("price")
  const [sensitivityKpi, setSensitivityKpi] = useState<string>("roi")

  const sym = input.currency === "EUR" ? "€" : input.currency === "GBP" ? "£" : "$"

  // Recalculate mortgage when inputs change
  const resolvedInput = useMemo(() => {
    const inp = { ...input }
    if (inp.financing.enabled) {
      inp.financing.mortgageAmount = inp.purchase.price * inp.financing.ltvPct / 100
      inp.financing.downPayment = inp.purchase.price - inp.financing.mortgageAmount
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
    () => analyzeSensitivity(resolvedInput, sensitivityVar, [-20, -10, 0, 10, 20], sensitivityKpi as keyof RealEstateKPIs),
    [resolvedInput, sensitivityVar, sensitivityKpi],
  )

  const update = useCallback(<K extends keyof RealEstateInput>(key: K, val: RealEstateInput[K]) => {
    setInput(prev => ({ ...prev, [key]: val }))
  }, [])

  const updatePurchase = useCallback((key: keyof typeof input.purchase, val: string) => {
    setInput(prev => ({
      ...prev,
      purchase: { ...prev.purchase, [key]: p(val) },
    }))
  }, [])

  const updateFinancing = useCallback((key: keyof typeof input.financing, val: string | boolean) => {
    setInput(prev => ({
      ...prev,
      financing: { ...prev.financing, [key]: typeof val === "string" ? (key === "type" || key === "paymentFrequency" ? val : p(val)) : val },
    }))
  }, [])

  const updateRental = useCallback((key: keyof typeof input.rental, val: string) => {
    setInput(prev => ({
      ...prev,
      rental: { ...prev.rental, [key]: p(val) },
    }))
  }, [])

  const updateExpenses = useCallback((key: keyof typeof input.expenses, val: string) => {
    setInput(prev => ({
      ...prev,
      expenses: { ...prev.expenses, [key]: p(val) },
    }))
  }, [])

  const updateAppreciation = useCallback((key: keyof typeof input.appreciation, val: string) => {
    setInput(prev => ({
      ...prev,
      appreciation: { ...prev.appreciation, [key]: p(val) },
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
        const p = s.projection[i]
        if (p) {
          row[`${s.name}_equity`] = p.equity
          row[`${s.name}_cashFlow`] = p.cumulativeCashFlow
        }
      })
      return row
    })
  }, [scenarios])

  // Form steps
  const steps = [
    { label: "Compra", icon: Home },
    { label: "Financiación", icon: Landmark },
    { label: "Alquiler", icon: DollarSign },
    { label: "Gastos", icon: Receipt },
    { label: "Supuestos", icon: TrendingUp },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Currency selector ── */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Calculadora ROI Inmobiliario</h2>
          <Select value={input.currency} onValueChange={(v) => update("currency", v as Currency)}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR €</SelectItem>
              <SelectItem value="USD">USD $</SelectItem>
              <SelectItem value="GBP">GBP £</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Form ── */}
        <Card>
          <CardContent className="p-4">
            {/* Step navigation */}
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
                <Field label="Precio de compra" value={input.purchase.price} onChange={v => updatePurchase("price", v)} suffix={sym} tooltip="Precio de venta del inmueble" />
                <Field label="Gastos de compra" value={input.purchase.purchaseExpenses} onChange={v => updatePurchase("purchaseExpenses", v)} suffix={sym} tooltip="Notaría, registro, gestoría" rightText={input.purchase.price > 0 ? `${((input.purchase.purchaseExpenses / input.purchase.price) * 100).toFixed(1)}%` : ""} />
                <Field label="Impuestos" value={input.purchase.taxes} onChange={v => updatePurchase("taxes", v)} suffix={sym} tooltip="ITP / AJD / IVA" rightText={input.purchase.price > 0 ? `${((input.purchase.taxes / input.purchase.price) * 100).toFixed(1)}%` : ""} />
                <Field label="Reforma" value={input.purchase.renovationCost} onChange={v => updatePurchase("renovationCost", v)} suffix={sym} />
                <Field label="Mobiliario" value={input.purchase.furnitureCost} onChange={v => updatePurchase("furnitureCost", v)} suffix={sym} />
                <Field label="Otros costes" value={input.purchase.otherInitialCost} onChange={v => updatePurchase("otherInitialCost", v)} suffix={sym} />
                <div className="col-span-full pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Inversión inicial total: <span className="font-bold text-foreground">{formatCurrency(totalInitialInvestment(input.purchase), input.currency)}</span></p>
                </div>
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
                    <Field label="% Financiación (LTV)" value={input.financing.ltvPct} onChange={v => updateFinancing("ltvPct", v)} suffix="%" tooltip="Porcentaje del precio financiado" />
                    <Field label="Tipo de interés" value={input.financing.annualInterestRate} onChange={v => updateFinancing("annualInterestRate", v)} suffix="%" tooltip="TAE nominal" />
                    <Field label="Plazo" value={input.financing.termYears} onChange={v => updateFinancing("termYears", v)} suffix="años" />
                    <div className="space-y-1">
                      <Label className="text-sm">Tipo</Label>
                      <Select value={input.financing.type} onValueChange={v => updateFinancing("type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fijo</SelectItem>
                          <SelectItem value="variable">Variable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Periodicidad</Label>
                      <Select value={input.financing.paymentFrequency} onValueChange={v => updateFinancing("paymentFrequency", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-full pt-2 border-t space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Cuota mensual: <span className="font-bold text-foreground">{formatCurrency(monthlyMortgagePayment(input.financing.mortgageAmount, input.financing.annualInterestRate, input.financing.termYears), input.currency)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Importe préstamo: <span className="font-bold text-foreground">{formatCurrency(input.financing.mortgageAmount, input.currency)}</span> ·
                        Entrada: <span className="font-bold text-foreground">{formatCurrency(input.financing.downPayment, input.currency)}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Rental */}
            {activeStep === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Alquiler mensual" value={input.rental.monthlyRent} onChange={v => updateRental("monthlyRent", v)} suffix={sym} />
                <Field label="Otros ingresos mensuales" value={input.rental.otherMonthlyIncome} onChange={v => updateRental("otherMonthlyIncome", v)} suffix={sym} />
                <Field label="Meses alquilados/año" value={input.rental.rentedMonthsPerYear} onChange={v => updateRental("rentedMonthsPerYear", v)} placeholder="12" />
                <Field label="Tasa de vacancia" value={input.rental.vacancyRate} onChange={v => updateRental("vacancyRate", v)} suffix="%" tooltip="Porcentaje estimado de días vacíos" />
                <Field label="Crecimiento anual alquiler" value={input.rental.annualRentGrowthPct} onChange={v => updateRental("annualRentGrowthPct", v)} suffix="%" tooltip="Crecimiento anual esperado del alquiler" />
                <div className="col-span-full pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Ingresos anuales efectivos: <span className="font-bold text-foreground">{formatCurrency(kpis.effectiveAnnualIncome, input.currency)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Expenses */}
            {activeStep === 3 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="IBI" value={input.expenses.ibi} onChange={v => updateExpenses("ibi", v)} suffix={`${sym}/año`} rightText={input.purchase.price > 0 ? `${((input.expenses.ibi / input.purchase.price) * 100).toFixed(2)}%` : ""} />
                <Field label="Mantenimiento" value={input.expenses.maintenance} onChange={v => updateExpenses("maintenance", v)} suffix={`${sym}/año`} />
                <Field label="Gestión inmobiliaria" value={input.expenses.propertyManagementPct} onChange={v => updateExpenses("propertyManagementPct", v)} suffix="% ingresos" tooltip="% sobre ingresos brutos de alquiler" />
                <div className="col-span-full pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Gastos operativos anuales: <span className="font-bold text-foreground">{formatCurrency(kpis.annualOperatingExpenses, input.currency)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Assumptions */}
            {activeStep === 4 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Revalorización anual" value={input.appreciation.annualAppreciationPct} onChange={v => updateAppreciation("annualAppreciationPct", v)} suffix="%" tooltip="Crecimiento anual estimado del valor del inmueble" />
                <Field label="Horizonte de inversión" value={input.appreciation.investmentHorizonYears} onChange={v => updateAppreciation("investmentHorizonYears", v)} suffix="años" />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t">
              <Button variant="outline" size="sm" disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={activeStep === steps.length - 1} onClick={() => setActiveStep(s => s + 1)}>
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── KPI Dashboard ── */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          <KPICard
            label="ROI Total"
            value={formatPercent(kpis.roi)}
            icon={TrendingUp}
            tooltip={`Beneficio total / Capital propio invertido × 100 = ${kpis.roi.toFixed(1)}%`}
            color={kpis.roi >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="ROI Anualizado"
            value={formatPercent(kpis.roiAnnualized)}
            icon={BarChart3}
            tooltip="ROI compuesto anualizado sobre el horizonte de inversión"
            color={kpis.roiAnnualized >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Cap Rate"
            value={formatPercent(kpis.capRate)}
            icon={Building2}
            tooltip="NOI / Valor propiedad × 100. Rendimiento operativo sin financiación."
          />
          <KPICard
            label="Cash-on-Cash"
            value={formatPercent(kpis.cashOnCashReturn)}
            icon={PiggyBank}
            tooltip="Cash flow anual / Capital propio invertido × 100"
          />
          <KPICard
            label="Cash Flow Mensual"
            value={formatCurrency(kpis.monthlyCashFlow, input.currency)}
            icon={DollarSign}
            tooltip="Ingresos - gastos operativos - financiación, dividido entre 12"
            color={kpis.monthlyCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Rentabilidad Bruta"
            value={formatPercent(kpis.grossYield)}
            icon={Percent}
            tooltip="Ingresos brutos anuales alquiler / Precio compra × 100"
          />
          <KPICard
            label="Rentabilidad Neta"
            value={formatPercent(kpis.netYield)}
            icon={Scale}
            tooltip="Ingresos netos anuales / Inversión total × 100"
          />
          <KPICard
            label="Cash Flow Anual"
            value={formatCurrency(kpis.annualCashFlow, input.currency)}
            icon={DollarSign}
            tooltip="NOI - costes financieros"
            color={kpis.annualCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Beneficio Total"
            value={formatCurrency(kpis.totalProfit, input.currency)}
            icon={TrendingUp}
            tooltip="Equity final + cash flow acumulado - capital propio invertido"
            color={kpis.totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}
          />
          <KPICard
            label="Equity"
            value={formatCurrency(kpis.equity, input.currency)}
            icon={Landmark}
            tooltip="Valor propiedad - deuda pendiente al final del horizonte"
          />
        </div>

        {/* ── Results tabs ── */}
        <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab}>
          <TabsList>
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
                <CardHeader><CardTitle className="text-sm">Resumen de Inversión</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Precio compra</span><span>{formatCurrency(input.purchase.price, input.currency)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gastos + impuestos</span><span>{formatCurrency(input.purchase.purchaseExpenses + input.purchase.taxes, input.currency)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Reforma + mobiliario</span><span>{formatCurrency(input.purchase.renovationCost + input.purchase.furnitureCost + input.purchase.otherInitialCost, input.currency)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold"><span>Inversión total</span><span>{formatCurrency(kpis.totalInvestment, input.currency)}</span></div>
                  {input.financing.enabled && (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Entrada propia</span><span>{formatCurrency(kpis.totalInvestment - input.financing.mortgageAmount, input.currency)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Préstamo (LTV {kpis.ltv.toFixed(0)}%)</span><span>{formatCurrency(input.financing.mortgageAmount, input.currency)}</span></div>
                    </>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Métricas Clave — Año 1</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Ingresos efectivos</span><span>{formatCurrency(kpis.effectiveAnnualIncome, input.currency)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gastos operativos</span><span>{formatCurrency(kpis.annualOperatingExpenses, input.currency)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">NOI</span><span className="font-medium">{formatCurrency(kpis.noi, input.currency)}</span></div>
                  {input.financing.enabled && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Cuota hipoteca</span><span>{formatCurrency(kpis.annualMortgage, input.currency)}/año</span></div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Cash flow anual</span>
                    <span className={kpis.annualCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(kpis.annualCashFlow, input.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Punto de equilibrio</span>
                    <span>{kpis.breakevenMonths > 0 ? `${kpis.breakevenMonths.toFixed(0)} meses` : "No alcanzado"}</span>
                  </div>
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
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Legend />
                      <Area type="monotone" dataKey="propertyValue" name="Valor propiedad" fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" />
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
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Legend />
                      <Bar dataKey="cashFlow" name="Cash Flow" fill="#3b82f6" />
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
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Legend />
                      <Bar dataKey="income" name="Ingresos" fill="#10b981" fillOpacity={0.6} />
                      <Bar dataKey="expenses" name="Gastos operativos" fill="#f59e0b" fillOpacity={0.6} />
                      {input.financing.enabled && <Bar dataKey="financing" name="Financiación" fill="#ef4444" fillOpacity={0.6} />}
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
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Area type="monotone" dataKey="cumulativeCF" name="Cash Flow Acumulado" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Amortization ── */}
          <TabsContent value="amortization">
            {input.financing.enabled ? (
              <Card>
                <CardHeader><CardTitle className="text-sm">Tabla de Amortización</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Año</TableHead>
                          <TableHead>Saldo inicio</TableHead>
                          <TableHead>Pago anual</TableHead>
                          <TableHead>Capital</TableHead>
                          <TableHead>Intereses</TableHead>
                          <TableHead>Saldo cierre</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projection.map(y => (
                          <TableRow key={y.year}>
                            <TableCell>{y.year}</TableCell>
                            <TableCell>{formatCurrency(y.year === 1 ? input.financing.mortgageAmount : projection[y.year - 2].remainingDebt, input.currency)}</TableCell>
                            <TableCell>{formatCurrency(y.financingCosts, input.currency)}</TableCell>
                            <TableCell>{formatCurrency(
                              y.year === 1
                                ? input.financing.mortgageAmount - y.remainingDebt
                                : (projection[y.year - 2].remainingDebt - y.remainingDebt),
                              input.currency,
                            )}</TableCell>
                            <TableCell>{formatCurrency(
                              y.financingCosts - (y.year === 1
                                ? input.financing.mortgageAmount - y.remainingDebt
                                : projection[y.year - 2].remainingDebt - y.remainingDebt),
                              input.currency,
                            )}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(y.remainingDebt, input.currency)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
                        <TableHead>Financiación</TableHead>
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
                <CardHeader><CardTitle className="text-sm">Comparación de Escenarios — KPIs Año 1</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Métrica</TableHead>
                          {scenarios.map(s => (
                            <TableHead key={s.name} className="text-center">
                              <Badge variant={s.name === "Base" ? "default" : s.name === "Optimistic" ? "outline" : "secondary"}>{s.name}</Badge>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {([
                          ["Cap Rate", (s: ScenarioResult) => formatPercent(s.kpis.capRate)],
                          ["Cash-on-Cash", (s: ScenarioResult) => formatPercent(s.kpis.cashOnCashReturn)],
                          ["Cash Flow / mes", (s: ScenarioResult) => formatCurrency(s.kpis.monthlyCashFlow, input.currency)],
                          ["Cash Flow / año", (s: ScenarioResult) => formatCurrency(s.kpis.annualCashFlow, input.currency)],
                          ["ROI Total", (s: ScenarioResult) => formatPercent(s.kpis.roi)],
                          ["Beneficio Total", (s: ScenarioResult) => formatCurrency(s.kpis.totalProfit, input.currency)],
                          ["Equity final", (s: ScenarioResult) => formatCurrency(s.kpis.equity, input.currency)],
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
                <CardHeader><CardTitle className="text-sm">Evolución Equity por Escenario</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={scenarioChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                      <RechartsTooltip formatter={(v: number | undefined) => formatCurrency(v ?? 0, input.currency)} />
                      <Legend />
                      <Line type="monotone" dataKey="Conservative_equity" name="Conservador" stroke="#ef4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Base_equity" name="Base" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Optimistic_equity" name="Optimista" stroke="#10b981" strokeWidth={2} dot={false} />
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
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Precio de compra</SelectItem>
                      <SelectItem value="rent">Alquiler mensual</SelectItem>
                      <SelectItem value="interestRate">Tipo de interés</SelectItem>
                      <SelectItem value="ltv">% Financiación</SelectItem>
                      <SelectItem value="appreciation">Revalorización</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-sm">Análisis de Sensibilidad — {sensitivity.variableLabel}</CardTitle></CardHeader>
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
                              let display: string
                              if (["monthlyCashFlow", "annualCashFlow", "totalProfit"].includes(row.label.toLowerCase().replace(/[^a-z]/g, ""))) {
                                display = formatCurrency(val, input.currency)
                              } else if (row.label.includes("months") || row.label.includes("meses")) {
                                display = val > 0 ? `${val.toFixed(0)} mes` : "—"
                              } else {
                                display = formatPercent(val)
                              }
                              return (
                                <TableCell key={i} className={`text-center text-sm ${isBase ? "font-bold bg-muted/50" : ""} ${val > 0 && !row.label.includes("months") ? "text-emerald-600" : ""} ${val < 0 && !row.label.includes("months") ? "text-red-600" : ""}`}>
                                  {display}
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

        {/* ── Disclaimer ── */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed pt-4 border-t">
          Los resultados mostrados son aproximaciones obtenidas a partir de los datos introducidos y de los supuestos utilizados en el cálculo. La rentabilidad final de una inversión puede ser diferente debido a factores financieros, fiscales y de mercado. Utiliza esta herramienta como referencia y contrasta los resultados con un profesional antes de tomar una decisión de inversión.
        </p>
      </div>
    </TooltipProvider>
  )
}

// Receipt icon for expenses step
function Receipt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
      <path d="M14 8h-4"/><path d="M16 12h-6"/><path d="M10 16h-4"/>
    </svg>
  )
}

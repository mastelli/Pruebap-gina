"use client"

import { useMemo, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts"
import {
  Landmark,
  Percent,
  TrendingUp,
  Shield,
  Scale,
  Info,
  ReceiptText,
  Wallet,
  LineChart as LineChartIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { BondInput, BondResults, BondType, CouponFrequency, BondRating } from "@/lib/calculators/bond-formulas"
import { calculateBond } from "@/lib/calculators/bond-formulas"

const p = (v: string | number) => parseFloat(String(v)) || 0

const RATING_DEFAULT_PROB: Record<BondRating, string> = {
  AAA: "~0,1%/año",
  AA: "~0,35%/año",
  A: "~0,55%/año",
  BBB: "~1,2%/año",
  BB: "~5%/año",
  B: "~10%/año",
}

function KpiStat({
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
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
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

export function BondCalculator() {
  const [bondType, setBondType] = useState<BondType>("government")
  const [faceValue, setFaceValue] = useState("1000")
  const [couponRate, setCouponRate] = useState("3.5")
  const [price, setPrice] = useState("980")
  const [maturity, setMaturity] = useState("10")
  const [frequency, setFrequency] = useState<CouponFrequency>("annual")
  const [rating, setRating] = useState<BondRating>("AA")
  const [govRef, setGovRef] = useState("3")

  const results: BondResults = useMemo(() => {
    const input: BondInput = {
      bondType,
      faceValue: p(faceValue),
      couponRatePct: p(couponRate),
      price: p(price),
      maturityYears: Math.max(1, p(maturity)),
      frequency,
      rating,
      govReferenceYieldPct: p(govRef),
    }
    return calculateBond(input)
  }, [bondType, faceValue, couponRate, price, maturity, frequency, rating, govRef])

  const priceValue = p(price)
  const premiumBadge = results.premiumDiscount === "premium"
    ? <Badge className="bg-emerald-600">{`Prima ${(results.priceToParPct - 100).toFixed(1)}%`}</Badge>
    : results.premiumDiscount === "discount"
      ? <Badge className="bg-red-600">{`Descuento ${(100 - results.priceToParPct).toFixed(1)}%`}</Badge>
      : <Badge variant="secondary">A la par</Badge>

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Hero ── */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Calculadora de Bonos</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mt-1 text-foreground">
            {bondType === "government" ? "Bono Gubernamental" : "Bono Corporativo"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            Calcula el yield, la TIR (YTM), la duración y el spread de tu bono {bondType === "government" ? "soberano" : "corporativo"}, o compáralo con la deuda pública.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mt-6">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">TIR / YTM</p>
              <p className="text-lg font-bold text-foreground">{results.ytmPct.toFixed(2)}%</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Yield corriente</p>
              <p className="text-lg font-bold text-foreground">{results.currentYieldPct.toFixed(2)}%</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Precio actual</p>
              <p className="text-lg font-bold text-foreground flex items-center gap-2">
                {formatCurrency(priceValue)}
                {premiumBadge}
              </p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs text-muted-foreground">Duración (Macaulay)</p>
              <p className="text-lg font-bold text-foreground">{results.macaulayDurationYears.toFixed(1)} años</p>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Datos del bono</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Tipo de bono</Label>
                <Select value={bondType} onValueChange={(v) => setBondType(v as BondType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Gubernamental</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Valor nominal (€)</Label>
                <Input type="number" value={faceValue} onChange={(e) => setFaceValue(e.target.value)} min={0} />
              </div>
              <div>
                <Label className="text-sm">Cupón nominal (%/año)</Label>
                <Input type="number" value={couponRate} onChange={(e) => setCouponRate(e.target.value)} min={0} step={0.1} />
              </div>
              <div>
                <Label className="text-sm">Precio de mercado (€)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0} />
              </div>
              <div>
                <Label className="text-sm">Años hasta vencimiento</Label>
                <Input type="number" value={maturity} onChange={(e) => setMaturity(e.target.value)} min={1} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Frecuencia de cupones</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as CouponFrequency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Anual</SelectItem>
                    <SelectItem value="semiannual">Semestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bondType === "corporate" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm flex items-center gap-1">
                      Rendimiento soberano comparable (%)
                      <Tooltip>
                        <TooltipTrigger type="button"><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">Rendimiento del bono gubernamental del mismo plazo (p.ej. bono español a 10 años) para calcular la prima de riesgo del bono corporativo.</TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input type="number" value={govRef} onChange={(e) => setGovRef(e.target.value)} min={0} step={0.1} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Rating crediticio</Label>
                    <Select value={rating} onValueChange={(v) => setRating(v as BondRating)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AAA">AAA</SelectItem>
                        <SelectItem value="AA">AA</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="BBB">BBB</SelectItem>
                        <SelectItem value="BB">BB</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Prob. de impago estimada: {RATING_DEFAULT_PROB[rating]}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiStat label="Cupón anual" value={`${formatCurrency(results.couponPerYear)}/año`} icon={ReceiptText} tooltip="Cupón nominal × valor nominal" />
          <KpiStat label="Yield corriente" value={`${results.currentYieldPct.toFixed(2)}%`} icon={Percent} tooltip="Cupón anual / precio de mercado × 100. El rendimiento efectivo que cobras cada año." />
          <KpiStat label="TIR (YTM)" value={`${results.ytmPct.toFixed(2)}%`} icon={TrendingUp} tooltip="Tasa interna de retorno si mantienes el bono hasta vencimiento incluyendo cupones, prima o descuento y devolución del nominal." color={results.ytmPct >= 0 ? "text-emerald-600" : "text-red-600"} />
          <KpiStat label="Duración Modificada" value={`${results.modifiedDurationYears.toFixed(2)} años`} icon={Scale} tooltip="Sensibilidad del precio ante cambios del 1% en el TIR. A mayor duración, más volatilidad." />
          <KpiStat label="Precio (% nominal)" value={`${results.priceToParPct.toFixed(1)}%`} icon={LineChartIcon} tooltip="Precio de mercado en porcentaje sobre el valor nominal. 100% = a la par." />
          <KpiStat label="Rentabilidad total" value={`${results.totalReturnPct.toFixed(1)}%`} icon={Wallet} tooltip="(Cupones totales + nominal − precio pagado) / precio × 100, hasta vencimiento." color={results.totalReturnPct >= 0 ? "text-emerald-600" : "text-red-600"} />
          <KpiStat label="Beneficio / (pérdida)" value={formatCurrency(results.totalProfit)} icon={Scale} tooltip="Cupones recibidos + valor nominal − precio de mercado pagado." color={results.totalProfit >= 0 ? "text-emerald-600" : "text-red-600"} />
          {results.creditSpreadPct !== null ? (
            <KpiStat label="Prima de riesgo (spread)" value={`${results.creditSpreadPct.toFixed(2)} p.p.`} icon={Shield} tooltip="TIR del bono − rendimiento del bono soberano comparable. Compensa el riesgo de impago." color={results.creditSpreadPct >= 0 ? "text-emerald-600" : "text-red-600"} />
          ) : (
            <KpiStat label="Soberano" value="Sin riesgo empresa" icon={Shield} tooltip="Los bonos gubernamentales se consideran libres de riesgo de impago para este análisis." />
          )}
          {results.expectedDefaultPct !== null && (
            <KpiStat label="Pérdida esperada (rating)" value={`${results.expectedDefaultPct.toFixed(2)}%/año`} icon={Shield} tooltip="Probabilidad de impago anual del rating × (1 − tasa de recuperación 40%). Estimación orientativa." color="text-amber-600" />
          )}
        </div>

        {/* ── Corporate spread summary ── */}
        {bondType === "corporate" && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Análisis comparado</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <SummaryRow label="TIR del bono corporativo" value={`${results.ytmPct.toFixed(2)}%`} strong />
                <SummaryRow label="Rendimiento soberano comparable" value={`${p(govRef).toFixed(2)}%`} />
                <Separator />
                <SummaryRow label="Prima de riesgo (spread)" value={`${results.creditSpreadPct?.toFixed(2)} p.p.`} strong positive={(results.creditSpreadPct ?? 0) >= 0} />
              </div>
              <div className="space-y-2">
                <SummaryRow label="Rating" value={rating} strong />
                <SummaryRow label="Prob. impago anual estimada" value={RATING_DEFAULT_PROB[rating]} />
                <SummaryRow label="Pérdida esperada anual" value={`${results.expectedDefaultPct?.toFixed(2)}%`} />
                <SummaryRow label="Rendimiento neto estimado" value={`${(results.ytmPct - (results.expectedDefaultPct ?? 0)).toFixed(2)}%`} strong />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Cash flow table ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Flujos de caja hasta vencimiento</CardTitle>
            <p className="text-xs text-muted-foreground">
              {results.numPeriods} pagos de {formatCurrency(results.couponPerPeriod)} ({frequency === "semiannual" ? "semestral" : "anual"}) + nominal al final.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Cupón</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Valor actual (TIR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.cashFlows.map((cf, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{cf.year}</TableCell>
                      <TableCell>{formatCurrency(cf.coupon)}</TableCell>
                      <TableCell>{cf.principal > 0 ? formatCurrency(cf.principal) : "—"}</TableCell>
                      <TableCell>{formatCurrency(cf.total)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(cf.discounted)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              El valor actual suma el precio de mercado pagado: {formatCurrency(priceValue)}.
            </p>
          </CardContent>
        </Card>

        {/* ── Price / yield chart ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sensibilidad: Precio frente a TIR</CardTitle>
            <p className="text-xs text-muted-foreground">Cómo cambia el precio del bono al variar el rendimiento exigido.</p>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.priceSensitivity}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="ytmPct" tick={{ fontSize: 11 }} label={{ value: "TIR (%)", position: "insideBottom", offset: -5 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [formatCurrency(value), name === "price" ? "Precio" : "TIR"]}
                    labelFormatter={(label) => `TIR ${label}%`}
                  />
                  <Line type="monotone" dataKey="price" name="price" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── Disclaimer ── */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed pt-4 border-t">
          Resultados orientativos basados en los datos introducidos: el TIR (YTM) se resuelve con la estructura temporal de los flujos, la duración usa el modelo de Macaulay y el spread se compara contra el rendimiento soberano indicado. El riesgo de impago por rating es una estimación histórica aproximada. Contrasta los resultados con un profesional antes de invertir.
        </p>
      </div>
    </TooltipProvider>
  )
}

function formatCurrency(v: number): string {
  return v.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  fmtDelta,
  fmtEuro,
  fmtNum,
  ND,
  pct,
  type Derived,
  type DiagnosisFlag,
  type RiskLevel,
} from "./debt-engine"

function KpiCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string
  value: string
  delta?: number | null
  hint?: string
}) {
  const showDelta = delta !== undefined && delta !== null && Math.abs(delta) > 1e-9
  const deltaColor = delta !== undefined && delta !== null && delta < 0 ? "text-destructive" : "text-green-600"
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
        {showDelta && (
          <p className={`text-xs font-medium ${deltaColor}`}>vs actual: {fmtDelta(delta)}</p>
        )}
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

const RISK_META: Record<RiskLevel, { label: string; cls: string }> = {
  green: { label: "Riesgo controlado", cls: "bg-green-600" },
  amber: { label: "Riesgo moderado", cls: "bg-amber-500" },
  red: { label: "Riesgo alto", cls: "bg-destructive" },
}

export function Kpis({
  base,
  scenario,
  flags,
}: {
  base: Derived
  scenario: Derived
  flags: DiagnosisFlag[]
}) {
  const risk = flags.some((f) => f.severity === "critical")
    ? "red"
    : flags.some((f) => f.severity === "warning")
      ? "amber"
      : "green"

  const meta = RISK_META[risk as RiskLevel]

  const d = (k: keyof Derived) => {
    const b = base[k]
    const s = scenario[k]
    if (typeof b !== "number" || typeof s !== "number") return null
    if (b === null || s === null) return null
    return s - b
  }

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between rounded-lg px-4 py-3 text-white ${meta.cls}`}>
        <span className="text-sm font-semibold">Semáforo de riesgo: {meta.label}</span>
        <Badge variant="outline" className="border-white/40 text-white">
          {flags.filter((f) => f.severity === "critical").length} críticas ·{" "}
          {flags.filter((f) => f.severity === "warning").length} avisos
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Activo total" value={fmtEuro(scenario.activoTotal)} delta={d("activoTotal")} />
        <KpiCard label="Pasivo total" value={fmtEuro(scenario.pasivoTotal)} delta={d("pasivoTotal")} />
        <KpiCard label="Patrimonio neto" value={fmtEuro(scenario.patrimonioNeto)} delta={d("patrimonioNeto")} />
        <KpiCard label="Capital circulante" value={fmtEuro(scenario.capitalCirculante)} delta={d("capitalCirculante")} />
        <KpiCard label="Capacidad de pago" value={scenario.capacidadDePago === null ? ND : `${fmtNum(scenario.capacidadDePago, 1)} meses`} delta={d("capacidadDePago")} hint="Cobertura de servicio de deuda" />

        <KpiCard label="Liquidez (AC/PC)" value={scenario.liquidez === null ? ND : fmtNum(scenario.liquidez)} delta={d("liquidez")} />
        <KpiCard label="Solvencia (A/P)" value={scenario.solvencia === null ? ND : fmtNum(scenario.solvencia)} delta={d("solvencia")} />
        <KpiCard label="Endeudamiento" value={scenario.endeudamiento === null ? ND : pct(scenario.endeudamiento)} delta={d("endeudamiento")} />
        <KpiCard label="Peso ANC" value={scenario.pesoANC === null ? ND : pct(scenario.pesoANC)} delta={d("pesoANC")} />
        <KpiCard label="Cobertura PC" value={scenario.coberturaPC === null ? ND : fmtNum(scenario.coberturaPC)} delta={d("coberturaPC")} />
      </div>
    </div>
  )
}

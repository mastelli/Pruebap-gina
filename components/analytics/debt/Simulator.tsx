"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fmtEuro, type SimulatorState } from "./debt-engine"

const INCOME_LOSS_STEPS = [0, 0.2, 0.5]
const RATE_RISE_STEPS = [0, 0.01, 0.02]

export function Simulator({
  sim,
  onSimChange,
  monthlySavings,
  onMonthlySavingsChange,
}: {
  sim: SimulatorState
  onSimChange: (sim: SimulatorState) => void
  monthlySavings: number
  onMonthlySavingsChange: (v: number) => void
}) {
  const incomeIdx = INCOME_LOSS_STEPS.indexOf(sim.incomeLoss)
  const rateIdx = RATE_RISE_STEPS.indexOf(sim.rateRise)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulador "¿Qué pasa si...?"</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Pérdida de ingresos</Label>
            <span className="text-sm font-semibold">
              {sim.incomeLoss === 0 ? "0%" : `−${sim.incomeLoss * 100}%`}
            </span>
          </div>
          <Slider
            min={0}
            max={INCOME_LOSS_STEPS.length - 1}
            step={1}
            value={[incomeIdx === -1 ? 0 : incomeIdx]}
            onValueChange={([v]) => onSimChange({ ...sim, incomeLoss: INCOME_LOSS_STEPS[v] })}
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>0%</span>
            <span>−20%</span>
            <span>−50%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Subida de tipos</Label>
            <span className="text-sm font-semibold">
              {sim.rateRise === 0 ? "0%" : `+${sim.rateRise * 100}%`}
            </span>
          </div>
          <Slider
            min={0}
            max={RATE_RISE_STEPS.length - 1}
            step={1}
            value={[rateIdx === -1 ? 0 : rateIdx]}
            onValueChange={([v]) => onSimChange({ ...sim, rateRise: RATE_RISE_STEPS[v] })}
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>0%</span>
            <span>+1%</span>
            <span>+2%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Gasto imprevisto</Label>
          <div className="flex items-center gap-2">
            <Slider
              min={0}
              max={20000}
              step={500}
              value={[sim.unexpectedExpense]}
              onValueChange={([v]) => onSimChange({ ...sim, unexpectedExpense: v })}
            />
            <span className="w-24 text-right text-sm font-semibold tabular-nums">
              {fmtEuro(sim.unexpectedExpense)}
            </span>
          </div>
        </div>

        <div className="space-y-1 border-t pt-4">
          <Label htmlFor="monthly-savings">Ahorro mensual estimado (para proyección)</Label>
          <Input
            id="monthly-savings"
            type="number"
            value={monthlySavings || ""}
            placeholder="Ej. 500"
            onChange={(e) => onMonthlySavingsChange(parseFloat(e.target.value) || 0)}
          />
          <p className="text-[11px] text-muted-foreground">
            Usado solo para la proyección a 6/12 meses del gráfico de evolución.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

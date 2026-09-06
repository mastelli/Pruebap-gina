"use client"

import type { ReactNode } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtEuro, ND, type Derived, type Item, type ProjectionPoint } from "./debt-engine"

const PALETTE = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"]

const tooltipStyle = {
  backgroundColor: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: 12,
}

function ChartCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        <div style={{ height: 280 }}>{children}</div>
      </CardContent>
    </Card>
  )
}

function Empty() {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin datos (N/D)</div>
}

function pieData(items: Item[], cats: Item["category"][]) {
  const out = items
    .filter((i) => cats.includes(i.category) && i.value > 0)
    .map((i) => ({ name: i.name || cats.find((c) => c === i.category) || "Sin nombre", value: i.value }))
  return out
}

export function DebtCharts({
  d,
  items,
  projection,
  months,
  onMonthsChange,
}: {
  d: Derived
  items: Item[]
  projection: ProjectionPoint[]
  months: number
  onMonthsChange: (m: number) => void
}) {
  const principalData = [
    {
      name: "Balance",
      Activo: Math.round(d.activoTotal),
      Pasivo: Math.round(d.pasivoTotal),
      "Patrimonio Neto": Math.round(d.patrimonioNeto),
    },
  ]
  const acAnc = [
    { name: "Activos", "Corriente (AC)": Math.round(d.AC), "No corriente (ANC)": Math.round(d.ANC) },
  ]
  const pcPnc = [
    { name: "Pasivos", "Corriente (PC)": Math.round(d.PC), "No corriente (PNC)": Math.round(d.PNC) },
  ]

  const assetPie = pieData(items, ["AC", "ANC"])
  const liabPie = pieData(items, ["PC", "PNC"])

  const balanceOk =
    Math.abs(d.activoTotal - (d.pasivoTotal + d.patrimonioNeto)) < 1

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Activo vs Pasivo + Patrimonio Neto"
        action={
          <span className={`text-xs ${balanceOk ? "text-green-600" : "text-destructive"}`}>
            {balanceOk ? "Activo = Pasivo + Patrimonio Neto ✓" : "Descuadre"}
          </span>
        }
      >
        {d.activoTotal <= 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={principalData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} className="text-xs" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtEuro(v)} />
              <Legend />
              <Bar dataKey="Activo" fill="#2563eb" />
              <Bar dataKey="Pasivo" stackId="a" fill="#dc2626" />
              <Bar dataKey="Patrimonio Neto" stackId="a" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Activo corriente vs no corriente">
        {d.activoTotal <= 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={acAnc}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} className="text-xs" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtEuro(v)} />
              <Legend />
              <Bar dataKey="Corriente (AC)" fill="#2563eb" />
              <Bar dataKey="No corriente (ANC)" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Pasivo corriente vs no corriente">
        {d.pasivoTotal <= 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pcPnc}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} className="text-xs" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtEuro(v)} />
              <Legend />
              <Bar dataKey="Corriente (PC)" fill="#dc2626" />
              <Bar dataKey="No corriente (PNC)" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Composición de activos">
        {assetPie.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={assetPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {assetPie.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtEuro(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Composición de pasivos">
        {liabPie.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={liabPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {liabPie.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtEuro(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="Evolución (Patrimonio Neto, Balance, Liquidez)"
        action={
          <Tabs value={String(months)} onValueChange={(v) => onMonthsChange(Number(v))}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="6">6 meses</TabsTrigger>
              <TabsTrigger value="12">12 meses</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        {projection.length === 0 || (d.activoTotal <= 0 && d.pasivoTotal <= 0) ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" tickFormatter={(v) => `${v}m`} />
              <YAxis yAxisId="left" tickFormatter={(v) => `${Math.round(v / 1000)}k`} className="text-xs" />
              {d.PC > 0 && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => (v === null ? ND : v.toFixed(1))}
                  className="text-xs"
                />
              )}
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number, n: string) =>
                  n === "Liquidez" ? (v === null ? ND : v.toFixed(2)) : fmtEuro(v)
                }
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="patrimonioNeto" name="Patrimonio Neto" stroke="#16a34a" strokeWidth={2} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="deuda" name="Balance" stroke="#dc2626" strokeWidth={2} dot={false} />
              {d.PC > 0 && (
                <Line yAxisId="right" type="monotone" dataKey="liquidez" name="Liquidez" stroke="#2563eb" strokeWidth={2} dot={false} connectNulls />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  )
}

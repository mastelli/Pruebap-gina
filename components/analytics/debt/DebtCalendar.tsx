"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fmtEuro, daysUntil, type Item } from "./debt-engine"

export function DebtCalendar({ items }: { items: Item[] }) {
  const withDates = items
    .filter((i) => i.dueDate && daysUntil(i.dueDate) !== null)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  // Detectar concentración por mes.
  const byMonth = new Map<string, number>()
  for (const i of withDates) {
    const d = new Date(i.dueDate!)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    byMonth.set(key, (byMonth.get(key) ?? 0) + i.value)
  }
  const concentratedMonths = new Set(
    [...byMonth.entries()].filter(([, amount]) => amount > 0).map(([k]) => k),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de balances y vencimientos</CardTitle>
      </CardHeader>
      <CardContent>
        {withDates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay vencimientos registrados (N/D).</p>
        ) : (
          <div className="space-y-2">
            {withDates.map((i) => {
              const days = daysUntil(i.dueDate)!
              const months = (days / 30).toFixed(1)
              const d = new Date(i.dueDate!)
              const dateLabel = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
              const isSoon = days <= 90
              const isUrgent = days <= 30
              const dm = `${d.getFullYear()}-${d.getMonth()}`
              const concentrated = concentratedMonths.has(dm)
              return (
                <div
                  key={i.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 ${
                    isUrgent ? "border-destructive bg-destructive/5" : isSoon ? "border-amber-400 bg-amber-50" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">{i.name || "Sin nombre"}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateLabel} · Interés {i.interest || 0}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">{fmtEuro(i.value)}</span>
                    {isUrgent ? (
                      <Badge variant="destructive">{days} días</Badge>
                    ) : isSoon ? (
                      <Badge className="bg-amber-500">{days} días</Badge>
                    ) : (
                      <Badge variant="secondary">{months} meses</Badge>
                    )}
                    {concentrated && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">
                        Concentración
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

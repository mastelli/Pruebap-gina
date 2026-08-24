"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getCategoryFor, EXPENSE_CATEGORY_DEFS } from "@/lib/categories"

const BUDGETS_STORAGE_KEY = "appExpenseBudgets"

type Budgets = Record<string, number>

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Puntos de anclaje del tono de la barra segun el exceso sobre el
// presupuesto (gasto/presupuesto): verde al llegar al limite,
// verdoso-amarillo al +10%, naranja al +25% y rojo a partir del +40%
const OVER_HUE_STOPS: Array<[number, number]> = [
  [1.0, 120],
  [1.1, 85],
  [1.25, 38],
  [1.4, 0],
]

function overBudgetHue(ratio: number): number {
  if (ratio <= OVER_HUE_STOPS[0][0]) return OVER_HUE_STOPS[0][1]
  for (let i = 1; i < OVER_HUE_STOPS.length; i++) {
    const [r1, h1] = OVER_HUE_STOPS[i]
    if (ratio <= r1) {
      const [r0, h0] = OVER_HUE_STOPS[i - 1]
      return h0 + ((h1 - h0) * (ratio - r0)) / (r1 - r0)
    }
  }
  return 0
}

// Tipos de gasto del mes seleccionado con su presupuesto editable por tipo
export function ExpenseTypes({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const [budgets, setBudgets] = useState<Budgets>({})

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(BUDGETS_STORAGE_KEY)
      if (raw) setBudgets(JSON.parse(raw) as Budgets)
    } catch {
      // almacenamiento no disponible
    }
  }, [])

  const saveBudget = (category: string, value: number) => {
    setBudgets((prev) => {
      const next = { ...prev, [category]: value }
      try {
        window.localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // almacenamiento no disponible
      }
      return next
    })
  }

  const now = new Date()
  const prefix = `${now.getFullYear()}-${month}`

  const spentByCategory: Record<string, number> = {}
  for (const def of EXPENSE_CATEGORY_DEFS) spentByCategory[def.key] = 0
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
    spentByCategory[getCategoryFor(transaction)] += Math.abs(transaction.amount)
  }

  const sortedDefs = [...EXPENSE_CATEGORY_DEFS].sort((a, b) => t(a.key).localeCompare(t(b.key), "es"))

  return (
    <div className="space-y-4 px-2">
      {sortedDefs.map((def) => {
        const spent = spentByCategory[def.key]
        const budget = budgets[def.key] ?? 0
        const ratio = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
        return (
          <div key={def.key} className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{t(def.key)}</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("Budget")}
                  className="h-8 w-28 text-right"
                  value={budget > 0 ? budget : ""}
                  onChange={(event) => saveBudget(def.key, Number(event.target.value) || 0)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("Spent")}: {formatEuros(spent)}
            </p>
            {budget > 0 && (
              <div className="w-full h-1.5 rounded-full bg-secondary">
                <div
                  className={`h-1.5 rounded-full ${spent >= budget ? "" : "bg-primary"}`}
                  style={{
                    // Color segun exceso: verde al limite y degradado
                    // amarillo -> naranja -> rojo conforme crece el exceso
                    ...(spent >= budget
                      ? { backgroundColor: `hsl(${overBudgetHue(spent / budget)} 72% 42%)` }
                      : {}),
                    width: `${ratio}%`,
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

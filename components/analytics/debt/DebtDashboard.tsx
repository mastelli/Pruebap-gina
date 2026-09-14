"use client"

import { useEffect, useMemo, useState } from "react"
import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { InputsSection } from "./InputsSection"
import { Kpis } from "./Kpis"
import { Diagnosis } from "./Diagnosis"
import { DebtCharts } from "./DebtCharts"
import { DebtCalendar } from "./DebtCalendar"
import { Simulator } from "./Simulator"
import { Recommendations } from "./Recommendations"
import {
  applyScenario,
  computeDerived,
  diagnose,
  project,
  recommend,
  type Item,
  type SimulatorState,
} from "./debt-engine"
import { usePortfolioEurTotal, usePortfolioCash } from "@/components/portfolio-total"
import { useTransactions, getLatestPeriod } from "@/lib/transactions"
import { isInternalTransferTransaction } from "@/lib/categories"

const STORAGE_KEY = "debt-dashboard-items"

function loadItems(): Item[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Item[]) : []
  } catch {
    return []
  }
}

export function DebtDashboard() {
  const [items, setItems] = useState<Item[]>([])
  const [sim, setSim] = useState<SimulatorState>({ incomeLoss: 0, rateRise: 0, unexpectedExpense: 0 })
  const [monthlySavings, setMonthlySavings] = useState(0)
  const [months, setMonths] = useState(12)
  const { checkingBalance, transactions } = useTransactions()
  const { total: investment } = usePortfolioEurTotal()
  const portfolioCash = usePortfolioCash()

  useEffect(() => {
    setItems(loadItems())
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore persistence errors
    }
  }, [items])

  const period = getLatestPeriod(transactions)
  const monthlyNet = useMemo(() => {
    if (!period) return 0
    let net = 0
    for (const tx of transactions) {
      if (!tx.date.startsWith(period)) continue
      if (tx.amount > 0 && isInternalTransferTransaction(tx)) continue
      net += tx.amount
    }
    return net
  }, [transactions, period])

  const extraAC = useMemo(() => {
    const inv = typeof investment === "number" ? investment : 0
    return inv + portfolioCash + monthlyNet
  }, [investment, portfolioCash, monthlyNet])

  const base = useMemo(() => computeDerived(items, extraAC), [items, extraAC])
  const scenario = useMemo(() => applyScenario(base, items, sim), [base, items, sim])
  const flags = useMemo(() => diagnose(base, scenario, sim, items), [base, scenario, sim, items])
  const recs = useMemo(() => recommend(base, scenario, items, sim), [base, scenario, items, sim])
  const projection = useMemo(
    () => project(base, scenario, sim, monthlySavings, months),
    [base, scenario, sim, monthlySavings, months],
  )

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 sm:p-8">
      <AnalyticsHeader titleKey="Balance" showActions={false} />
      <Kpis base={base} scenario={scenario} flags={flags} />
      <Diagnosis flags={flags} />
      <InputsSection items={items} onChange={setItems} />
      <DebtCharts d={scenario} items={items} projection={projection} months={months} onMonthsChange={setMonths} />
      <DebtCalendar items={items} />
      <Simulator
        sim={sim}
        onSimChange={setSim}
        monthlySavings={monthlySavings}
        onMonthlySavingsChange={setMonthlySavings}
      />
      <Recommendations recs={recs} />
    </div>
  )
}

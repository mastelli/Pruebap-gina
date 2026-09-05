"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getLatestPeriod, getPeriodPrefix } from "@/lib/transactions"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

function calcPeriod(transactions: ReturnType<typeof useTransactions>["transactions"], prefix: string) {
  let income = 0
  let expenses = 0
  for (const transaction of transactions) {
    if (!transaction.date.startsWith(prefix)) continue
    if (transaction.amount > 0) income += transaction.amount
    else expenses += -transaction.amount
  }
  return { income, expenses }
}

// Primer vistazo: como va este periodo frente al anterior en ingresos,
// gastos y resultado, con un grafico de barras que lo compara.
export function PeriodComparison({ month }: { month?: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const cur = month ? getPeriodPrefix(transactions, month) : getLatestPeriod(transactions)
  const [curYear, curMonthNum] = cur.split("-").map(Number)
  const prevDate = new Date(curYear, curMonthNum - 2, 1)
  const prev = getPeriodPrefix(
    transactions,
    String(prevDate.getMonth() + 1).padStart(2, "0"),
  )

  const curCalc = calcPeriod(transactions, cur)
  const prevCalc = calcPeriod(transactions, prev)

  if (
    curCalc.income === 0 &&
    curCalc.expenses === 0 &&
    prevCalc.income === 0 &&
    prevCalc.expenses === 0
  ) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
  }

  const monthLabel = (prefix: string): string => {
    const [year, month] = prefix.split("-").map(Number)
    return `${t(MONTHS[month - 1]).slice(0, 3)} ${year}`
  }

  const curLabel = monthLabel(cur)
  const prevLabel = monthLabel(prev)

  const pct = (current: number, previous: number): number | null =>
    previous > 0 ? ((current - previous) / previous) * 100 : null

  const incomeDelta = pct(curCalc.income, prevCalc.income)
  const expenseDelta = pct(curCalc.expenses, prevCalc.expenses)
  const netDelta = pct(
    curCalc.income - curCalc.expenses,
    prevCalc.income - prevCalc.expenses,
  )

  const DeltaChip = ({ delta, invert }: { delta: number | null; invert?: boolean }) => {
    if (delta === null) return null
    const good = delta >= 0 !== Boolean(invert)
    return (
      <span
        className={`flex items-center gap-1 text-xs font-medium ${
          good ? "text-green-500" : "text-red-500"
        }`}
      >
        <TrendingUp className={`h-3 w-3 ${delta < 0 ? "rotate-180" : ""}`} />
        {`${delta >= 0 ? "+" : "-"}${Math.abs(delta).toFixed(1).replace(".", ",")}%`}
      </span>
    )
  }

  const StatCard = ({
    label,
    value,
    previous,
    delta,
    invert,
    valueClass,
  }: {
    label: string
    value: number
    previous: number
    delta: number | null
    invert?: boolean
    valueClass?: string
  }) => (
    <div className="rounded-xl bg-secondary/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <DeltaChip delta={delta} invert={invert} />
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${valueClass ?? ""}`}>
        {formatEuros(value)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("Previous period")} ({prevLabel}): {formatEuros(previous)}
      </p>
    </div>
  )

  const netCur = curCalc.income - curCalc.expenses
  const netPrev = prevCalc.income - prevCalc.expenses
  const netClass = netCur >= 0 ? "text-emerald-500" : "text-red-500"

  const chartData = [
    { name: prevLabel, income: prevCalc.income, expenses: prevCalc.expenses },
    { name: curLabel, income: curCalc.income, expenses: curCalc.expenses },
  ]

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <div className="grid flex-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("Total Income")}
          value={curCalc.income}
          previous={prevCalc.income}
          delta={incomeDelta}
          valueClass="text-emerald-500"
        />
        <StatCard
          label={t("Total Expenses")}
          value={curCalc.expenses}
          previous={prevCalc.expenses}
          delta={expenseDelta}
          invert
          valueClass="text-red-500"
        />
        <StatCard
          label={t("Monthly Remainder")}
          value={netCur}
          previous={netPrev}
          delta={netDelta}
          valueClass={netClass}
        />
      </div>

      <div className="w-full rounded-xl bg-secondary/50 p-4 xl:w-[380px] xl:shrink-0">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("Period comparison")}
        </p>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(128,128,128,0.08)" }}
              formatter={(value: number | string) => formatEuros(Number(value))}
            />
            <Legend />
            <Bar dataKey="income" name={t("Total Income")} fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={38} />
            <Bar
              dataKey="expenses"
              name={t("Total Expenses")}
              fill="#ef4444"
              radius={[3, 3, 0, 0]}
              maxBarSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
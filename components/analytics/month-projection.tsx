"use client"

import { useLanguage } from "@/lib/i18n"
import { useTransactions, getLatestPeriod } from "@/lib/transactions"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

function StatBox({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string
  value: string
  sub: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl bg-secondary/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${valueClass ?? ""}`}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

// Primer vistazo: a que ritmo gastas y cuanto gastaras a fin de mes si
// sigues igual. Ayuda a decidir si hay margen para gastos extra.
export function MonthProjection() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const period = getLatestPeriod(transactions)
  const [periodYear, periodMonth] = period.split("-").map(Number)
  const periodDayCount = new Date(periodYear, periodMonth, 0).getDate()

  let income = 0
  let expenses = 0
  let maxDay = 0
  for (const transaction of transactions) {
    if (!transaction.date.startsWith(period)) continue
    if (transaction.amount > 0) income += transaction.amount
    else expenses += -transaction.amount
    const day = Number.parseInt(transaction.date.slice(8, 10), 10)
    if (Number.isFinite(day) && day > maxDay) maxDay = day
  }

  if (income === 0 && expenses === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
  }

  const elapsed = Math.min(Math.max(maxDay, 1), periodDayCount)
  const remaining = periodDayCount - elapsed
  const avgDaily = expenses > 0 ? expenses / elapsed : 0
  const projectedExpenses = expenses + avgDaily * remaining
  const projectedNet = income - projectedExpenses
  const sharePct = income > 0 ? (projectedExpenses / income) * 100 : null

  const projectedExpensesClass =
    sharePct !== null && sharePct > 100 ? "text-red-500" : "text-blue-500"
  const resultClass = projectedNet >= 0 ? "text-emerald-500" : "text-red-500"

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatBox
          label={t("Daily average expense")}
          value={formatEuros(avgDaily)}
          sub={`${t("Day")} ${elapsed}/${periodDayCount} ${t("of the month")}`}
        />
        <StatBox
          label={t("Projected monthly expenses")}
          value={formatEuros(projectedExpenses)}
          sub={`${t("If you keep this pace")} · ${t("Income")}: ${formatEuros(income)}`}
          valueClass={projectedExpensesClass}
        />
        <StatBox
          label={t("Projected result")}
          value={`${projectedNet >= 0 ? "+" : ""}${formatEuros(projectedNet)}`}
          sub={t("You will end the month with")}
          valueClass={resultClass}
        />
      </div>

      {sharePct === null ? (
        <p className="text-sm text-muted-foreground">
          {t("Projected monthly expenses")}: {formatEuros(projectedExpenses)}
        </p>
      ) : (
        <div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="bg-red-400"
              style={{ width: `${Math.min(100, sharePct)}%` }}
            />
            <div
              className="bg-emerald-500"
              style={{ width: `${Math.max(0, 100 - sharePct)}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-red-500">
              {t("You will spend")} {sharePct.toFixed(0)}% {t("of your income")}
            </span>
            <span className="font-medium text-emerald-600">
              {Math.max(0, 100 - sharePct).toFixed(0)}% {t("available")}
            </span>
          </div>
          {sharePct > 100 && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
              {t("At risk of overspending")}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
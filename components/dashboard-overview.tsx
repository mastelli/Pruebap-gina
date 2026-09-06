"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CreditCard,
  LineChart,
  List,
  Loader2,
  MessageSquare,
  PieChart,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { usePortfolioEurTotal } from "@/components/portfolio-total"
import { getCategoryFor } from "@/lib/categories"
import { computeDerived, type Derived, type Item } from "@/components/analytics/debt/debt-engine"

const DEBT_STORAGE_KEY = "debt-dashboard-items"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

function monthPrefix(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function sumByMonth(transactions: ReturnType<typeof useTransactions>["transactions"], prefix: string, positive: boolean) {
  return transactions
    .filter((transaction) => transaction.date.startsWith(prefix))
    .filter((transaction) => (positive ? transaction.amount > 0 : transaction.amount < 0))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
}

function formatDelta(pct: number | null): string {
  if (pct === null) return "—"
  const sign = pct > 0 ? "+" : ""
  return `${sign}${pct.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`
}

function delta(cur: number, prev: number): number | null {
  if (prev <= 0) return null
  return ((cur - prev) / prev) * 100
}

function loadDebtItems(): Item[] {
  try {
    const raw = window.localStorage.getItem(DEBT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Item[]) : []
  } catch {
    return []
  }
}

// Resumen de datos del mes para que la IA genere el análisis con cifras reales
function buildInsightContext(
  transactions: ReturnType<typeof useTransactions>["transactions"],
  debt: Derived | null,
  portfolio: number | null,
  momPct: number | null,
  checkingBalance: number | null,
): string {
  const now = new Date()
  const mPrefix = monthPrefix(now)
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const pPrefix = monthPrefix(prev)

  const income = sumByMonth(transactions, mPrefix, true)
  const expense = sumByMonth(transactions, mPrefix, false)
  const incomePrev = sumByMonth(transactions, pPrefix, true)
  const expensePrev = sumByMonth(transactions, pPrefix, false)
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0

  const lines: string[] = [
    `- Mes actual (${mPrefix}): ingresos ${formatEuros(income)}, gastos ${formatEuros(expense)}, neto ${formatEuros(income - expense)}, tasa de ahorro ${savingsRate.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%.`,
    `- Mes anterior (${pPrefix}): ingresos ${formatEuros(incomePrev)}, gastos ${formatEuros(expensePrev)}, neto ${formatEuros(incomePrev - expensePrev)}.`,
  ]

  const byCategory: Record<string, number> = {}
  for (const transaction of transactions) {
    if (!transaction.date.startsWith(mPrefix) || transaction.amount >= 0) continue
    const category = getCategoryFor(transaction)
    byCategory[category] = (byCategory[category] ?? 0) + Math.abs(transaction.amount)
  }
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (categories.length > 0) {
    lines.push("  Gastos del mes por categoria:")
    for (const [category, value] of categories) {
      lines.push(
        `  * ${category}: ${formatEuros(value)} (${expense > 0 ? Math.round((value / expense) * 100) : 0}%)`,
      )
    }
  }

  const liquid = checkingBalance ?? 0
  if (debt) {
    const interest = debt.annualDebtService > 0 ? debt.annualDebtService / 12 : null
    lines.push(
      `- Deuda total: ${formatEuros(debt.pasivoTotal)}${interest !== null ? ` (intereses ${formatEuros(interest)}/mes)` : ""}.`,
    )
  }
  if (portfolio !== null) {
    const mom = momPct !== null ? `${momPct >= 0 ? "+" : ""}${momPct.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%` : "n/d"
    lines.push(`- Cartera de inversión: ${formatEuros(portfolio)} (variación vs mes anterior: ${mom}).`)
  }
  lines.push(`- Cuenta disponible: ${formatEuros(liquid)}.`)

  const recent = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10)
  if (recent.length > 0) {
    lines.push("  Movimientos recientes:")
    for (const transaction of recent) {
      lines.push(`  - ${transaction.date} · ${transaction.name} · ${formatEuros(transaction.amount)}`)
    }
  }

  return lines.join("\n")
}

interface StatRowProps {
  icon: ReactNode
  iconClass: string
  label: string
  value: string
  hint?: string
  hintClass?: string
}

function StatRow({ icon, iconClass, label, value, hint, hintClass = "text-muted-foreground" }: StatRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-base font-semibold tabular-nums">{value}</p>
      </div>
      {hint && <p className={`shrink-0 text-xs font-medium tabular-nums ${hintClass}`}>{hint}</p>}
    </div>
  )
}

function CardShell({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string
  actionHref?: string
  actionLabel?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {actionLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function CompareRow({ label, prev, cur, good }: { label: string; prev: number; cur: number; good: boolean }) {
  const pct = delta(cur, prev)
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right">
        <span className="mr-2 text-xs text-muted-foreground">{formatEuros(prev)}</span>
        <span className="text-sm font-semibold tabular-nums">{formatEuros(cur)}</span>
        {pct !== null && (
          <span
            className={`ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
              good ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatDelta(pct)}
          </span>
        )}
      </span>
    </div>
  )
}

export function DashboardOverview() {
  const { t, lang } = useLanguage()
  const { transactions, checkingBalance } = useTransactions()
  const { total: portfolio, momPct } = usePortfolioEurTotal()

  const [debt, setDebt] = useState<Derived | null>(null)
  const [debtCount, setDebtCount] = useState(0)

  useEffect(() => {
    const items = loadDebtItems()
    setDebt(computeDerived(items))
    setDebtCount(items.length)
  }, [])

  const [insight, setInsight] = useState<string | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const [insightError, setInsightError] = useState<string | null>(null)
  const insightRequestedRef = useRef(false)

  const requestInsight = useCallback(async () => {
    if (insightLoading) return
    setInsightLoading(true)
    setInsightError(null)

    const monthName = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", {
      month: "long",
    }).format(now)

    const ask =
      lang === "en"
        ? `Analyze my finances for the current month (${monthName} ${now.getFullYear()}) and write a short summary (3-5 sentences) covering: how the month went (income vs expenses, savings rate, comparison with last month), something relevant about my spending, and one practical tip. Do not invent figures, use only the provided context.`
        : `Analiza mis finanzas del mes actual (${monthName} ${now.getFullYear()}) y redacta un resumen breve (3-5 frases) que cubra: cómo ha ido el mes (ingresos vs gastos, tasa de ahorro, comparación con el mes anterior), algo relevante de mis gastos y un consejo práctico. No inventes cifras, usa solo el contexto proporcionado.`

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: ask }],
          context: buildInsightContext(transactions, debt, portfolio, momPct, checkingBalance),
        }),
      })
      const data = await response.json().catch(() => null)

      if (response.status === 503) {
        setInsightError(t("AI assistant unconfigured"))
      } else if (!data?.reply) {
        setInsightError(t("AI assistant unavailable"))
      } else {
        setInsight(data.reply)
      }
    } catch {
      setInsightError(t("AI assistant unavailable"))
    } finally {
      setInsightLoading(false)
    }
  }, [transactions, debt, portfolio, momPct, checkingBalance, now, lang, t, insightLoading])

  useEffect(() => {
    // espera breve para que los datos se carguen antes de pedir el análisis
    const id = window.setTimeout(() => {
      if (!insightRequestedRef.current) {
        insightRequestedRef.current = true
        void requestInsight()
      }
    }, 800)
    return () => window.clearTimeout(id)
  }, [requestInsight])

  const now = useMemo(() => new Date(), [])
  const currentYear = `${now.getFullYear()}`
  const monthsElapsed = now.getMonth() + 1
  const mPrefix = monthPrefix(now)
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const pPrefix = monthPrefix(prevMonth)

  const yearlyIncome = transactions
    .filter((transaction) => transaction.amount > 0 && transaction.date.startsWith(currentYear))
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const yearlyExpenses = transactions
    .filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(currentYear))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

  const incomeMonth = sumByMonth(transactions, mPrefix, true)
  const expensesMonth = sumByMonth(transactions, mPrefix, false)
  const incomePrev = sumByMonth(transactions, pPrefix, true)
  const expensesPrev = sumByMonth(transactions, pPrefix, false)

  const savingsMonth = incomeMonth - expensesMonth
  const savingsPrev = incomePrev - expensesPrev
  const savingsRate = incomeMonth > 0 ? (savingsMonth / incomeMonth) * 100 : 0

  const debtTotal = debt?.pasivoTotal ?? 0
  const monthlyInterest = debt && debt.annualDebtService > 0 ? debt.annualDebtService / 12 : null
  const liquid = checkingBalance ?? 0
  const netWorth = liquid + (portfolio ?? 0) - debtTotal

  const recent = useMemo(
    () => [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5),
    [transactions],
  )

  const averageIncomeMonth = monthsElapsed > 0 ? yearlyIncome / monthsElapsed : 0
  const averageExpensesMonth = monthsElapsed > 0 ? yearlyExpenses / monthsElapsed : 0

  const breakdown = [
    {
      href: "/analytics/income",
      title: t("Revenue"),
      value: formatEuros(yearlyIncome),
      sub: `${t("Monthly average")}: ${formatEuros(averageIncomeMonth)}`,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      href: "/analytics/expenses",
      title: t("Expenses"),
      value: formatEuros(yearlyExpenses),
      sub: `${t("Monthly average")}: ${formatEuros(averageExpensesMonth)}`,
      iconClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      icon: <TrendingDown className="h-5 w-5" />,
    },
    {
      href: "/analytics/savings",
      title: t("Debt"),
      value: debtTotal > 0 ? formatEuros(debtTotal) : formatEuros(0),
      sub: debtCount > 0 || debtTotal > 0 ? `${t("debts")}: ${debtCount}` : "—",
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      href: "/investment",
      title: t("Savings/Investment"),
      value:
        portfolio === null
          ? "…"
          : portfolio.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
      sub:
        portfolio !== null && momPct !== null
          ? `${formatDelta(momPct)} ${t("vs last month")}`
          : `${t("Savings Rate")}: ${savingsRate.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`,
      iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      icon: <PieChart className="h-5 w-5" />,
    },
  ]

  const quickActions = [
    { href: "/analytics", label: t("Analytics"), icon: <LineChart className="h-4 w-4" /> },
    { href: "/analytics/savings", label: t("Debt"), icon: <CreditCard className="h-4 w-4" /> },
    { href: "/investment", label: t("Investment portfolio"), icon: <PieChart className="h-4 w-4" /> },
    { href: "/chat", label: t("Chat"), icon: <MessageSquare className="h-4 w-4" /> },
    { href: "/calculator", label: t("Calculator"), icon: <Calculator className="h-4 w-4" /> },
    { href: "/transactions", label: t("Transactions"), icon: <List className="h-4 w-4" /> },
  ]

  const fmtCard = (value: number) =>
    value.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">{t("Breakdown")}</h2>
          <p className="text-xs text-muted-foreground">{now.getFullYear()}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {breakdown.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}>{card.icon}</div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">{t("AI Insight")}</h3>
            <span className="text-xs text-muted-foreground">· {t("This month")}</span>
          </div>
          <button
            onClick={() => void requestInsight()}
            disabled={insightLoading}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${insightLoading ? "animate-spin" : ""}`} />
            {t("Regenerate")}
          </button>
        </div>
        {insightLoading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("AI is typing")}
          </div>
        ) : insightError ? (
          <div className="flex flex-col gap-2 py-2">
            <p className="text-sm text-destructive">{insightError}</p>
            <button onClick={() => void requestInsight()} className="self-start text-xs underline">
              {t("Try again")}
            </button>
          </div>
        ) : insight ? (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{insight}</p>
            <div className="mt-3">
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {t("Ask Aurora about this")}
              </Link>
            </div>
          </>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CardShell title={t("This month")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatRow
              icon={<TrendingUp className="h-4 w-4" />}
              iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              label={t("Monthly Income")}
              value={formatEuros(incomeMonth)}
              hint={formatDelta(delta(incomeMonth, incomePrev))}
              hintClass={
                delta(incomeMonth, incomePrev) !== null && delta(incomeMonth, incomePrev)! >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }
            />
            <StatRow
              icon={<TrendingDown className="h-4 w-4" />}
              iconClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
              label={t("Expenses this month")}
              value={formatEuros(expensesMonth)}
              hint={formatDelta(delta(expensesMonth, expensesPrev))}
              hintClass={
                delta(expensesMonth, expensesPrev) === null || delta(expensesMonth, expensesPrev)! <= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }
            />
            <StatRow
              icon={<Wallet className="h-4 w-4" />}
              iconClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
              label={t("Savings this month")}
              value={formatEuros(savingsMonth)}
              hint={formatDelta(delta(savingsMonth, savingsPrev))}
              hintClass={
                delta(savingsMonth, savingsPrev) !== null && delta(savingsMonth, savingsPrev)! >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }
            />
            <StatRow
              icon={<PieChart className="h-4 w-4" />}
              iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
              label={t("Savings Rate")}
              value={`${savingsRate.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`}
            />
          </div>
          {savingsMonth < 0 && (
            <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
              {t("You spend more than you earn")}
            </p>
          )}
        </CardShell>

        <CardShell title={t("Accounts Overview")}>
          <div className="space-y-3">
            <StatRow
              icon={<Wallet className="h-4 w-4" />}
              iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              label={t("Available to spend")}
              value={formatEuros(liquid)}
              hint={t("Checking account")}
            />
            <StatRow
              icon={<PieChart className="h-4 w-4" />}
              iconClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
              label={t("Investment portfolio")}
              value={portfolio === null ? "…" : fmtCard(portfolio)}
              hint={momPct !== null ? `${formatDelta(momPct)} ${t("vs last month")}` : undefined}
              hintClass={momPct !== null && momPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}
            />
            <StatRow
              icon={<CreditCard className="h-4 w-4" />}
              iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              label={t("Total debt")}
              value={debtTotal > 0 ? fmtCard(debtTotal) : fmtCard(0)}
              hint={monthlyInterest !== null ? `${fmtCard(monthlyInterest)}/mes` : debtCount > 0 ? `${t("debts")}: ${debtCount}` : undefined}
            />
            <StatRow
              icon={<TrendingUp className="h-4 w-4" />}
              iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
              label={t("Net Worth")}
              value={fmtCard(netWorth)}
              hint={t("estimated")}
            />
          </div>
        </CardShell>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <CardShell title={t("Recent transactions")} actionHref="/transactions" actionLabel={t("View All Transactions")}>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("No transactions yet")}</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{transaction.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString(lang === "es" ? "es-ES" : "en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      transaction.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : "−"}
                    {formatEuros(Math.abs(transaction.amount))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardShell>

        <CardShell title={t("Quick actions")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-start gap-2 rounded-xl border bg-muted/30 p-3 text-sm font-medium transition-colors hover:bg-muted/60"
              >
                <span className="text-muted-foreground">{action.icon}</span>
                {action.label}
              </Link>
            ))}
          </div>
        </CardShell>

        <CardShell title={t("Period comparison")}>
          <div className="space-y-3">
            <CompareRow label={`${t("This month")} · ${t("Income this month")}`} prev={incomePrev} cur={incomeMonth} good />
            <CompareRow
              label={`${t("This month")} · ${t("Expenses this month")}`}
              prev={expensesPrev}
              cur={expensesMonth}
              good={delta(expensesMonth, expensesPrev) === null || delta(expensesMonth, expensesPrev)! <= 0}
            />
            <CompareRow
              label={`${t("This month")} · ${t("Savings this month")}`}
              prev={savingsPrev}
              cur={savingsMonth}
              good={delta(savingsMonth, savingsPrev) === null || delta(savingsMonth, savingsPrev)! >= 0}
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("Last month")} → {t("This month")}
          </p>
        </CardShell>
      </section>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">{t("Need to understand your numbers?")}</p>
            <p className="text-xs text-muted-foreground">
              {t("Charts")} · {t("GenAI Financial Advisor")}
            </p>
          </div>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            {t("Open analytics")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
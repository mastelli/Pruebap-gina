"use client"

import Link from "next/link"
import {
  Calculator,
  LineChart,
  Building2,
  TrendingUp,
  ArrowRight,
  Check,
  Target,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import type { LucideIcon } from "lucide-react"

type Accent = { chip: string; bar: string; check: string }

const ACCENTS: Record<string, Accent> = {
  indigo: {
    chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    bar: "from-indigo-500/60",
    check: "text-indigo-500",
  },
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    bar: "from-emerald-500/60",
    check: "text-emerald-500",
  },
  sky: {
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    bar: "from-sky-500/60",
    check: "text-sky-500",
  },
}

interface Tool {
  href: string
  icon: LucideIcon
  accent: Accent
  nameKey: string
  descKey: string
  chips: string[]
}

const TOOLS: Tool[] = [
  {
    href: "/calculator/compound",
    icon: LineChart,
    accent: ACCENTS.indigo,
    nameKey: "Compound Interest",
    descKey: "Compound Interest desc",
    chips: ["Contributions", "Frequency", "Projection"],
  },
  {
    href: "/calculator/realestate",
    icon: Building2,
    accent: ACCENTS.emerald,
    nameKey: "Real Estate Assets",
    descKey: "Real Estate desc",
    chips: ["Taxes and fees", "Mortgage", "Scenarios"],
  },
  {
    href: "/calculator/stocks",
    icon: TrendingUp,
    accent: ACCENTS.sky,
    nameKey: "Stocks",
    descKey: "Stocks desc",
    chips: ["Valuation", "Charts", "Live data"],
  },
]

interface Goal {
  href: string
  icon: LucideIcon
  accent: Accent
  goalKey: string
}

const GOALS: Goal[] = [
  { href: "/calculator/compound", icon: LineChart, accent: ACCENTS.indigo, goalKey: "Goal savings" },
  { href: "/calculator/realestate", icon: Building2, accent: ACCENTS.emerald, goalKey: "Goal rent" },
  { href: "/calculator/stocks", icon: TrendingUp, accent: ACCENTS.sky, goalKey: "Goal stock" },
]

export default function CalculatorHub() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-muted-foreground">{t("Calculator")}</p>
          </div>
          <h1 className="mt-1 bg-gradient-to-r from-foreground to-primary bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            {t("Financial Calculators")}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("Calculators intro")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group inline-flex items-center gap-1.5 rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                <tool.icon className={`h-4 w-4 ${tool.accent.check}`} />
                {t(tool.nameKey)}
                <ArrowRight className="h-3.5 w-3.5 opacity-40 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tools ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent opacity-60 transition-opacity group-hover:opacity-100 ${tool.accent.bar}`} />
            <tool.icon className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 stroke-[1.2] text-foreground/[0.05] transition-colors group-hover:text-foreground/[0.08]" />
            <div className={`relative inline-flex w-fit items-center gap-2 rounded-xl p-2.5 ${tool.accent.chip}`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <h3 className="relative mt-4 text-lg font-semibold text-foreground">{t(tool.nameKey)}</h3>
            <p className="relative mt-1 text-sm text-muted-foreground">{t(tool.descKey)}</p>
            <div className="relative mt-4 mb-5 flex flex-wrap gap-1.5">
              {tool.chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  <Check className={`h-3 w-3 ${tool.accent.check}`} />
                  {t(chip)}
                </span>
              ))}
            </div>
            <div className="relative mt-auto flex w-full items-center justify-between border-t pt-4">
              <span className="text-sm font-medium text-foreground">{t("Try calculator")}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border transition-all group-hover:translate-x-0.5 group-hover:border-primary/50 group-hover:bg-primary/10">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Pick by goal ── */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            {t("Pick by goal")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {GOALS.map((goal) => (
            <Link
              key={goal.href}
              href={goal.href}
              className="group flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${goal.accent.chip}`}>
                  <goal.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{t(goal.goalKey)}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* ── Tip ── */}
      <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-card/50 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">{t("Compounding tip")}</p>
      </div>
    </div>
  )
}
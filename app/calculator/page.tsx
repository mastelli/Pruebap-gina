"use client"

import Link from "next/link"
import {
  Calculator,
  LineChart,
  Building2,
  TrendingUp,
  ArrowRight,
  Check,
  Sparkles,
  GraduationCap,
  Lightbulb,
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

interface Lesson {
  icon: LucideIcon
  accent: Accent
  titleKey: string
  whatKey: string
  lessonKey: string
}

const LESSONS: Lesson[] = [
  {
    icon: LineChart,
    accent: ACCENTS.indigo,
    titleKey: "Compound Interest",
    whatKey: "Compound what",
    lessonKey: "Compound lesson",
  },
  {
    icon: Building2,
    accent: ACCENTS.emerald,
    titleKey: "Real Estate Assets",
    whatKey: "Real estate what",
    lessonKey: "Real estate lesson",
  },
  {
    icon: TrendingUp,
    accent: ACCENTS.sky,
    titleKey: "Stocks",
    whatKey: "Stocks what",
    lessonKey: "Stocks lesson",
  },
]

export default function CalculatorHub() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">{t("Calculator")}</p>
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {t("Financial Calculators")}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t("Calculators intro")}</p>
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

      {/* ── Learn before you calculate ── */}
      <div className="pt-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">{t("Learn before you calculate")}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("Learn hint")}</p>

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
          {LESSONS.map((lesson) => (
            <div key={lesson.titleKey} className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <div className={`rounded-xl p-2 ${lesson.accent.chip}`}>
                  <lesson.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{t(lesson.titleKey)}</h3>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("What it measures")}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">{t(lesson.whatKey)}</p>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-secondary/50 p-3">
                <Lightbulb className={`mt-0.5 h-4 w-4 shrink-0 ${lesson.accent.check}`} />
                <p className="text-sm text-foreground/85">{t(lesson.lessonKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tip ── */}
      <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-card/50 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">{t("Compounding tip")}</p>
      </div>
    </div>
  )
}
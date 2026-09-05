"use client"

import { Hourglass, Percent, PieChart, Repeat, ShieldCheck, Sprout } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface Tip {
  id: string
  icon: LucideIcon
  color: string
  title: string
  desc: string
}

// Consejos y conocimientos financieros para orientar donde invertir
export function InvestmentTips() {
  const { t } = useLanguage()

  const tips: Tip[] = [
    {
      id: "emergency",
      icon: ShieldCheck,
      color: "#14b8a6",
      title: t("Emergency fund"),
      desc: t("Emergency fund tip"),
    },
    {
      id: "diversify",
      icon: PieChart,
      color: "#2563eb",
      title: t("Diversify"),
      desc: t("Diversify tip"),
    },
    {
      id: "horizon",
      icon: Hourglass,
      color: "#7c3aed",
      title: t("Long horizon"),
      desc: t("Long horizon tip"),
    },
    {
      id: "steady",
      icon: Repeat,
      color: "#f59e0b",
      title: t("Steady investing"),
      desc: t("Steady investing tip"),
    },
    {
      id: "compounding",
      icon: Sprout,
      color: "#22c55e",
      title: t("Compounding"),
      desc: t("Compounding tip"),
    },
    {
      id: "fees",
      icon: Percent,
      color: "#ef4444",
      title: t("Fees"),
      desc: t("Fees tip"),
    },
  ]

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="text-base font-semibold">{t("Investment tips")}</h3>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {tips.map((tip) => {
          const Icon = tip.icon
          return (
            <div key={tip.id} className="rounded-xl p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${tip.color}1a` }}
                >
                  <Icon className="h-4 w-4" style={{ color: tip.color }} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{tip.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
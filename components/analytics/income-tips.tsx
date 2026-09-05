"use client"

import { CalendarRange, Clock3, PiggyBank, Percent, ShieldCheck, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface Tip {
  id: string
  icon: LucideIcon
  color: string
  title: string
  desc: string
}

// Consejos sobre ingresos pensados para el funcionamiento real en España:
// IRPF, pagas extra, cotización y rentas puntuales.
export function IncomeTips() {
  const { t } = useLanguage()

  const tips: Tip[] = [
    {
      id: "extra-pay",
      icon: CalendarRange,
      color: "#f59e0b",
      title: t("Extra pay tip"),
      desc: t("Extra pay tip desc"),
    },
    {
      id: "irpf",
      icon: Percent,
      color: "#2563eb",
      title: t("IRPF withholding tip"),
      desc: t("IRPF withholding tip desc"),
    },
    {
      id: "irregular",
      icon: Zap,
      color: "#7c3aed",
      title: t("One-off income tip"),
      desc: t("One-off income tip desc"),
    },
    {
      id: "social-security",
      icon: ShieldCheck,
      color: "#14b8a6",
      title: t("Social security base tip"),
      desc: t("Social security base tip desc"),
    },
    {
      id: "overtime",
      icon: Clock3,
      color: "#ef4444",
      title: t("Overtime tip"),
      desc: t("Overtime tip desc"),
    },
    {
      id: "interest",
      icon: PiggyBank,
      color: "#22c55e",
      title: t("Interest income tip"),
      desc: t("Interest income tip desc"),
    },
  ]

  return (
    <div className="rounded-2xl bg-card shadow-sm">
      <div className="px-5 py-4">
        <h3 className="text-base font-semibold">{t("Income tips")}</h3>
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
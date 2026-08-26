"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n"
import {
  fetchMemberAccountSummary,
  type FamilyMember,
  type MemberAccountSummary,
} from "@/lib/family"

function formatCurrency(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

function RoleBadge({ role }: { role: FamilyMember["role"] }) {
  const { t } = useLanguage()
  const labels: Record<string, string> = {
    admin: t("Admin"),
    member: t("Member"),
    viewer: t("Viewer"),
  }
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    admin: "default",
    member: "secondary",
    viewer: "outline",
  }
  return (
    <Badge variant={variants[role] ?? "outline"}>
      {labels[role] ?? role}
    </Badge>
  )
}

function AvatarInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {initials || "?"}
    </div>
  )
}

function SummaryRow({
  label,
  value,
  color,
  muted,
}: {
  label: string
  value: string
  color?: string
  muted?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={muted ? "text-sm text-muted-foreground" : "font-medium"}>
        {label}
      </span>
      <span
        className={`${muted ? "text-sm " : ""}font-medium tabular-nums ${color ?? ""}`}
      >
        {value}
      </span>
    </div>
  )
}

export function FamilyMemberCard({ member }: { member: FamilyMember }) {
  const { t } = useLanguage()
  const [summary, setSummary] = useState<MemberAccountSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchMemberAccountSummary(member).then((s) => {
      if (!cancelled) {
        setSummary(s)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [member])

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <AvatarInitials name={member.displayName} />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{member.displayName}</CardTitle>
            {member.email && (
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            )}
          </div>
          <RoleBadge role={member.role} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="space-y-1.5">
            <SummaryRow
              label={t("Total Income")}
              value={formatCurrency(summary.monthlyIncome)}
              color="text-green-600 dark:text-green-400"
            />
            <SummaryRow
              label={t("Average Income")}
              value={formatCurrency(summary.monthlyIncomeAverage)}
              muted
            />
            <SummaryRow
              label={t("Total Expenses")}
              value={formatCurrency(summary.monthlyExpenses)}
              color="text-red-600 dark:text-red-400"
            />
            <SummaryRow
              label={t("Average Expenses")}
              value={formatCurrency(summary.monthlyExpenseAverage)}
              muted
            />
            <SummaryRow
              label={t("Checking Balance")}
              value={summary.checkingBalance !== null ? formatCurrency(summary.checkingBalance) : "—"}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("No data available")}</p>
        )}
      </CardContent>
    </Card>
  )
}

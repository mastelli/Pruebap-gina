"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useLanguage } from "@/lib/i18n"
import type { BalanceSnapshot, DerivedBalance } from "@/lib/balance-engine"
import { fmtEuro, CATEGORY_LABELS } from "@/lib/balance-engine"
import { useTheme } from "next-themes"

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"]

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-2 shadow-md text-sm">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}: {fmtEuro(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function Balance2Charts({ snapshot, derived }: { snapshot: BalanceSnapshot; derived: DerivedBalance }) {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const stroke = theme === "dark" ? "#888888" : "#333333"

  const assetTypeData = [
    { name: t("Current Assets"), value: derived.currentAssets },
    { name: t("Non-current Assets"), value: derived.nonCurrentAssets },
  ].filter((d) => d.value > 0)

  const liabilityTypeData = [
    { name: t("Current Liabilities"), value: derived.currentLiabilities },
    { name: t("Non-current Liabilities"), value: derived.nonCurrentLiabilities },
  ].filter((d) => d.value > 0)

  const assetCategoryData = Object.entries(
    snapshot.assets.reduce((acc, a) => {
      const label = CATEGORY_LABELS[a.category] || a.category
      acc[label] = (acc[label] || 0) + a.value
      return acc
    }, {} as Record<string, number>),
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const liabilityCategoryData = Object.entries(
    snapshot.liabilities.reduce((acc, l) => {
      const label = CATEGORY_LABELS[l.category] || l.category
      acc[label] = (acc[label] || 0) + l.value
      return acc
    }, {} as Record<string, number>),
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const compositionData = [
    { name: t("Current Assets"), value: derived.currentAssets },
    { name: t("Non-current Assets"), value: derived.nonCurrentAssets },
    { name: t("Current Liabilities"), value: derived.currentLiabilities },
    { name: t("Non-current Liabilities"), value: derived.nonCurrentLiabilities },
  ].filter((d) => d.value > 0)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-base">{t("Asset Distribution")}</CardTitle></CardHeader>
        <CardContent>
          {assetCategoryData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">{t("No data")}</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={assetCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {assetCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("Liability Distribution")}</CardTitle></CardHeader>
        <CardContent>
          {liabilityCategoryData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">{t("No data")}</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={liabilityCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {liabilityCategoryData.map((_, i) => <Cell key={i} fill={COLORS[(i + 5) % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("Assets vs Liabilities")}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ name: t("Current"), assets: derived.currentAssets, liabilities: derived.currentLiabilities }, { name: t("Non-current"), assets: derived.nonCurrentAssets, liabilities: derived.nonCurrentLiabilities }]}>
              <XAxis dataKey="name" stroke={stroke} fontSize={12} tickLine={false} />
              <YAxis stroke={stroke} fontSize={12} tickFormatter={(v) => fmtEuro(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="assets" name={t("Assets")} fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="liabilities" name={t("Liabilities")} fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("Patrimony Composition")}</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={compositionData} layout="vertical">
              <XAxis type="number" stroke={stroke} fontSize={12} tickFormatter={(v) => fmtEuro(v)} />
              <YAxis type="category" dataKey="name" stroke={stroke} fontSize={12} width={140} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {compositionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

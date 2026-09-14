"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Shield, Target, Wallet, PiggyBank } from "lucide-react"
import { fmtEuro } from "@/lib/balance-engine"
import { useLanguage } from "@/lib/i18n"
import type { BalanceItem, CashFlowEntry } from "@/lib/balance-engine"

interface AiAnalysisProps {
  derived: {
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    currentAssets: number
    nonCurrentAssets: number
    currentLiabilities: number
    nonCurrentLiabilities: number
    monthlyCashFlow: number
    emergencyFundMonths: number
  }
  ratios: Array<{
    label: string
    value: number
    formattedValue: string
    health: "good" | "warning" | "critical"
    description: string
  }>
  assets: BalanceItem[]
  liabilities: BalanceItem[]
  cashFlow: CashFlowEntry[]
}

interface Insight {
  icon: React.ElementType
  title: string
  text: string
  health: "good" | "warning" | "critical"
}

export function Balance2AiAnalysis({ derived, ratios, assets, liabilities, cashFlow }: AiAnalysisProps) {
  const { t } = useLanguage()

  const insights = useMemo(() => {
    const result: Insight[] = []
    const {
      totalAssets, totalLiabilities, netWorth, currentAssets,
      currentLiabilities, monthlyCashFlow, emergencyFundMonths
    } = derived

    const totalIncome = cashFlow.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0)
    const totalExpenses = cashFlow.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0
    const liquidityRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0

    // 1. Patrimonio neto
    if (netWorth > 0) {
      result.push({
        icon: Wallet,
        title: t("Positive Net Worth"),
        text: `${t("Your net worth is")} ${fmtEuro(netWorth)}. ${t("This means your assets exceed your liabilities, which is a healthy financial position.")}`,
        health: "good"
      })
    } else if (netWorth < 0) {
      result.push({
        icon: AlertTriangle,
        title: t("Negative Net Worth"),
        text: `${t("Your net worth is")} ${fmtEuro(netWorth)}. ${t("Your liabilities exceed your assets. Focus on reducing debt and increasing savings.")}`,
        health: "critical"
      })
    }

    // 2. Fondo de emergencia
    if (emergencyFundMonths >= 6) {
      result.push({
        icon: Shield,
        title: t("Strong Emergency Fund"),
        text: `${t("You have")} ${emergencyFundMonths.toFixed(1)} ${t("months of essential expenses covered. This is above the recommended 6-month minimum.")}`,
        health: "good"
      })
    } else if (emergencyFundMonths >= 3) {
      result.push({
        icon: Target,
        title: t("Moderate Emergency Fund"),
        text: `${t("You have")} ${emergencyFundMonths.toFixed(1)} ${t("months of essential expenses covered. Consider building up to 6 months for better security.")}`,
        health: "warning"
      })
    } else {
      result.push({
        icon: AlertTriangle,
        title: t("Low Emergency Fund"),
        text: `${t("You have only")} ${emergencyFundMonths.toFixed(1)} ${t("months of essential expenses covered. It is recommended to have at least 3-6 months.")}`,
        health: "critical"
      })
    }

    // 3. Flujo de caja
    if (monthlyCashFlow > 0) {
      const monthlyRate = totalIncome > 0 ? ((monthlyCashFlow / totalIncome) * 100).toFixed(0) : "0"
      result.push({
        icon: TrendingUp,
        title: t("Positive Cash Flow"),
        text: `${t("Your monthly cash flow is positive at")} ${fmtEuro(monthlyCashFlow)} (${monthlyRate}% ${t("of income")}). ${t("Keep this trend to build wealth over time.")}`,
        health: "good"
      })
    } else if (monthlyCashFlow < 0) {
      result.push({
        icon: TrendingDown,
        title: t("Negative Cash Flow"),
        text: `${t("Your monthly cash flow is negative at")} ${fmtEuro(monthlyCashFlow)}. ${t("You are spending more than you earn. Review your expenses.")}`,
        health: "critical"
      })
    }

    // 4. Ratio de liquidez
    if (liquidityRatio >= 2) {
      result.push({
        icon: PiggyBank,
        title: t("Excellent Liquidity"),
        text: `${t("Your liquidity ratio is")} ${liquidityRatio.toFixed(1)}x. ${t("You can cover your short-term debts twice over, which shows strong financial flexibility.")}`,
        health: "good"
      })
    } else if (liquidityRatio >= 1) {
      result.push({
        icon: CheckCircle,
        title: t("Adequate Liquidity"),
        text: `${t("Your liquidity ratio is")} ${liquidityRatio.toFixed(1)}x. ${t("You can cover your short-term debts, but there is room for improvement.")}`,
        health: "warning"
      })
    } else if (liquidityRatio > 0) {
      result.push({
        icon: AlertTriangle,
        title: t("Low Liquidity"),
        text: `${t("Your liquidity ratio is")} ${liquidityRatio.toFixed(1)}x. ${t("You may struggle to pay short-term debts. Consider building more liquid assets.")}`,
        health: "critical"
      })
    }

    // 5. Nivel de endeudamiento
    if (debtToAssetRatio <= 30) {
      result.push({
        icon: CheckCircle,
        title: t("Low Debt Level"),
        text: `${t("Your debt represents")} ${debtToAssetRatio.toFixed(0)}% ${t("of your total assets. This is a healthy level that gives you financial flexibility.")}`,
        health: "good"
      })
    } else if (debtToAssetRatio <= 60) {
      result.push({
        icon: AlertTriangle,
        title: t("Moderate Debt Level"),
        text: `${t("Your debt represents")} ${debtToAssetRatio.toFixed(0)}% ${t("of your total assets. Consider a debt reduction strategy.")}`,
        health: "warning"
      })
    } else if (debtToAssetRatio > 60 && totalAssets > 0) {
      result.push({
        icon: AlertTriangle,
        title: t("High Debt Level"),
        text: `${t("Your debt represents")} ${debtToAssetRatio.toFixed(0)}% ${t("of your total assets. This is a concerning level that requires attention.")}`,
        health: "critical"
      })
    }

    // 6. Tasa de ahorro
    if (savingsRate >= 20) {
      result.push({
        icon: TrendingUp,
        title: t("Excellent Savings Rate"),
        text: `${t("You are saving")} ${savingsRate.toFixed(0)}% ${t("of your income. This is above the recommended 20% and will help you achieve financial goals faster.")}`,
        health: "good"
      })
    } else if (savingsRate >= 10) {
      result.push({
        icon: CheckCircle,
        title: t("Good Savings Rate"),
        text: `${t("You are saving")} ${savingsRate.toFixed(0)}% ${t("of your income. Try to increase this to 20% or more for better long-term security.")}`,
        health: "warning"
      })
    } else if (savingsRate > 0) {
      result.push({
        icon: AlertTriangle,
        title: t("Low Savings Rate"),
        text: `${t("You are saving only")} ${savingsRate.toFixed(0)}% ${t("of your income. Consider ways to reduce expenses or increase income.")}`,
        health: "critical"
      })
    }

    // 7. Recomendación final
    const goodCount = result.filter(i => i.health === "good").length
    const criticalCount = result.filter(i => i.health === "critical").length

    if (criticalCount === 0 && goodCount >= 3) {
      result.push({
        icon: CheckCircle,
        title: t("Overall Assessment"),
        text: t("Your financial health looks strong. Keep maintaining good habits and focus on long-term wealth building."),
        health: "good"
      })
    } else if (criticalCount >= 2) {
      result.push({
        icon: AlertTriangle,
        title: t("Overall Assessment"),
        text: t("Your financial health needs attention in several areas. Prioritize building an emergency fund and reducing debt."),
        health: "critical"
      })
    } else {
      result.push({
        icon: Shield,
        title: t("Overall Assessment"),
        text: t("Your financial health is moderate. Focus on improving your weak areas while maintaining your strengths."),
        health: "warning"
      })
    }

    return result
  }, [derived, ratios, assets, liabilities, cashFlow, t])

  const healthColor = (h: "good" | "warning" | "critical") =>
    h === "good" ? "text-green-500" : h === "warning" ? "text-yellow-500" : "text-red-500"
  const healthBg = (h: "good" | "warning" | "critical") =>
    h === "good" ? "bg-green-500/10" : h === "warning" ? "bg-yellow-500/10" : "bg-red-500/10"
  const healthBadge = (h: "good" | "warning" | "critical") =>
    h === "good" ? "bg-green-500/10 text-green-500" : h === "warning" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          {t("AI Insight")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, i) => {
          const Icon = insight.icon
          return (
            <div key={i} className={`p-4 rounded-lg ${healthBg(insight.health)}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${healthColor(insight.health)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <Badge className={healthBadge(insight.health)}>
                      {insight.health === "good" ? "OK" : insight.health === "warning" ? "!" : "!!"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
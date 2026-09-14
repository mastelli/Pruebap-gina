"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
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

export function Balance2AiAnalysis({ derived, ratios, assets, liabilities, cashFlow }: AiAnalysisProps) {
  const { t } = useLanguage()

  const message = useMemo(() => {
    const {
      totalAssets, totalLiabilities, netWorth, currentAssets,
      currentLiabilities, monthlyCashFlow, emergencyFundMonths
    } = derived

    const totalIncome = cashFlow.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0)
    const totalExpenses = cashFlow.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0
    const liquidityRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0

    const parts: string[] = []

    // Greeting
    parts.push(t("Hello! Here is a summary of your financial health:"))

    // Net worth
    if (netWorth > 0) {
      parts.push(`${t("Your net worth is")} ${fmtEuro(netWorth)}, ${t("which means your assets exceed your liabilities.")}`)
    } else if (netWorth < 0) {
      parts.push(`${t("Your net worth is")} ${fmtEuro(netWorth)}. ${t("Your liabilities exceed your assets, so it is important to focus on reducing debt.")}`)
    }

    // Emergency fund
    if (emergencyFundMonths >= 6) {
      parts.push(`${t("Your emergency fund covers")} ${emergencyFundMonths.toFixed(1)} ${t("months of essential expenses, which is excellent.")}`)
    } else if (emergencyFundMonths >= 3) {
      parts.push(`${t("Your emergency fund covers")} ${emergencyFundMonths.toFixed(1)} ${t("months. Consider building up to 6 months for better security.")}`)
    } else {
      parts.push(`${t("Your emergency fund only covers")} ${emergencyFundMonths.toFixed(1)} ${t("months. It is recommended to have at least 3-6 months.")}`)
    }

    // Cash flow
    if (monthlyCashFlow > 0) {
      parts.push(`${t("Your monthly cash flow is positive at")} ${fmtEuro(monthlyCashFlow)}, ${t("which helps you build wealth over time.")}`)
    } else if (monthlyCashFlow < 0) {
      parts.push(`${t("Your monthly cash flow is negative at")} ${fmtEuro(monthlyCashFlow)}. ${t("You are spending more than you earn, so reviewing your expenses would be helpful.")}`)
    }

    // Liquidity
    if (liquidityRatio >= 2) {
      parts.push(`${t("Your liquidity ratio is")} ${liquidityRatio.toFixed(1)}x, ${t("showing strong financial flexibility.")}`)
    } else if (liquidityRatio >= 1) {
      parts.push(`${t("Your liquidity ratio is")} ${liquidityRatio.toFixed(1)}x. ${t("You can cover your short-term debts, but there is room for improvement.")}`)
    } else if (liquidityRatio > 0) {
      parts.push(`${t("Your liquidity ratio is")} ${liquidityRatio.toFixed(1)}x. ${t("You may struggle to pay short-term debts. Consider building more liquid assets.")}`)
    }

    // Debt level
    if (debtToAssetRatio <= 30) {
      parts.push(`${t("Your debt represents")} ${debtToAssetRatio.toFixed(0)}% ${t("of your assets, which is a healthy level.")}`)
    } else if (debtToAssetRatio <= 60) {
      parts.push(`${t("Your debt represents")} ${debtToAssetRatio.toFixed(0)}% ${t("of your assets. Consider a debt reduction strategy.")}`)
    } else if (debtToAssetRatio > 60 && totalAssets > 0) {
      parts.push(`${t("Your debt represents")} ${debtToAssetRatio.toFixed(0)}% ${t("of your assets. This is a concerning level that requires attention.")}`)
    }

    // Savings rate
    if (savingsRate >= 20) {
      parts.push(`${t("You are saving")} ${savingsRate.toFixed(0)}% ${t("of your income, which is above the recommended 20%.")}`)
    } else if (savingsRate >= 10) {
      parts.push(`${t("You are saving")} ${savingsRate.toFixed(0)}% ${t("of your income. Try to increase this to 20% or more.")}`)
    } else if (savingsRate > 0) {
      parts.push(`${t("You are saving only")} ${savingsRate.toFixed(0)}% ${t("of your income. Consider ways to reduce expenses or increase income.")}`)
    }

    // Overall recommendation
    const goodCount = ratios.filter(r => r.health === "good").length
    const criticalCount = ratios.filter(r => r.health === "critical").length

    if (criticalCount === 0 && goodCount >= 3) {
      parts.push(t("Overall, your financial health looks strong. Keep maintaining good habits and focus on long-term wealth building."))
    } else if (criticalCount >= 2) {
      parts.push(t("Overall, your financial health needs attention in several areas. Prioritize building an emergency fund and reducing debt."))
    } else {
      parts.push(t("Overall, your financial health is moderate. Focus on improving your weak areas while maintaining your strengths."))
    }

    return parts.join(" ")
  }, [derived, ratios, assets, liabilities, cashFlow, t])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          {t("AI Insight")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </CardContent>
    </Card>
  )
}
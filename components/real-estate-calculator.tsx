"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/lib/i18n"

export function RealEstateCalculator() {
  const { lang, t } = useLanguage()
  const sym = lang === "es" ? "€" : "$"
  const currency = lang === "es" ? "EUR" : "USD"

  const [price, setPrice] = useState("")
  const [itp, setItp] = useState("")
  const [ajd, setAjd] = useState("")
  const [renovation, setRenovation] = useState("")
  const [rent, setRent] = useState("")
  const [vacancy, setVacancy] = useState("")
  const [ibi, setIbi] = useState("")
  const [cadastralPct, setCadastralPct] = useState("")
  const [leveraged, setLeveraged] = useState(false)
  const [initialContribution, setInitialContribution] = useState("")
  const [mortgageTerm, setMortgageTerm] = useState("")
  const [mortgageRate, setMortgageRate] = useState("")
  const [monthlyCosts, setMonthlyCosts] = useState("")

  const [results, setResults] = useState<{
    priceVal: number
    initialEntry: number
    purchaseTax: number
    loanAmount: number
    totalInvestment: number
    monthlyCashFlow: number
    annualCashFlow: number
    grossYield: number
    netYield: number
    capRate: number
    cashOnCash: number
    effectiveRent: number
    monthlyMortgage: number
    annualExpenses: number
    priceToRentRatio: number
    breakevenMonths: number
  } | null>(null)

  const formatCurrency = (v: number) =>
    v.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

  const formatPct = (v: number) =>
    v.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + "%"

  const p = (v: string) => parseFloat(v) || 0

  const calculate = () => {
    const priceVal = p(price)
    if (priceVal <= 0) return

    const itpVal = p(itp)
    const ajdVal = p(ajd)
    const totalTax = itpVal + ajdVal
    const renovationVal = p(renovation)
    const rentVal = p(rent)
    const vacancyVal = p(vacancy) / 100
    const ibiVal = (p(ibi) / 100) * priceVal
    const cadastralVal = (p(cadastralPct) / 100) * priceVal
    const annualPropertyTaxes = ibiVal + cadastralVal
    const monthlyPropertyTaxes = annualPropertyTaxes / 12
    const monthlyCostsVal = p(monthlyCosts)

    let monthlyMortgage = 0
    let loanAmount = 0
    let initialEntry = priceVal + renovationVal

    if (leveraged) {
      const contributionVal = p(initialContribution)
      const termMonths = (parseInt(mortgageTerm) || 0) * 12
      const annualMortRate = p(mortgageRate) / 100
      const monthlyMortRate = annualMortRate / 12
      loanAmount = priceVal - contributionVal

      if (termMonths > 0 && loanAmount > 0) {
        if (monthlyMortRate > 0) {
          monthlyMortgage =
            loanAmount *
            (monthlyMortRate * Math.pow(1 + monthlyMortRate, termMonths)) /
            (Math.pow(1 + monthlyMortRate, termMonths) - 1)
        } else {
          monthlyMortgage = loanAmount / termMonths
        }
      }

      initialEntry = contributionVal
    }

    const totalInvestment = initialEntry + totalTax

    const effectiveRent = rentVal * (1 - vacancyVal)
    const annualRent = effectiveRent * 12
    const annualExpenses = (monthlyPropertyTaxes + monthlyCostsVal + monthlyMortgage) * 12
    const annualCashFlow = annualRent - annualExpenses
    const monthlyCashFlow = annualCashFlow / 12

    const grossYield = totalInvestment > 0 ? (annualRent / totalInvestment) * 100 : 0
    const netYield = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0
    const capRate = priceVal > 0 ? ((annualRent - (monthlyPropertyTaxes + monthlyCostsVal) * 12) / priceVal) * 100 : 0
    const cashOnCash = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0

    const priceToRentRatio = effectiveRent > 0 ? priceVal / (effectiveRent * 12) : 0

    const breakevenMonths = monthlyCashFlow > 0 ? Math.ceil(totalInvestment / monthlyCashFlow) : 0

    setResults({
      priceVal,
      initialEntry: Math.round(initialEntry),
      purchaseTax: Math.round(totalTax),
      loanAmount: Math.round(loanAmount),
      totalInvestment: Math.round(totalInvestment),
      monthlyCashFlow: Math.round(monthlyCashFlow),
      annualCashFlow: Math.round(annualCashFlow),
      grossYield,
      netYield,
      capRate,
      cashOnCash,
      effectiveRent: Math.round(effectiveRent),
      monthlyMortgage: Math.round(monthlyMortgage),
      annualExpenses: Math.round(annualExpenses),
      priceToRentRatio,
      breakevenMonths,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("Real Estate Calculator")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t("Property Price")} ({sym})</Label>
            <Input type="number" placeholder="250000" value={price} onChange={(e) => setPrice(e.target.value)} min={0} />
          </div>
          <div className="space-y-2">
            <Label>{t("Estimated Renovation")} ({sym})</Label>
            <Input type="number" placeholder="15000" value={renovation} onChange={(e) => setRenovation(e.target.value)} min={0} />
          </div>
          <div className="space-y-2">
            <Label>{t("Expected Rent")} ({sym}/{lang === "es" ? "mes" : "mo"})</Label>
            <Input type="number" placeholder="1200" value={rent} onChange={(e) => setRent(e.target.value)} min={0} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">{t("Purchase Tax")}</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">{t("Transfer Tax (ITP)")}</Label>
              <Input type="number" placeholder={lang === "es" ? "ej: 10000" : "e.g. 10000"} value={itp} onChange={(e) => setItp(e.target.value)} min={0} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">{t("Documented Acts (AJD)")}</Label>
              <Input type="number" placeholder={lang === "es" ? "ej: 3000" : "e.g. 3000"} value={ajd} onChange={(e) => setAjd(e.target.value)} min={0} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("Purchase Tax Costs")}: <span className="font-semibold">{formatCurrency(p(itp) + p(ajd))}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>{t("Vacancy")} (%)</Label>
            <Input type="number" placeholder="8" value={vacancy} onChange={(e) => setVacancy(e.target.value)} min={0} max={100} step={0.5} />
          </div>
          <div className="flex items-end pb-1">
            <p className="text-xs text-muted-foreground">{t("% of time the property will be rented")}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">{t("Annual Property Taxes")}</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">{t("Property Tax (IBI)")} (%)</Label>
              <Input type="number" placeholder="0.35" value={ibi} onChange={(e) => setIbi(e.target.value)} min={0} step={0.01} />
              <p className="text-xs text-muted-foreground">0.35 {lang === "es" ? "= valor habitual" : "= typical"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">{t("% of Cadastral Value")} (%)</Label>
              <Input type="number" placeholder="0.4" value={cadastralPct} onChange={(e) => setCadastralPct(e.target.value)} min={0} step={0.01} />
              <p className="text-xs text-muted-foreground">0.4 {lang === "es" ? "= valor habitual" : "= typical"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch id="leveraged" checked={leveraged} onCheckedChange={setLeveraged} />
            <Label htmlFor="leveraged" className="text-base font-semibold cursor-pointer">{t("Leveraged Property")}</Label>
          </div>

          {leveraged && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-0 md:pl-6">
              <div className="space-y-1">
                <Label className="text-sm">{t("Initial Contribution")} ({sym})</Label>
                <Input type="number" placeholder={lang === "es" ? "ej: 30000" : "e.g. 30000"} value={initialContribution} onChange={(e) => setInitialContribution(e.target.value)} min={0} />
                <p className="text-xs text-muted-foreground">{t("Banks usually require 10% of the property + expenses")}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">{t("Mortgage Term")} ({lang === "es" ? "años" : "years"})</Label>
                <Input type="number" placeholder="30" value={mortgageTerm} onChange={(e) => setMortgageTerm(e.target.value)} min={1} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">{t("Mortgage Interest Rate")} (%)</Label>
                <Input type="number" placeholder="3.5" value={mortgageRate} onChange={(e) => setMortgageRate(e.target.value)} min={0} step={0.1} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label>{t("Monthly Costs")} ({sym}/{lang === "es" ? "mes" : "mo"})</Label>
          <Input type="number" placeholder="200" value={monthlyCosts} onChange={(e) => setMonthlyCosts(e.target.value)} min={0} />
          <p className="text-xs text-muted-foreground">{t("HOA fees, maintenance, etc.")}</p>
        </div>

        <Button className="w-full" onClick={calculate}>{t("Calculate")}</Button>

        {/* Results */}
        {results && (
          <div className="space-y-6 pt-6 border-t">

            {/* Section 1: Summary */}
            <div className="space-y-0">
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Initial Entry")}</span>
                <span className="text-sm font-medium">{formatCurrency(results.initialEntry)}</span>
              </div>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Purchase Tax Costs")}</span>
                <span className="text-sm font-medium">{formatCurrency(results.purchaseTax)}</span>
              </div>
              <div className="border-b border-border" />

              {leveraged && (
                <>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">{t("Loan Amount")}</span>
                    <span className="text-sm font-medium">{formatCurrency(results.loanAmount)}</span>
                  </div>
                  <div className="border-b border-border" />
                </>
              )}

              <div className="flex justify-between py-3">
                <span className="text-base font-bold">{t("Total Investment")}</span>
                <span className="text-base font-bold">{formatCurrency(results.totalInvestment)}</span>
              </div>
            </div>

            {/* Section 2: ROI on Capital */}
            <div className="space-y-0">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">{t("ROI on Capital")}</h4>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Gross Yield")}</span>
                <span className="text-sm font-medium">{formatPct(results.grossYield)}</span>
              </div>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Net Yield")}</span>
                <span className={`text-sm font-medium ${results.netYield >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPct(results.netYield)}
                </span>
              </div>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Cash on Cash Return")}</span>
                <span className={`text-sm font-medium ${results.cashOnCash >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatPct(results.cashOnCash)}
                </span>
              </div>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Cap Rate")}</span>
                <span className="text-sm font-medium">{formatPct(results.capRate)}</span>
              </div>
            </div>

            {/* Section 3: Cash Flow */}
            <div className="space-y-0">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">{t("Cash Flow")}</h4>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Expected Rent")}</span>
                <span className="text-sm font-medium">{formatCurrency(p(rent))}</span>
              </div>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Effective Rent")}</span>
                <span className="text-sm font-medium">{formatCurrency(results.effectiveRent)}</span>
              </div>
              <div className="border-b border-border" />

              {leveraged && (
                <>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">{t("Monthly Mortgage")}</span>
                    <span className="text-sm font-medium">{formatCurrency(results.monthlyMortgage)}</span>
                  </div>
                  <div className="border-b border-border" />
                </>
              )}

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Annual Property Cost")}</span>
                <span className="text-sm font-medium">{formatCurrency(results.annualExpenses)}</span>
              </div>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm font-semibold">{t("Monthly Cash Flow")}</span>
                <span className={`text-sm font-bold ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(results.monthlyCashFlow)}
                </span>
              </div>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm font-semibold">{t("Annual Cash Flow")}</span>
                <span className={`text-sm font-bold ${results.annualCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(results.annualCashFlow)}
                </span>
              </div>
            </div>

            {/* Section 4: Additional Metrics */}
            <div className="space-y-0">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">{t("Additional Metrics")}</h4>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Price to Rent Ratio")}</span>
                <span className="text-sm font-medium">{results.priceToRentRatio.toFixed(1)}</span>
              </div>
              <div className="border-b border-border" />

              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">{t("Breakeven")}</span>
                <span className="text-sm font-medium">
                  {results.breakevenMonths > 0
                    ? results.breakevenMonths === 1
                      ? t("1 month to recoup investment")
                      : `${results.breakevenMonths} ${t("months to recoup investment")}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import type {
  RealEstateInput,
  SensitivityResult,
} from "./real-estate-types"
import { calculateKPIs } from "./real-estate-formulas"

export function analyzeSensitivity(
  base: RealEstateInput,
  variable: "price" | "rent" | "interestRate" | "ltv" | "appreciation",
  variations: number[],  // percentage offsets, e.g. [-20, -10, 0, 10, 20]
  kpiKey: keyof ReturnType<typeof calculateKPIs> = "roi",
): SensitivityResult {
  const labels: Record<string, string> = {
    price: "Purchase Price",
    rent: "Monthly Rent",
    interestRate: "Interest Rate",
    ltv: "Loan-to-Value",
    appreciation: "Appreciation",
  }

  const kpiLabels: Record<string, string> = {
    roi: "ROI",
    netYield: "Net Yield",
    capRate: "Cap Rate",
    cashOnCashReturn: "Cash-on-Cash",
    monthlyCashFlow: "Monthly Cash Flow",
    annualCashFlow: "Annual Cash Flow",
    grossYield: "Gross Yield",
    totalProfit: "Total Profit",
    breakevenMonths: "Breakeven (months)",
  }

  // Calculate for each variation percentage
  const kpiResults = variations.map((pct) => {
    const input = JSON.parse(JSON.stringify(base)) as RealEstateInput
    const factor = 1 + pct / 100

    switch (variable) {
      case "price":
        input.purchase.price *= factor
        break
      case "rent":
        input.rental.monthlyRent *= factor
        break
      case "interestRate":
        input.financing.annualInterestRate *= factor
        break
      case "ltv":
        input.financing.ltvPct = Math.min(100, Math.max(0, input.financing.ltvPct * factor))
        input.financing.mortgageAmount = input.purchase.price * input.financing.ltvPct / 100
        input.financing.downPayment = input.purchase.price - input.financing.mortgageAmount
        break
      case "appreciation":
        input.appreciation.annualAppreciationPct *= factor
        break
    }

    return calculateKPIs(input)
  })

  // Build rows: one per KPI
  const rows = Object.entries(kpiLabels).map(([key, label]) => ({
    label,
    values: kpiResults.map((kpi) => {
      const val = kpi[key as keyof typeof kpi]
      return typeof val === "number" ? val : 0
    }),
  }))

  return {
    variations,
    variableLabel: labels[variable] ?? variable,
    rows,
  }
}

import type {
  RealEstateInput,
  SensitivityResult,
  SensitivityRow,
} from "./real-estate-types"
import { calculateKPIs } from "./real-estate-formulas"

const labels: Record<string, string> = {
  price: "Precio de compra",
  rent: "Alquiler mensual",
  interestRate: "Tipo de interés",
  ltv: "% Financiación (LTV)",
  appreciation: "Revalorización",
}

const kpiRows: { key: string; label: string; kind: SensitivityRow["kind"] }[] = [
  { key: "monthlyCashFlow", label: "Cash Flow / mes", kind: "currency" },
  { key: "annualCashFlow", label: "Cash Flow / año", kind: "currency" },
  { key: "annualWealthCreated", label: "Patrimonio / año", kind: "currency" },
  { key: "totalProfit", label: "Beneficio Total", kind: "currency" },
  { key: "equity", label: "Equity final", kind: "currency" },
  { key: "roi", label: "ROI Total", kind: "percent" },
  { key: "roiAnnualized", label: "ROI Anualizado", kind: "percent" },
  { key: "yieldOnEquity", label: "ROI sobre Capital", kind: "percent" },
  { key: "capRate", label: "Cap Rate", kind: "percent" },
  { key: "grossYield", label: "Rentabilidad Bruta", kind: "percent" },
  { key: "netYield", label: "Rentabilidad Neta", kind: "percent" },
  { key: "breakevenMonths", label: "Punto de equilibrio", kind: "months" },
]

export function analyzeSensitivity(
  base: RealEstateInput,
  variable: "price" | "rent" | "interestRate" | "ltv" | "appreciation",
  variations: number[],  // percentage offsets, e.g. [-20, -10, 0, 10, 20]
): SensitivityResult {
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
  const rows: SensitivityRow[] = kpiRows.map(({ key, label, kind }) => ({
    label,
    kind,
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
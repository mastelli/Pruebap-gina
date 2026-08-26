export type Currency = "EUR" | "USD" | "GBP"

// ── Purchase ──────────────────────────────────────────
export interface PurchaseData {
  price: number
  purchaseExpenses: number       // notary, registry, management
  taxes: number                  // ITP / stamp duty etc.
  renovationCost: number
  furnitureCost: number
  otherInitialCost: number
}

export function totalInitialInvestment(p: PurchaseData): number {
  return p.price + p.purchaseExpenses + p.taxes + p.renovationCost + p.furnitureCost + p.otherInitialCost
}

// ── Financing ─────────────────────────────────────────
export interface FinancingData {
  enabled: boolean
  ltvPct: number                 // 0-100, loan-to-value percentage
  mortgageAmount: number         // calculated from ltv or manually set
  downPayment: number            // price - mortgageAmount
  annualInterestRate: number     // e.g. 3.5 for 3.5%
  termYears: number
  type: "fixed" | "variable"
  paymentFrequency: "monthly" | "quarterly"
}

// ── Rental income ─────────────────────────────────────
export interface RentalData {
  monthlyRent: number
  otherMonthlyIncome: number
  rentedMonthsPerYear: number    // 1-12
  vacancyRate: number            // 0-100, percentage
  annualRentGrowthPct: number    // e.g. 2 for 2%
}

// ── Recurring expenses ────────────────────────────────
export interface ExpensesData {
  communityFee: number           // monthly
  ibi: number                    // annual
  insurance: number              // annual
  maintenance: number            // annual
  repairs: number                // annual
  propertyManagementPct: number  // % of gross rental income
  utilities: number              // monthly (if owner pays)
  otherTaxes: number             // annual
  otherExpenses: number          // annual
  variableExpensePct: number     // % of income for variable costs
}

// ── Appreciation / assumptions ────────────────────────
export interface AppreciationData {
  annualAppreciationPct: number  // e.g. 3 for 3%
  investmentHorizonYears: number
}

// ── Full input model ──────────────────────────────────
export interface RealEstateInput {
  purchase: PurchaseData
  financing: FinancingData
  rental: RentalData
  expenses: ExpensesData
  appreciation: AppreciationData
  currency: Currency
}

// ── Mortgage amortization line ────────────────────────
export interface AmortizationLine {
  year: number
  openingBalance: number
  annualPayment: number          // total paid in the year
  principalPaid: number          // capital amortized
  interestPaid: number           // interest
  closingBalance: number
}

// ── Year-by-year projection ───────────────────────────
export interface YearProjection {
  year: number
  propertyValue: number
  grossRentalIncome: number
  effectiveRentalIncome: number
  otherIncome: number
  totalIncome: number
  operatingExpenses: number
  financingCosts: number        // mortgage payments
  totalExpenses: number
  netOperatingIncome: number    // NOI = income - opex
  annualCashFlow: number        // NOI - financing
  cumulativeCashFlow: number
  equity: number                // propertyValue - remainingDebt
  remainingDebt: number
  loanPaidOff: boolean
}

// ── KPI results ───────────────────────────────────────
export interface RealEstateKPIs {
  grossYield: number              // % = grossRental / price × 100
  netYield: number                // % = netIncome / totalInvestment × 100
  capRate: number                 // % = NOI / propertyValue × 100
  cashOnCashReturn: number        // % = annualCashFlow / equityInvested × 100
  roi: number                     // % = totalProfit / totalInvestment × 100
  roiAnnualized: number           // % annualized
  monthlyCashFlow: number
  annualCashFlow: number
  totalProfit: number             // equity + cumulativeCashFlow - totalInvestment
  equity: number
  breakevenMonths: number         // months to recoup initial investment
  monthlyMortgage: number
  annualMortgage: number
  effectiveAnnualIncome: number
  annualOperatingExpenses: number
  noi: number
  totalInvestment: number
  ltv: number
  priceToRentRatio: number
}

// ── Scenario ──────────────────────────────────────────
export interface ScenarioOverrides {
  appreciationPct?: number
  rentMonthly?: number
  vacancyRate?: number
  interestRate?: number
  expenseMultiplier?: number     // multiply all expenses by this
}

export interface ScenarioResult {
  name: string
  kpis: RealEstateKPIs
  projection: YearProjection[]
}

// ── Sensitivity ───────────────────────────────────────
export interface SensitivityRow {
  label: string
  values: number[]               // KPI values for each variation
}

export interface SensitivityResult {
  variations: number[]           // e.g. [-20, -10, 0, +10, +20]
  variableLabel: string
  rows: SensitivityRow[]
}

import type {
  RealEstateInput,
  ScenarioOverrides,
  ScenarioResult,
} from "./real-estate-types"
import { calculateKPIs, buildProjection } from "./real-estate-formulas"
import { totalInitialInvestment } from "./real-estate-types"

function applyOverrides(
  base: RealEstateInput,
  overrides: ScenarioOverrides,
): RealEstateInput {
  const input = JSON.parse(JSON.stringify(base)) as RealEstateInput

  if (overrides.appreciationPct !== undefined) {
    input.appreciation.annualAppreciationPct = overrides.appreciationPct
  }
  if (overrides.rentMonthly !== undefined) {
    input.rental.monthlyRent = overrides.rentMonthly
  }
  if (overrides.vacancyRate !== undefined) {
    input.rental.vacancyRate = overrides.vacancyRate
  }
  if (overrides.interestRate !== undefined) {
    input.financing.annualInterestRate = overrides.interestRate
  }
  if (overrides.expenseMultiplier !== undefined && overrides.expenseMultiplier !== 1) {
    const m = overrides.expenseMultiplier
    input.expenses.communityFee *= m
    input.expenses.ibi *= m
    input.expenses.insurance *= m
    input.expenses.maintenance *= m
    input.expenses.repairs *= m
    input.expenses.utilities *= m
    input.expenses.otherTaxes *= m
    input.expenses.otherExpenses *= m
  }
  return input
}

export function runScenario(
  base: RealEstateInput,
  name: string,
  overrides: ScenarioOverrides,
): ScenarioResult {
  const input = applyOverrides(base, overrides)
  return {
    name,
    kpis: calculateKPIs(input),
    projection: buildProjection(input),
  }
}

export function runAllScenarios(
  base: RealEstateInput,
): ScenarioResult[] {
  return [
    runScenario(base, "Conservative", {
      appreciationPct: Math.max(0, base.appreciation.annualAppreciationPct - 2),
      vacancyRate: Math.min(100, base.rental.vacancyRate + 10),
      interestRate: base.financing.annualInterestRate + 1,
      expenseMultiplier: 1.2,
    }),
    runScenario(base, "Base", {}),
    runScenario(base, "Optimistic", {
      appreciationPct: base.appreciation.annualAppreciationPct + 2,
      rentMonthly: base.rental.monthlyRent * 1.05,
      vacancyRate: Math.max(0, base.rental.vacancyRate - 5),
      interestRate: Math.max(0, base.financing.annualInterestRate - 0.5),
      expenseMultiplier: 0.9,
    }),
  ]
}

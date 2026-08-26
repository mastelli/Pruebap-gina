import {
  type RealEstateInput,
  type RealEstateKPIs,
  type AmortizationLine,
  type YearProjection,
  totalInitialInvestment,
} from "./real-estate-types"

// ── Helpers ───────────────────────────────────────────
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function safeDiv(num: number, den: number): number {
  if (den === 0 || !isFinite(den)) return 0
  const r = num / den
  return isFinite(r) ? r : 0
}

// ── Mortgage ──────────────────────────────────────────
export function monthlyMortgagePayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
): number {
  if (principal <= 0 || termYears <= 0) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) return principal / (termYears * 12)
  const n = termYears * 12
  return round2(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
}

export function annualMortgagePayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
): number {
  return round2(monthlyMortgagePayment(principal, annualRatePct, termYears) * 12)
}

export function totalFinancingCost(
  principal: number,
  annualRatePct: number,
  termYears: number,
): number {
  return round2(annualMortgagePayment(principal, annualRatePct, termYears) * termYears - principal)
}

// ── Amortization schedule ─────────────────────────────
export function buildAmortizationSchedule(
  principal: number,
  annualRatePct: number,
  termYears: number,
): AmortizationLine[] {
  const schedule: AmortizationLine[] = []
  const monthlyPmt = monthlyMortgagePayment(principal, annualRatePct, termYears)
  const r = annualRatePct / 100 / 12
  let balance = principal

  for (let year = 1; year <= termYears; year++) {
    const opening = balance
    let annualPrincipal = 0
    let annualInterest = 0

    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break
      const interest = balance * r
      const principalPart = Math.min(monthlyPmt - interest, balance)
      annualInterest += interest
      annualPrincipal += principalPart
      balance = Math.max(0, Math.round((balance - principalPart) * 100) / 100)
    }

    schedule.push({
      year,
      openingBalance: round2(opening),
      annualPayment: round2(annualPrincipal + annualInterest),
      principalPaid: round2(annualPrincipal),
      interestPaid: round2(annualInterest),
      closingBalance: year === termYears ? 0 : round2(Math.max(0, balance)),
    })
  }
  return schedule
}

// ── Resolved annual values ────────────────────────────
export function resolveYearValues(
  input: RealEstateInput,
  year: number,
  prevDebt: number,
): {
  grossIncome: number
  otherIncome: number
  totalIncome: number
  operatingExpenses: number
  financingCost: number
  newDebt: number
  propertyValue: number
} {
  const { purchase, financing, rental, expenses } = input
  const growthFactor = Math.pow(1 + rental.annualRentGrowthPct / 100, year - 1)
  const rentGrowth = year <= 1 ? 1 : growthFactor

  const monthlyRent = rental.monthlyRent * rentGrowth
  const monthlyOther = rental.otherMonthlyIncome * rentGrowth
  const grossIncome = monthlyRent * 12
  const otherIncome = monthlyOther * 12
  const grossWithOther = grossIncome + otherIncome
  const effectiveGrossIncome = grossIncome * (1 - rental.vacancyRate / 100)
      + otherIncome * (1 - rental.vacancyRate / 100)

  // Operating expenses (grow 2% per year for inflation after year 1)
  const expGrowth = year <= 1 ? 1 : Math.pow(1.02, year - 1)
  const mgmtFee = effectiveGrossIncome * expenses.propertyManagementPct / 100
  const operatingExpenses =
    (expenses.communityFee * 12 +
      expenses.ibi +
      expenses.insurance +
      expenses.maintenance +
      expenses.repairs +
      mgmtFee +
      expenses.utilities * 12 +
      expenses.otherTaxes +
      expenses.otherExpenses +
      effectiveGrossIncome * expenses.variableExpensePct / 100) * expGrowth

  // Financing
  const amortSchedule = buildAmortizationSchedule(
    financing.mortgageAmount,
    financing.annualInterestRate,
    financing.termYears,
  )
  const amort = amortSchedule.find(a => a.year === year)
  const financingCost = amort ? amort.annualPayment : 0
  const newDebt = amort ? amort.closingBalance : 0

  // Property value
  const propertyValue = purchase.price * Math.pow(1 + input.appreciation.annualAppreciationPct / 100, year)

  return {
    grossIncome,
    otherIncome,
    totalIncome: round2(effectiveGrossIncome),
    operatingExpenses: round2(operatingExpenses),
    financingCost: round2(financingCost),
    newDebt: round2(newDebt),
    propertyValue: round2(propertyValue),
  }
}

// ── Year projection ───────────────────────────────────
export function projectYear(
  input: RealEstateInput,
  year: number,
  prevDebt: number,
  prevCumulativeCashFlow: number,
): YearProjection {
  const v = resolveYearValues(input, year, prevDebt)
  const noi = round2(v.totalIncome - v.operatingExpenses)
  const annualCashFlow = round2(noi - v.financingCost)
  const cumulativeCashFlow = round2(prevCumulativeCashFlow + annualCashFlow)
  const equity = round2(v.propertyValue - v.newDebt)

  return {
    year,
    propertyValue: v.propertyValue,
    grossRentalIncome: round2(v.grossIncome),
    effectiveRentalIncome: round2(v.totalIncome),
    otherIncome: round2(v.otherIncome),
    totalIncome: round2(v.totalIncome),
    operatingExpenses: v.operatingExpenses,
    financingCosts: v.financingCost,
    totalExpenses: round2(v.operatingExpenses + v.financingCost),
    netOperatingIncome: noi,
    annualCashFlow,
    cumulativeCashFlow,
    equity,
    remainingDebt: v.newDebt,
    loanPaidOff: v.newDebt <= 0,
  }
}

export function buildProjection(input: RealEstateInput): YearProjection[] {
  const years = input.appreciation.investmentHorizonYears
  const projections: YearProjection[] = []
  let prevDebt = input.financing.enabled ? input.financing.mortgageAmount : 0
  let prevCumCF = 0

  for (let y = 1; y <= years; y++) {
    const p = projectYear(input, y, prevDebt, prevCumCF)
    projections.push(p)
    prevDebt = p.remainingDebt
    prevCumCF = p.cumulativeCashFlow
  }
  return projections
}

// ── Breakeven ─────────────────────────────────────────
export function breakevenMonths(input: RealEstateInput): number {
  const totalInv = totalInitialInvestment(input.purchase)
  const loanAmount = input.financing.enabled ? input.financing.mortgageAmount : 0
  const equityInvested = totalInv - loanAmount
  const projections = buildProjection(input)
  for (const p of projections) {
    if (p.cumulativeCashFlow >= equityInvested) {
      // Interpolate within the year
      const prevCum = p.year === 1 ? 0 : projections[p.year - 2].cumulativeCashFlow
      const needed = equityInvested - prevCum
      const cfThisYear = p.annualCashFlow
      if (cfThisYear <= 0) continue
      const fraction = needed / cfThisYear
      return round2((p.year - 1) * 12 + fraction * 12)
    }
  }
  return -1 // never breaks even within horizon
}

// ── Full KPI calculation ──────────────────────────────
export function calculateKPIs(input: RealEstateInput): RealEstateKPIs {
  const totalInv = totalInitialInvestment(input.purchase)
  const projection = buildProjection(input)
  const finalYear = projection[projection.length - 1]

  const grossRentalIncome = input.rental.monthlyRent * 12
  const effectiveGrossIncome = projection[0]?.totalIncome ?? 0
  const annualOpEx = projection[0]?.operatingExpenses ?? 0
  const annualFinancing = projection[0]?.financingCosts ?? 0
  const noi = projection[0]?.netOperatingIncome ?? 0
  const annualCF = projection[0]?.annualCashFlow ?? 0
  const monthlyCF = round2(annualCF / 12)

  // Equity invested = total investment - loan amount (if financed)
  const loanAmount = input.financing.enabled ? input.financing.mortgageAmount : 0
  const equityInvested = totalInv - loanAmount

  const propertyValueAtEnd = finalYear?.propertyValue ?? input.purchase.price
  const equityAtEnd = finalYear?.equity ?? equityInvested
  const cumulativeCF = finalYear?.cumulativeCashFlow ?? 0

  // Returns
  const grossYield = round2(safeDiv(grossRentalIncome, input.purchase.price) * 100)
  const netIncome = effectiveGrossIncome - annualOpEx
  const netYield = round2(safeDiv(netIncome, totalInv) * 100)
  const capRate = round2(safeDiv(noi, propertyValueAtEnd) * 100)
  const cashOnCash = round2(safeDiv(annualCF, equityInvested > 0 ? equityInvested : totalInv) * 100)

  // Total profit at horizon
  const totalProfit = round2(
    equityAtEnd + cumulativeCF - equityInvested,
  )
  const roi = round2(safeDiv(totalProfit, equityInvested) * 100)
  const horizon = input.appreciation.investmentHorizonYears
  const roiAnnualized = horizon > 0
    ? round2((Math.pow(1 + roi / 100, 1 / horizon) - 1) * 100)
    : 0

  const priceToRent = input.rental.monthlyRent > 0
    ? round2(input.purchase.price / (input.rental.monthlyRent * 12))
    : 0

  const ltv = input.purchase.price > 0
    ? round2(safeDiv(loanAmount, input.purchase.price) * 100)
    : 0

  return {
    grossYield,
    netYield,
    capRate,
    cashOnCashReturn: cashOnCash,
    roi,
    roiAnnualized,
    monthlyCashFlow: monthlyCF,
    annualCashFlow: annualCF,
    totalProfit,
    equity: equityAtEnd,
    breakevenMonths: breakevenMonths(input),
    monthlyMortgage: monthlyMortgagePayment(loanAmount, input.financing.annualInterestRate, input.financing.termYears),
    annualMortgage: annualMortgagePayment(loanAmount, input.financing.annualInterestRate, input.financing.termYears),
    effectiveAnnualIncome: round2(effectiveGrossIncome),
    annualOperatingExpenses: round2(annualOpEx),
    noi: round2(noi),
    totalInvestment: round2(totalInv),
    ltv,
    priceToRentRatio: priceToRent,
  }
}

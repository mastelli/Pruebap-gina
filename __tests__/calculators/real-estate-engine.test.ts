import { describe, it, expect } from "vitest"
import {
  monthlyMortgagePayment,
  annualMortgagePayment,
  totalFinancingCost,
  buildAmortizationSchedule,
  calculateKPIs,
  buildProjection,
  breakevenMonths,
} from "@/lib/calculators/real-estate-formulas"
import { totalInitialInvestment } from "@/lib/calculators/real-estate-types"
import type { RealEstateInput } from "@/lib/calculators/real-estate-types"

// ── Default test fixture ──────────────────────────────
function baseInput(overrides: Partial<RealEstateInput> = {}): RealEstateInput {
  return {
    purchase: {
      price: 150_000,
      purchaseExpenses: 3_000,
      taxes: 12_000,
      renovationCost: 5_000,
      furnitureCost: 2_000,
      otherInitialCost: 1_000,
    },
    financing: {
      enabled: true,
      ltvPct: 70,
      mortgageAmount: 105_000,
      downPayment: 45_000,
      annualInterestRate: 3,
      termYears: 30,
      type: "fixed",
      paymentFrequency: "monthly",
    },
    rental: {
      monthlyRent: 900,
      otherMonthlyIncome: 0,
      rentedMonthsPerYear: 12,
      vacancyRate: 5,
      annualRentGrowthPct: 2,
    },
    expenses: {
      communityFee: 50,
      ibi: 600,
      insurance: 300,
      maintenance: 500,
      repairs: 300,
      propertyManagementPct: 8,
      utilities: 0,
      otherTaxes: 0,
      otherExpenses: 200,
      variableExpensePct: 0,
    },
    appreciation: {
      annualAppreciationPct: 2,
      investmentHorizonYears: 10,
    },
    currency: "EUR",
    ...overrides,
  }
}

// ── Mortgage helpers ──────────────────────────────────
describe("monthlyMortgagePayment", () => {
  it("calculates correctly for standard loan", () => {
    // 100k, 3%, 30y
    const pmt = monthlyMortgagePayment(100_000, 3, 30)
    expect(pmt).toBeCloseTo(421.6, 0)
  })

  it("returns 0 for zero principal", () => {
    expect(monthlyMortgagePayment(0, 3, 30)).toBe(0)
  })

  it("returns 0 for zero term", () => {
    expect(monthlyMortgagePayment(100_000, 3, 0)).toBe(0)
  })

  it("handles 0% interest (interest-free)", () => {
    const pmt = monthlyMortgagePayment(120_000, 0, 10)
    expect(pmt).toBe(1000)
  })

  it("handles high interest rate", () => {
    const pmt = monthlyMortgagePayment(100_000, 10, 30)
    expect(pmt).toBeGreaterThan(800)
    expect(pmt).toBeLessThan(900)
  })
})

describe("annualMortgagePayment", () => {
  it("is 12× monthly", () => {
    const monthly = monthlyMortgagePayment(100_000, 3, 30)
    const annual = annualMortgagePayment(100_000, 3, 30)
    expect(annual).toBeCloseTo(monthly * 12, 0)
  })
})

describe("totalFinancingCost", () => {
  it("equals total payments minus principal", () => {
    const cost = totalFinancingCost(100_000, 3, 30)
    const annual = annualMortgagePayment(100_000, 3, 30)
    expect(cost).toBeCloseTo(annual * 30 - 100_000, 0)
  })

  it("is 0 for interest-free loan", () => {
    expect(totalFinancingCost(100_000, 0, 10)).toBe(0)
  })
})

// ── Amortization schedule ─────────────────────────────
describe("buildAmortizationSchedule", () => {
  it("has correct number of years", () => {
    const schedule = buildAmortizationSchedule(100_000, 3, 30)
    expect(schedule).toHaveLength(30)
  })

  it("first year has more interest than principal", () => {
    const schedule = buildAmortizationSchedule(100_000, 3, 30)
    expect(schedule[0].interestPaid).toBeGreaterThan(schedule[0].principalPaid)
  })

  it("last year closes at 0", () => {
    const schedule = buildAmortizationSchedule(100_000, 3, 30)
    expect(schedule[29].closingBalance).toBe(0)
  })

  it("opening balance of year 2 = closing of year 1", () => {
    const schedule = buildAmortizationSchedule(100_000, 3, 30)
    expect(schedule[1].openingBalance).toBeCloseTo(schedule[0].closingBalance, 0)
  })

  it("handles zero principal", () => {
    const schedule = buildAmortizationSchedule(0, 3, 30)
    expect(schedule).toHaveLength(30)
    expect(schedule[0].annualPayment).toBe(0)
  })
})

// ── totalInitialInvestment ────────────────────────────
describe("totalInitialInvestment", () => {
  it("sums all purchase components", () => {
    const inv = totalInitialInvestment({
      price: 100_000,
      purchaseExpenses: 2_000,
      taxes: 8_000,
      renovationCost: 5_000,
      furnitureCost: 3_000,
      otherInitialCost: 1_000,
    })
    expect(inv).toBe(119_000)
  })
})

// ── KPIs without mortgage ─────────────────────────────
describe("KPIs without mortgage", () => {
  it("calculates correct gross yield", () => {
    const input = baseInput({ financing: { ...baseInput().financing, enabled: false, mortgageAmount: 0, downPayment: 0 } })
    const kpis = calculateKPIs(input)
    // Gross yield = 900*12 / 150000 = 7.2%
    expect(kpis.grossYield).toBeCloseTo(7.2, 1)
  })

  it("monthly mortgage is 0 when not financed", () => {
    const input = baseInput({ financing: { ...baseInput().financing, enabled: false, mortgageAmount: 0, downPayment: 0 } })
    const kpis = calculateKPIs(input)
    expect(kpis.monthlyMortgage).toBe(0)
    expect(kpis.annualMortgage).toBe(0)
  })

  it("ltv is 0 when not financed", () => {
    const input = baseInput({ financing: { ...baseInput().financing, enabled: false, mortgageAmount: 0, downPayment: 0 } })
    const kpis = calculateKPIs(input)
    expect(kpis.ltv).toBe(0)
  })
})

// ── KPIs with mortgage ────────────────────────────────
describe("KPIs with mortgage", () => {
  it("ltv matches financing percentage", () => {
    const input = baseInput()
    const kpis = calculateKPIs(input)
    expect(kpis.ltv).toBeCloseTo(70, 0)
  })

  it("cap rate is positive for profitable property", () => {
    const input = baseInput()
    const kpis = calculateKPIs(input)
    expect(kpis.capRate).toBeGreaterThan(0)
  })

  it("total investment excludes mortgage (only own capital + costs)", () => {
    const input = baseInput()
    const kpis = calculateKPIs(input)
    // totalInv = 150000 + 3000 + 12000 + 5000 + 2000 + 1000 = 173000
    expect(kpis.totalInvestment).toBe(173_000)
  })
})

// ── Cash flow scenarios ───────────────────────────────
describe("Cash flow scenarios", () => {
  it("positive cash flow with high rent", () => {
    const input = baseInput({
      rental: { ...baseInput().rental, monthlyRent: 1500 },
    })
    const kpis = calculateKPIs(input)
    expect(kpis.annualCashFlow).toBeGreaterThan(0)
    expect(kpis.monthlyCashFlow).toBeGreaterThan(0)
  })

  it("negative cash flow with very low rent", () => {
    const input = baseInput({
      rental: { ...baseInput().rental, monthlyRent: 100 },
    })
    const kpis = calculateKPIs(input)
    expect(kpis.annualCashFlow).toBeLessThan(0)
  })

  it("expenses exceeding income produce negative cash flow", () => {
    const input = baseInput({
      rental: { ...baseInput().rental, monthlyRent: 200 },
      expenses: {
        ...baseInput().expenses,
        communityFee: 200,
        maintenance: 2000,
        repairs: 1000,
      },
    })
    const kpis = calculateKPIs(input)
    expect(kpis.annualCashFlow).toBeLessThan(0)
  })
})

// ── Appreciation scenarios ────────────────────────────
describe("Appreciation scenarios", () => {
  it("0% appreciation still produces equity from debt repayment", () => {
    const input = baseInput({
      appreciation: { annualAppreciationPct: 0, investmentHorizonYears: 10 },
    })
    const proj = buildProjection(input)
    expect(proj[9].propertyValue).toBeCloseTo(150_000, 0)
    expect(proj[9].remainingDebt).toBeLessThan(105_000)
    expect(proj[9].equity).toBeGreaterThan(0)
  })

  it("positive appreciation increases property value", () => {
    const input = baseInput()
    const proj = buildProjection(input)
    expect(proj[0].propertyValue).toBeGreaterThan(150_000)
    expect(proj[9].propertyValue).toBeGreaterThan(proj[0].propertyValue)
  })

  it("total profit is positive for good investment", () => {
    const input = baseInput()
    const kpis = calculateKPIs(input)
    expect(kpis.totalProfit).toBeGreaterThan(0)
    expect(kpis.roi).toBeGreaterThan(0)
  })
})

// ── Edge cases ────────────────────────────────────────
describe("Edge cases", () => {
  it("zero rent produces zero gross yield", () => {
    const input = baseInput({
      rental: { ...baseInput().rental, monthlyRent: 0 },
    })
    const kpis = calculateKPIs(input)
    expect(kpis.grossYield).toBe(0)
  })

  it("zero price does not produce NaN", () => {
    const input = baseInput({
      purchase: { ...baseInput().purchase, price: 0 },
    })
    const kpis = calculateKPIs(input)
    expect(isFinite(kpis.grossYield)).toBe(true)
    expect(isFinite(kpis.roi)).toBe(true)
  })

  it("very short term (1 year) does not crash", () => {
    const input = baseInput({
      appreciation: { annualAppreciationPct: 2, investmentHorizonYears: 1 },
    })
    const proj = buildProjection(input)
    expect(proj).toHaveLength(1)
    const kpis = calculateKPIs(input)
    expect(isFinite(kpis.roi)).toBe(true)
  })

  it("zero horizon does not crash", () => {
    const input = baseInput({
      appreciation: { annualAppreciationPct: 2, investmentHorizonYears: 0 },
    })
    const proj = buildProjection(input)
    expect(proj).toHaveLength(0)
    const kpis = calculateKPIs(input)
    expect(isFinite(kpis.roi)).toBe(true)
    expect(kpis.equity).toBeGreaterThanOrEqual(0)
  })

  it("100% vacancy produces zero income", () => {
    const input = baseInput({
      rental: { ...baseInput().rental, vacancyRate: 100 },
    })
    const kpis = calculateKPIs(input)
    expect(kpis.effectiveAnnualIncome).toBe(0)
  })

  it("100% LTV (no down payment)", () => {
    const input = baseInput({
      financing: {
        ...baseInput().financing,
        ltvPct: 100,
        mortgageAmount: 150_000,
        downPayment: 0,
      },
    })
    const kpis = calculateKPIs(input)
    expect(kpis.ltv).toBe(100)
    expect(isFinite(kpis.cashOnCashReturn)).toBe(true)
  })
})

// ── Projection ────────────────────────────────────────
describe("Projection", () => {
  it("has correct number of years", () => {
    const input = baseInput()
    const proj = buildProjection(input)
    expect(proj).toHaveLength(10)
  })

  it("cumulative cash flow grows monotonically with positive CF", () => {
    const input = baseInput({
      rental: { ...baseInput().rental, monthlyRent: 2000 },
    })
    const proj = buildProjection(input)
    for (let i = 1; i < proj.length; i++) {
      expect(proj[i].cumulativeCashFlow).toBeGreaterThanOrEqual(proj[i - 1].cumulativeCashFlow)
    }
  })

  it("equity grows over time (appreciation + debt paydown)", () => {
    const input = baseInput()
    const proj = buildProjection(input)
    for (let i = 1; i < proj.length; i++) {
      expect(proj[i].equity).toBeGreaterThan(proj[i - 1].equity)
    }
  })

  it("remaining debt reaches zero before or at term end", () => {
    const input = baseInput({
      financing: { ...baseInput().financing, termYears: 10 },
    })
    const proj = buildProjection(input)
    expect(proj[9].remainingDebt).toBe(0)
    expect(proj[9].loanPaidOff).toBe(true)
  })
})

// ── Breakeven ─────────────────────────────────────────
describe("Breakeven", () => {
  it("returns positive months for good investment", () => {
    const input = baseInput({
      rental: { ...baseInput().rental, monthlyRent: 2000 },
    })
    const be = breakevenMonths(input)
    expect(be).toBeGreaterThan(0)
  })

  it("returns -1 if never breaks even within horizon", () => {
    const input = baseInput({
      rental: { ...baseInput().rental, monthlyRent: 50 },
      appreciation: { annualAppreciationPct: 0, investmentHorizonYears: 5 },
    })
    const be = breakevenMonths(input)
    expect(be).toBe(-1)
  })
})

// ── Different interest rates ──────────────────────────
describe("Different interest rates", () => {
  it("higher rate = higher monthly payment", () => {
    const low = monthlyMortgagePayment(100_000, 2, 30)
    const high = monthlyMortgagePayment(100_000, 6, 30)
    expect(high).toBeGreaterThan(low)
  })

  it("higher rate = lower cash flow", () => {
    const inputLow = baseInput({
      financing: { ...baseInput().financing, annualInterestRate: 2 },
    })
    const inputHigh = baseInput({
      financing: { ...baseInput().financing, annualInterestRate: 6 },
    })
    const cfLow = calculateKPIs(inputLow).annualCashFlow
    const cfHigh = calculateKPIs(inputHigh).annualCashFlow
    expect(cfLow).toBeGreaterThan(cfHigh)
  })
})

// ── Different mortgage terms ──────────────────────────
describe("Different mortgage terms", () => {
  it("shorter term = higher payment but less total cost", () => {
    const cost15 = totalFinancingCost(100_000, 3, 15)
    const cost30 = totalFinancingCost(100_000, 3, 30)
    expect(cost15).toBeLessThan(cost30)
  })

  it("shorter term = lower remaining debt at horizon", () => {
    const input15 = baseInput({
      financing: { ...baseInput().financing, termYears: 15 },
    })
    const input30 = baseInput({
      financing: { ...baseInput().financing, termYears: 30 },
    })
    const proj15 = buildProjection(input15)
    const proj30 = buildProjection(input30)
    expect(proj15[9].remainingDebt).toBeLessThan(proj30[9].remainingDebt)
  })
})

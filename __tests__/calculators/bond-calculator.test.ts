import { describe, it, expect } from "vitest"
import {
  calculateBond,
  priceForYTM,
  solveYTM,
  macaulayDurationYears,
  couponPerYear,
  priceForYTM as priceForYield,
  BondInput,
} from "@/lib/calculators/bond-formulas"

function gov(overrides: Partial<BondInput> = {}): BondInput {
  return {
    bondType: "government",
    faceValue: 1000,
    couponRatePct: 5,
    price: 1000,
    maturityYears: 10,
    frequency: "annual",
    rating: "AA",
    govReferenceYieldPct: 3,
    ...overrides,
  }
}

describe("couponPerYear", () => {
  it("computes annual coupon", () => {
    expect(couponPerYear({ faceValue: 1000, couponRatePct: 5 })).toBe(50)
    expect(couponPerYear({ faceValue: 1000, couponRatePct: 3.5 })).toBe(35)
  })
})

describe("priceForYTM", () => {
  it("prices a par bond at its coupon rate", () => {
    // 5% coupon, 10y anual, TIR 5% → precio = 1000 (a la par)
    expect(priceForYield(gov({ price: 0 }), 5)).toBeCloseTo(1000, 0)
  })

  it("lower YTM → higher price (premium)", () => {
    expect(priceForYield(gov({ price: 0 }), 3)).toBeGreaterThan(1000)
  })

  it("higher YTM → lower price (discount)", () => {
    expect(priceForYield(gov({ price: 0 }), 7)).toBeLessThan(1000)
  })
})

describe("solveYTM", () => {
  it("returns ~5% for a par bond with 5% coupon", () => {
    const ytm = solveYTM(gov())
    expect(ytm).toBeCloseTo(5, 1)
  })

  it("premium price → YTM below coupon", () => {
    const ytm = solveYTM(gov({ price: 1100 }))
    expect(ytm).toBeLessThan(5)
  })

  it("discount price → YTM above coupon", () => {
    const ytm = solveYTM(gov({ price: 900 }))
    expect(ytm).toBeGreaterThan(5)
  })

  it("handles zero price gracefully", () => {
    expect(solveYTM(gov({ price: 0 }))).toBe(0)
  })
})

describe("macaulayDurationYears", () => {
  it("par 5% 10y bond has duration ≈ 8.1 years", () => {
    const d = macaulayDurationYears(gov(), 5)
    expect(d).toBeGreaterThan(8)
    expect(d).toBeLessThan(8.5)
  })
})

describe("calculateBond", () => {
  it("par bond at par: coupon == current yield == YTM", () => {
    const r = calculateBond(gov())
    expect(r.couponPerYear).toBe(50)
    expect(r.currentYieldPct).toBeCloseTo(5, 1)
    expect(r.ytmPct).toBeCloseTo(5, 1)
    expect(r.priceToParPct).toBe(100)
    expect(r.premiumDiscount).toBe("par")
  })

  it("discount bond is marked as discount", () => {
    const r = calculateBond(gov({ price: 920 }))
    expect(r.premiumDiscount).toBe("discount")
    expect(r.priceToParPct).toBe(92)
    expect(r.ytmPct).toBeGreaterThan(5)
  })

  it("premium bond is marked as premium", () => {
    const r = calculateBond(gov({ price: 1080 }))
    expect(r.premiumDiscount).toBe("premium")
    expect(r.ytmPct).toBeLessThan(5)
  })

  it("current yield = coupon / price", () => {
    const r = calculateBond(gov({ price: 1250 }))
    expect(r.currentYieldPct).toBeCloseTo((50 / 1250) * 100, 2)
  })

  it("total profit = coupons + face − price", () => {
    const r = calculateBond(gov())
    expect(r.totalProfit).toBeCloseTo(500 + 1000 - 1000, 0)
  })

  it("produces a cash flow table with discounted value ≈ price", () => {
    const r = calculateBond(gov({ price: 950 }))
    const pvSum = r.cashFlows.reduce((acc, c) => acc + c.discounted, 0)
    expect(pvSum).toBeCloseTo(950, 0)
    expect(r.cashFlows).toHaveLength(10)
    expect(r.cashFlows[9].principal).toBe(1000)
  })

  it("semiannual par bond keeps YTM ≈ coupon", () => {
    const r = calculateBond(gov({ frequency: "semiannual" }))
    expect(r.ytmPct).toBeCloseTo(5, 1)
    expect(r.numPeriods).toBe(20)
    expect(r.couponPerPeriod).toBeCloseTo(25, 0)
  })

  it("government bond has no credit spread or default probability", () => {
    const r = calculateBond(gov())
    expect(r.creditSpreadPct).toBeNull()
    expect(r.expectedDefaultPct).toBeNull()
  })

  it("corporate bond exposes spread and expected default", () => {
    const r = calculateBond(gov({ bondType: "corporate", price: 950, govReferenceYieldPct: 3 }))
    expect(r.creditSpreadPct).not.toBeNull()
    expect(r.expectedDefaultPct).not.toBeNull()
  })

  it("price sensitivity covers the expected range", () => {
    const r = calculateBond(gov())
    expect(r.priceSensitivity.length).toBeGreaterThanOrEqual(11)
    expect(r.priceSensitivity[0].ytmPct).toBeLessThan(5)
    expect(r.priceSensitivity[r.priceSensitivity.length - 1].ytmPct).toBeGreaterThan(5)
    expect(r.priceSensitivity[10].ytmPct).toBeCloseTo(5, 0)
  })
})
export type BondType = "government" | "corporate"
export type CouponFrequency = "annual" | "semiannual"
export type BondRating = "AAA" | "AA" | "A" | "BBB" | "BB" | "B"

export interface BondInput {
  bondType: BondType
  faceValue: number            // valor nominal, p.ej. 1000 €
  couponRatePct: number        // cupón nominal anual (%), p.ej. 3.5
  price: number                // precio de mercado limpio (€)
  maturityYears: number        // años hasta vencimiento
  frequency: CouponFrequency
  rating: BondRating            // solo corporativo
  govReferenceYieldPct: number  // rendimiento del bono gubernamental comparable (solo corporativo)
}

export interface BondCashFlow {
  year: number
  coupon: number
  principal: number            // 0 salvo en el último año
  total: number
  discounted: number           // valor actual al TIR
}

export interface BondResults {
  couponPerYear: number
  couponPerPeriod: number
  numPeriods: number
  currentYieldPct: number
  ytmPct: number
  macaulayDurationYears: number
  modifiedDurationYears: number
  priceToParPct: number
  premiumDiscount: "premium" | "discount" | "par"
  totalCoupons: number
  totalProfit: number
  totalReturnPct: number
  creditSpreadPct: number | null
  expectedDefaultPct: number | null
  cashFlows: BondCashFlow[]
  priceSensitivity: { ytmPct: number; price: number }[]
}

// Probabilidad media anual de impago por rating (referencias históricas aproximadas)
const DEFAULT_PROB: Record<BondRating, number> = {
  AAA: 0.1,
  AA: 0.35,
  A: 0.55,
  BBB: 1.2,
  BB: 5,
  B: 10,
}
const RECOVERY_RATE = 0.4

export function periodsPerYear(f: CouponFrequency): number {
  return f === "semiannual" ? 2 : 1
}

export function couponPerYear(input: Pick<BondInput, "faceValue" | "couponRatePct">): number {
  return input.faceValue * input.couponRatePct / 100
}

// Precio teórico del bono dado un TIR anual
export function priceForYTM(input: BondInput, ytmAnnualPct: number): number {
  const pf = periodsPerYear(input.frequency)
  const n = Math.max(1, Math.round(input.maturityYears * pf))
  const perPeriodCoupon = couponPerYear(input) / pf
  const r = ytmAnnualPct / 100 / pf

  let pv = 0
  for (let t = 1; t <= n; t++) {
    const cf = perPeriodCoupon + (t === n ? input.faceValue : 0)
    pv += cf / Math.pow(1 + r, t)
  }
  return pv
}

// Resuelve el TIR (YTM) por bisección: f(r) = precio − valor actual
export function solveYTM(input: BondInput): number {
  if (input.price <= 0 || input.faceValue <= 0 || input.maturityYears <= 0) return 0

  const f = (rPct: number) => input.price - priceForYTM(input, rPct)

  let lo = -99.9 // % anual
  let hi = 150 // % anual (techo razonable)
  const flo = f(lo)
  const fhi = f(hi)

  // f es creciente: si ya está por encima/por debajo del rango, se limita
  if (flo > 0) return lo // el precio supera al valor actual incluso a TIR −99.9%
  if (fhi < 0) return hi // el precio es inferior al valor actual incluso al 150%

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const fmid = f(mid)
    if (Math.abs(fmid) < 1e-6) return mid
    if (fmid > 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// TIR periódica a partir de un TIR anual
function periodRateFromAnnual(ytmPct: number, f: CouponFrequency): number {
  return ytmPct / 100 / periodsPerYear(f)
}

export function macaulayDurationYears(
  input: BondInput,
  ytmAnnualPct: number,
): number {
  const pf = periodsPerYear(input.frequency)
  const n = Math.max(1, Math.round(input.maturityYears * pf))
  const perPeriodCoupon = couponPerYear(input) / pf
  const r = periodRateFromAnnual(ytmAnnualPct, input.frequency)

  let pv = 0
  let weighted = 0
  for (let t = 1; t <= n; t++) {
    const cf = perPeriodCoupon + (t === n ? input.faceValue : 0)
    const disc = cf / Math.pow(1 + r, t)
    pv += disc
    weighted += t * disc
  }
  if (pv <= 0) return 0
  return weighted / pv / pf // en años
}

export function calculateBond(input: BondInput): BondResults {
  const ytmPct = solveYTM(input)
  const ytmPeriod = periodRateFromAnnual(ytmPct, input.frequency)
  const pf = periodsPerYear(input.frequency)
  const n = Math.max(1, Math.round(input.maturityYears * pf))
  const cYr = couponPerYear(input)
  const cPeriod = cYr / pf

  // Cash flows
  const cashFlows: BondCashFlow[] = []
  for (let t = 1; t <= n; t++) {
    const isFinal = t === n
    const coupon = round2(cPeriod)
    const principal = isFinal ? input.faceValue : 0
    const total = coupon + principal
    const discounted = round2(total / Math.pow(1 + ytmPeriod, t))
    const year = t / pf
    cashFlows.push({
      year: round2(year),
      coupon: round2(coupon),
      principal,
      total: round2(total),
      discounted,
    })
  }

  const currentYieldPct = input.price > 0 ? (cYr / input.price) * 100 : 0
  const macaulay = macaulayDurationYears(input, ytmPct)
  const modified = ytmPeriod === -1 || ytmPeriod === 1 ? 0 : macaulay / (1 + ytmPeriod)
  const priceToParPct = input.faceValue > 0 ? (input.price / input.faceValue) * 100 : 0
  const premiumDiscount: BondResults["premiumDiscount"] =
    input.price > input.faceValue ? "premium" : input.price < input.faceValue ? "discount" : "par"

  const totalCoupons = round2(cYr * input.maturityYears)
  const totalProfit = round2(totalCoupons + input.faceValue - input.price)
  const totalReturnPct = input.price > 0 ? (totalProfit / input.price) * 100 : 0

  // Spread comparado con la deuda pública (solo corporativo)
  const creditSpreadPct =
    input.bondType === "corporate" ? round2(ytmPct - input.govReferenceYieldPct) : null

  // Pérdida esperada anual aproximada por rating (prob. impago × (1 − tasa de recuperación))
  const expectedDefaultPct =
    input.bondType === "corporate"
      ? round2(DEFAULT_PROB[input.rating] * (1 - RECOVERY_RATE))
      : null

  // Sensibilidad del precio frente al TIR (curva precio / rendimiento)
  const priceSensitivity: { ytmPct: number; price: number }[] = []
  const from = ytmPct - 4
  const to = ytmPct + 4
  const steps = 21
  for (let i = 0; i <= steps; i++) {
    const ytm = from + ((to - from) * i) / steps
    priceSensitivity.push({ ytmPct: round2(ytm), price: round2(priceForYTM(input, ytm)) })
  }

  return {
    couponPerYear: round2(cYr),
    couponPerPeriod: round2(cPeriod),
    numPeriods: n,
    currentYieldPct: round2(currentYieldPct),
    ytmPct: round2(ytmPct),
    macaulayDurationYears: round2(macaulay),
    modifiedDurationYears: round2(modified),
    priceToParPct: round2(priceToParPct),
    premiumDiscount,
    totalCoupons,
    totalProfit,
    totalReturnPct: round2(totalReturnPct),
    creditSpreadPct,
    expectedDefaultPct,
    cashFlows,
    priceSensitivity,
  }
}
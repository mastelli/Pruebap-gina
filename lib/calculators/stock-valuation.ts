export interface ValuationInput {
  price: number
  stats: Record<string, number | null>
  quote: {
    marketCap: number
    week52High: number
    week52Low: number
  }
  analystData: {
    targetMean: number | null
    targetHigh: number | null
    targetLow: number | null
    numberOfAnalysts: number | null
  }
}

export interface ScenarioResult {
  label: string
  targetPrice: number
  probability: number
  assumptions: string
}

export interface ValuationResult {
  fairValue: number
  targetPrice: number
  expectedValue: number
  upsidePct: number
  valuationLabel: string
  scenarios: ScenarioResult[]
  score: {
    total: number
    valuation: number
    growth: number
    profitability: number
    financialHealth: number
    cashFlow: number
  }
  alerts: { type: "green" | "yellow" | "red"; text: string }[]
  comparison: {
    metric: string
    company: number | null
    sector: string
  }[]
}

function safe(val: number | null | undefined, fallback: number = 0): number {
  return val != null && isFinite(val) && !isNaN(val) ? val : fallback
}

function pct(val: number | null | undefined): number {
  const v = safe(val)
  return Math.abs(v) <= 1 ? v * 100 : v
}

function cap(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max)
}

// Sector benchmarks (S&P 500 averages as default)
const SECTOR = {
  pe: 22,
  evEbitda: 15,
  fcfYield: 4,
  revenueGrowth: 8,
  epsGrowth: 10,
  fcfGrowth: 8,
  roic: 12,
  roe: 18,
  operatingMargin: 12,
  netDebtEbitda: 2.5,
  interestCoverage: 8,
  currentRatio: 1.5,
  debtEquity: 80,
  fcfMargin: 12,
}

export function calculateValuation(input: ValuationInput): ValuationResult {
  const { price, stats, quote, analystData } = input

  const eps = safe(stats.trailingEps)
  const forwardEps = safe(stats.forwardEps)
  const trailingPE = safe(stats.trailingPE)
  const forwardPE = safe(stats.forwardPE)
  const pegRatio = safe(stats.pegRatio)
  const pb = safe(stats.priceToBook)
  const evEbitda = safe(stats.enterpriseToEbitda)
  const evRevenue = safe(stats.enterpriseToRevenue)
  const ps = safe(stats.priceToSalesTrailing12Months)
  const revenueGrowth = pct(stats.revenueGrowth)
  const earningsGrowth = pct(stats.earningsGrowth)
  const roe = pct(stats.returnOnEquity)
  const roa = pct(stats.returnOnAssets)
  const grossMargin = pct(stats.grossMargins)
  const operatingMargin = pct(stats.operatingMargins)
  const netMargin = pct(stats.profitMargins)
  const debtToEquity = safe(stats.debtToEquity)
  const currentRatio = safe(stats.currentRatio)
  const fcf = safe(stats.freeCashflow)
  const ocf = safe(stats.operatingCashflow)
  const revenue = safe(stats.revenue)
  const ebitda = safe(stats.ebitda)
  const marketCap = safe(stats.marketCap) || quote.marketCap
  const dividendYield = pct(stats.dividendYield)
  const totalCash = safe(stats.totalCash)
  const totalDebt = safe(stats.totalDebt)
  const enterpriseValue = safe(stats.enterpriseValue)
  const sharesOutstanding = safe(stats.sharesOutstanding)

  const fcfYield = marketCap > 0 && fcf ? (fcf / marketCap) * 100 : 0
  const earningsYield = trailingPE > 0 ? (1 / trailingPE) * 100 : 0
  const netDebt = totalDebt - totalCash
  const netDebtEbitda = ebitda > 0 ? netDebt / ebitda : 0
  const interestCoverage = ebitda > 0 ? ebitda / (totalDebt * 0.05 || 1) : 0
  const fcfMargin = revenue > 0 ? (fcf / revenue) * 100 : 0

  const estEpsCurrentYear = safe(stats.estimatedEpsCurrentYear)
  const estEpsNextYear = safe(stats.estimatedEpsNextYear)

  // --- Target Price ---
  const analystTargetMean = safe(analystData.targetMean)

  let targetPrice = price
  if (analystTargetMean > 0) {
    targetPrice = analystTargetMean * 0.95
  } else {
    let methodCount = 0

    if (trailingPE > 0 && eps > 0) {
      const sectorPE = 20
      const histPE = trailingPE * 1.15
      const peTarget = eps * Math.min(sectorPE, histPE)
      targetPrice += peTarget
      methodCount++
    }

    if (evEbitda > 0 && sharesOutstanding > 0) {
      const sectorEV = evEbitda * 1.1
      const evTarget = (sectorEV * ebitda - netDebt) / sharesOutstanding
      if (evTarget > 0) {
        targetPrice += evTarget
        methodCount++
      }
    }

    if (fcf > 0 && sharesOutstanding > 0) {
      const fcfMultiple = 25
      const fcfTarget = (fcf * fcfMultiple) / sharesOutstanding
      targetPrice += fcfTarget
      methodCount++
    }

    if (forwardEps > 0 && forwardPE > 0) {
      const growthAdjustedPE = forwardPE * 1.1
      const growthTarget = forwardEps * growthAdjustedPE
      targetPrice += growthTarget
      methodCount++
    }

    targetPrice = methodCount > 0 ? targetPrice / methodCount : price
  }

  const bearPrice = targetPrice * 0.8
  const basePrice = targetPrice
  const bullPrice = targetPrice * 1.3

  const expectedValue = bearPrice * 0.25 + basePrice * 0.50 + bullPrice * 0.25
  const upsidePct = price > 0 ? ((expectedValue - price) / price) * 100 : 0

  let valuationLabel = "PRECIO JUSTO"
  const diffPct = price > 0 ? ((expectedValue - price) / price) * 100 : 0
  if (diffPct > 30) valuationLabel = "MUY BARATA"
  else if (diffPct > 15) valuationLabel = "BARATA"
  else if (diffPct < -30) valuationLabel = "MUY CARA"
  else if (diffPct < -15) valuationLabel = "CARA"

  const scenarios: ScenarioResult[] = [
    { label: "Bear", targetPrice: bearPrice, probability: 25, assumptions: "Crecimiento bajo, múltiplo reducido" },
    { label: "Base", targetPrice: basePrice, probability: 50, assumptions: "Crecimiento esperado, múltiplo razonable" },
    { label: "Bull", targetPrice: bullPrice, probability: 25, assumptions: "Crecimiento alto, múltiplo expandido" },
  ]

  // --- SCORING ---

  // 1. Valuation (25 points)
  const peScore = trailingPE > 0 ? cap(10 * (SECTOR.pe / trailingPE), 10) : 0
  const evScore = evEbitda > 0 ? cap(8 * (SECTOR.evEbitda / evEbitda), 8) : 0
  const fcfYieldScore = fcfYield > 0 ? cap(7 * (fcfYield / SECTOR.fcfYield), 7) : 0
  const valuationScore = Math.round(peScore + evScore + fcfYieldScore)

  // 2. Growth (20 points)
  const revenueScore = revenueGrowth > 0 ? cap(7 * (revenueGrowth / SECTOR.revenueGrowth), 7) : 0
  const epsScore = earningsGrowth > 0 ? cap(7 * (earningsGrowth / SECTOR.epsGrowth), 7) : 0
  const fcfGrowthVal = safe(stats.fcfGrowth)
  const fcfGrowthScore = fcfGrowthVal > 0 ? cap(6 * (fcfGrowthVal / SECTOR.fcfGrowth), 6) : 0
  const growthScore = Math.round(revenueScore + epsScore + fcfGrowthScore)

  // 3. Profitability (20 points)
  const roicVal = safe(stats.returnOnCapitalEmployed) || roe
  const roicScore = roicVal > 0 ? cap(10 * (roicVal / SECTOR.roic), 10) : 0
  const roeScore = roe > 0 ? cap(5 * (roe / SECTOR.roe), 5) : 0
  const marginScore = operatingMargin > 0 ? cap(5 * (operatingMargin / SECTOR.operatingMargin), 5) : 0
  const profitabilityScore = Math.round(roicScore + roeScore + marginScore)

  // 4. Financial Health (20 points)
  const ndEbitdaScore = netDebtEbitda > 0 ? cap(8 * (1 - netDebtEbitda / 4), 8) : 8
  const icScore = interestCoverage > 0 ? cap(6 * (interestCoverage / SECTOR.interestCoverage), 6) : 0
  const crScore = currentRatio > 0 ? cap(3 * (currentRatio / SECTOR.currentRatio), 3) : 0
  const deScore = debtToEquity >= 0 ? cap(3 * (1 - debtToEquity / (SECTOR.debtEquity * 2)), 3) : 0
  const financialHealthScore = Math.round(ndEbitdaScore + icScore + crScore + deScore)

  // 5. Cash Flow (15 points)
  const fcfMarginScore = fcfMargin > 0 ? cap(5 * (fcfMargin / SECTOR.fcfMargin), 5) : 0
  const fcfGrowthScore2 = fcfGrowthVal > 0 ? cap(5 * (fcfGrowthVal / SECTOR.fcfGrowth), 5) : 0
  const fcfYieldScore2 = fcfYield > 0 ? cap(5 * (fcfYield / SECTOR.fcfYield), 5) : 0
  const cashFlowScore = Math.round(fcfMarginScore + fcfGrowthScore2 + fcfYieldScore2)

  const totalScore = valuationScore + growthScore + profitabilityScore + financialHealthScore + cashFlowScore

  const alerts: { type: "green" | "yellow" | "red"; text: string }[] = []
  if (trailingPE > 0 && trailingPE < 20) alerts.push({ type: "green", text: "P/E inferior a 20 — valoración atractiva" })
  if (roe > 20) alerts.push({ type: "green", text: `ROIC/ROE elevado (${roe.toFixed(1)}%)` })
  if (fcf > 0 && revenue > 0 && fcfMargin > 15) alerts.push({ type: "green", text: "FCF sólido con margen saludable" })
  if (revenueGrowth > 15) alerts.push({ type: "green", text: `Crecimiento de ingresos fuerte (${revenueGrowth.toFixed(1)}%)` })
  if (debtToEquity > 150) alerts.push({ type: "red", text: "Deuda elevada respecto a equity" })
  if (fcf < 0) alerts.push({ type: "red", text: "Free Cash Flow negativo" })
  if (earningsGrowth < -10) alerts.push({ type: "red", text: `Crecimiento de beneficios en descenso (${earningsGrowth.toFixed(1)}%)` })
  if (trailingPE > 35) alerts.push({ type: "yellow", text: "Valoración elevada (P/E > 35)" })
  if (pegRatio > 2) alerts.push({ type: "yellow", text: "PEG alto — crecimiento puede no justificar valoración" })
  if (netDebtEbitda > 3) alerts.push({ type: "yellow", text: "Deuda neta/EBITDA elevado" })
  if (currentRatio < 1) alerts.push({ type: "yellow", text: "Ratio de liquidez bajo 1" })

  const fcfPerShare = sharesOutstanding > 0 ? fcf / sharesOutstanding : 0

  return {
    fairValue: targetPrice,
    targetPrice,
    expectedValue,
    upsidePct,
    valuationLabel,
    scenarios,
    score: {
      total: totalScore,
      valuation: valuationScore,
      growth: growthScore,
      profitability: profitabilityScore,
      financialHealth: financialHealthScore,
      cashFlow: cashFlowScore,
    },
    alerts,
    comparison: [
      { metric: "P/E", company: trailingPE, sector: "~22x" },
      { metric: "EV/EBITDA", company: evEbitda, sector: "~15x" },
      { metric: "ROE", company: roe, sector: "~18%" },
      { metric: "Revenue Growth", company: revenueGrowth, sector: "~8%" },
      { metric: "FCF Yield", company: fcfYield, sector: "~4%" },
      { metric: "Net Margin", company: netMargin, sector: "~12%" },
      { metric: "Debt/Equity", company: debtToEquity, sector: "~80%" },
    ],
  }
}

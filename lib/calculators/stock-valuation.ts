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

function scoreRange(value: number, min: number, max: number, invert: boolean = false): number {
  if (value <= 0) return 0
  const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1)
  return invert ? (1 - normalized) : normalized
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

  let targetPrice = price
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

  let valScore = 0, valCount = 0
  if (trailingPE > 0) { valScore += scoreRange(trailingPE, 5, 40, true) * 25; valCount++ }
  if (forwardPE > 0) { valScore += scoreRange(forwardPE, 5, 35, true) * 25; valCount++ }
  if (pegRatio > 0) { valScore += scoreRange(pegRatio, 0.5, 3, true) * 25; valCount++ }
  if (evEbitda > 0) { valScore += scoreRange(evEbitda, 5, 25, true) * 25; valCount++ }
  const valuationScore = valCount > 0 ? Math.round(valScore / valCount) : 12.5

  let growthScore = 0, growthCount = 0
  if (revenueGrowth !== 0) { growthScore += scoreRange(revenueGrowth, -10, 40) * 50; growthCount++ }
  if (earningsGrowth !== 0) { growthScore += scoreRange(earningsGrowth, -10, 50) * 50; growthCount++ }
  const growthScoreFinal = growthCount > 0 ? Math.round(growthScore / growthCount) : 10

  let profScore = 0, profCount = 0
  if (grossMargin > 0) { profScore += scoreRange(grossMargin, 20, 80) * 33; profCount++ }
  if (operatingMargin > 0) { profScore += scoreRange(operatingMargin, 5, 40) * 33; profCount++ }
  if (roe > 0) { profScore += scoreRange(roe, 5, 40) * 34; profCount++ }
  const profitabilityScore = profCount > 0 ? Math.round(profScore / profCount) : 10

  let healthScore = 0, healthCount = 0
  if (currentRatio > 0) { healthScore += scoreRange(currentRatio, 0.5, 3) * 50; healthCount++ }
  if (debtToEquity >= 0) { healthScore += scoreRange(debtToEquity, 200, 0, true) * 50; healthCount++ }
  const financialHealthScore = healthCount > 0 ? Math.round(healthScore / healthCount) : 10

  let cfScore = 0, cfCount = 0
  if (fcfYield > 0) { cfScore += scoreRange(fcfYield, 0, 10) * 50; cfCount++ }
  if (fcfMargin !== 0) { cfScore += scoreRange(fcfMargin, -5, 30) * 50; cfCount++ }
  const cashFlowScore = cfCount > 0 ? Math.round(cfScore / cfCount) : 7.5

  const totalScore = Math.round(
    valuationScore * 0.25 +
    growthScoreFinal * 0.20 +
    profitabilityScore * 0.20 +
    financialHealthScore * 0.20 +
    cashFlowScore * 0.15
  )

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
      growth: growthScoreFinal,
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

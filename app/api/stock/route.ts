import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }

interface StockData {
  profile: {
    symbol: string
    name: string
    exchange: string
    sector: string
    industry: string
    country: string
    logo: string
    website: string
  }
  quote: {
    price: number
    previousClose: number
    dayChange: number
    dayChangePct: number
    week52High: number
    week52Low: number
    marketCap: number
    volume: number
    currency: string
  }
  stats: Record<string, number | null>
  analystData: {
    targetMean: number | null
    targetHigh: number | null
    targetLow: number | null
    numberOfAnalysts: number | null
    recommendationMean: number | null
    recommendationKey: string | null
  }
}

async function fetchJSON(url: string): Promise<any> {
  try {
    const res = await fetch(url, { headers: UA })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getQuoteSummary(symbol: string): Promise<any> {
  const data = await fetchJSON(
    `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=assetProfile,defaultKeyStatistics,financialData,earningsTrend,summaryDetail,recommendationTrend,price`
  )
  return data?.quoteSummary?.result?.[0] ?? null
}

async function getChart(symbol: string): Promise<any> {
  const data = await fetchJSON(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`
  )
  return data?.chart?.result?.[0] ?? null
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")
  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 })
  }

  const ticker = symbol.toUpperCase().trim()

  const [summary, chart] = await Promise.all([
    getQuoteSummary(ticker),
    getChart(ticker),
  ])

  if (!summary && !chart) {
    return NextResponse.json({ error: `No data found for ${ticker}` }, { status: 404 })
  }

  const price = chart?.meta?.regularMarketPrice ?? summary?.price?.regularMarketPrice?.raw ?? 0
  const previousClose = chart?.meta?.previousClose ?? summary?.price?.regularMarketPreviousClose?.raw ?? 0
  const dayChange = price - previousClose
  const dayChangePct = previousClose ? (dayChange / previousClose) * 100 : 0

  const profile = summary?.assetProfile ?? {}
  const stats = summary?.defaultKeyStatistics ?? {}
  const financial = summary?.financialData ?? {}
  const detail = summary?.summaryDetail ?? {}

  const statsMap: Record<string, number | null> = {
    trailingPE: stats.trailingPE?.raw ?? detail.trailingPE?.raw ?? null,
    forwardPE: stats.forwardPE?.raw ?? detail.forwardPE?.raw ?? null,
    pegRatio: stats.pegRatio?.raw ?? null,
    priceToBook: stats.priceToBook?.raw ?? detail.priceToBook?.raw ?? null,
    priceToSalesTrailing12Months: stats.priceToSalesTrailing12Months?.raw ?? detail.priceToSalesTrailing12Months?.raw ?? null,
    enterpriseToRevenue: stats.enterpriseToRevenue?.raw ?? null,
    enterpriseToEbitda: stats.enterpriseToEbitda?.raw ?? detail.enterpriseToEbitda?.raw ?? null,
    trailingEps: stats.trailingEps?.raw ?? null,
    forwardEps: stats.forwardEps?.raw ?? null,
    bookValue: stats.bookValue?.raw ?? null,
    revenueGrowth: financial.revenueGrowth?.raw ?? null,
    earningsGrowth: financial.earningsGrowth?.raw ?? null,
    revenue: financial.totalRevenue?.raw ?? null,
    ebitda: financial.ebitda?.raw ?? null,
    freeCashflow: financial.freeCashflow?.raw ?? null,
    operatingCashflow: financial.operatingCashflow?.raw ?? null,
    totalCash: financial.totalCash?.raw ?? null,
    totalDebt: financial.totalDebt?.raw ?? null,
    debtToEquity: financial.debtToEquity?.raw ?? null,
    returnOnEquity: financial.returnOnEquity?.raw ?? null,
    returnOnAssets: financial.returnOnAssets?.raw ?? null,
    grossMargins: financial.grossMargins?.raw ?? null,
    operatingMargins: financial.operatingMargins?.raw ?? null,
    profitMargins: financial.profitMargins?.raw ?? null,
    currentRatio: financial.currentRatio?.raw ?? null,
    targetMeanPrice: financial.targetMeanPrice?.raw ?? null,
    targetHighPrice: financial.targetHighPrice?.raw ?? null,
    targetLowPrice: financial.targetLowPrice?.raw ?? null,
    recommendationMean: financial.recommendationMean?.raw ?? null,
    numberOfAnalystOpinions: financial.numberOfAnalystOpinions?.raw ?? null,
    dividendYield: detail.dividendYield?.raw ?? null,
    payoutRatio: detail.payoutRatio?.raw ?? null,
    marketCap: detail.marketCap?.raw ?? stats.marketCap?.raw ?? null,
    enterpriseValue: stats.enterpriseValue?.raw ?? null,
    beta: detail.beta?.raw ?? null,
    sharesOutstanding: stats.sharesOutstanding?.raw ?? null,
    heldPercentInsiders: stats.heldPercentInsiders?.raw ?? null,
    heldPercentInstitutions: stats.heldPercentInstitutions?.raw ?? null,
    earningsQuarterlyGrowth: financial.earningsQuarterlyGrowth?.raw ?? null,
    yearGrowth: null,
  }

  const trend = summary?.earningsTrend?.trend ?? []
  const currentYear = new Date().getFullYear()
  for (const t of trend) {
    if (t?.period === `${currentYear}-year` || t?.period === "0 year") {
      statsMap.estimatedEpsCurrentYear = t?.earningsEstimate?.avg?.raw ?? null
      statsMap.estimatedRevenueGrowth = t?.revenueEstimate?.avg?.raw ?? null
    }
    if (t?.period === `${currentYear + 1}-year` || t?.period === "1 year") {
      statsMap.estimatedEpsNextYear = t?.earningsEstimate?.avg?.raw ?? null
    }
  }

  const recTrend = summary?.recommendationTrend?.trend ?? []
  let buyCount = 0, holdCount = 0, sellCount = 0
  for (const r of recTrend) {
    buyCount += r?.strongBuy ?? 0
    buyCount += r?.buy ?? 0
    holdCount += r?.hold ?? 0
    sellCount += r?.sell ?? 0
    sellCount += r?.strongSell ?? 0
  }

  return NextResponse.json({
    profile: {
      symbol: ticker,
      name: profile.longName ?? profile.shortName ?? ticker,
      exchange: summary?.price?.exchangeName ?? "",
      sector: profile.sector ?? "N/A",
      industry: profile.industry ?? "N/A",
      country: profile.country ?? "N/A",
      logo: profile.logo?.url ?? "",
      website: profile.website ?? "",
    },
    quote: {
      price,
      previousClose,
      dayChange,
      dayChangePct,
      week52High: detail.fiftyTwoWeekHigh?.raw ?? 0,
      week52Low: detail.fiftyTwoWeekLow?.raw ?? 0,
      marketCap: statsMap.marketCap ?? 0,
      volume: chart?.meta?.regularMarketVolume ?? 0,
      currency: chart?.meta?.currency ?? "USD",
    },
    stats: statsMap,
    analystData: {
      targetMean: statsMap.targetMeanPrice ?? null,
      targetHigh: statsMap.targetHighPrice ?? null,
      targetLow: statsMap.targetLowPrice ?? null,
      numberOfAnalysts: statsMap.numberOfAnalystOpinions ?? null,
      recommendationMean: statsMap.recommendationMean ?? null,
      recommendationKey: financial.recommendationKey ?? null,
      buyCount,
      holdCount,
      sellCount,
    },
  })
}

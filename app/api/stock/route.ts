import { NextRequest, NextResponse } from "next/server"
import https from "https"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

function httpsGet(url: string, headers: Record<string, string>): Promise<{ status: number; headers: Record<string, string | string[]>; body: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers, maxHeaderSize: 128 * 1024 }, (res) => {
      const chunks: Buffer[] = []
      res.on("data", (chunk: Buffer) => chunks.push(chunk))
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers as Record<string, string | string[]>,
          body: Buffer.concat(chunks).toString("utf-8"),
        })
      })
    })
    req.on("error", reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("timeout")) })
  })
}

function mergeCookies(existing: string, setCookieHeaders: string[] | undefined): string {
  if (!setCookieHeaders?.length) return existing
  const map = new Map<string, string>()
  if (existing) {
    for (const c of existing.split("; ")) {
      const eq = c.indexOf("=")
      if (eq > 0) map.set(c.substring(0, eq), c.substring(eq + 1))
    }
  }
  for (const sc of setCookieHeaders) {
    const nameVal = sc.split(";")[0]
    const eq = nameVal.indexOf("=")
    if (eq > 0) map.set(nameVal.substring(0, eq), nameVal.substring(eq + 1))
  }
  return Array.from(map.entries()).map(([k, v]) => `${k}=${v}`).join("; ")
}

interface CookieJar {
  cookies: string
  crumb: string
}

let cachedSession: (CookieJar & { ts: number }) | null = null

async function getYahooSession(): Promise<CookieJar> {
  if (cachedSession && Date.now() - cachedSession.ts < 30 * 60 * 1000) {
    return cachedSession
  }

  // Step 1: consent page for base cookies
  const consentRes = await httpsGet("https://fc.yahoo.com", { "User-Agent": UA })
  let cookies = mergeCookies("", consentRes.headers["set-cookie"] as string[] | undefined)

  // Step 2: get crumb directly with consent cookies
  const crumbRes = await httpsGet("https://query2.finance.yahoo.com/v1/test/getcrumb", {
    "User-Agent": UA,
    Cookie: cookies,
  })
  cookies = mergeCookies(cookies, crumbRes.headers["set-cookie"] as string[] | undefined)
  const crumb = crumbRes.body.trim()

  if (!crumb || crumb.length > 50 || crumb.includes("Error")) {
    // Fallback: try finance.yahoo.com with a lighter path
    const quoteRes = await httpsGet("https://finance.yahoo.com/quote/AAPL/", {
      "User-Agent": UA,
      Cookie: cookies,
    })
    cookies = mergeCookies(cookies, quoteRes.headers["set-cookie"] as string[] | undefined)

    const crumb2 = await httpsGet("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      "User-Agent": UA,
      Cookie: cookies,
    })
    cookies = mergeCookies(cookies, crumb2.headers["set-cookie"] as string[] | undefined)
    const crumb2Val = crumb2.body.trim()
    if (crumb2Val && crumb2Val.length <= 50 && !crumb2Val.includes("Error")) {
      cachedSession = { cookies, crumb: crumb2Val, ts: Date.now() }
      return cachedSession
    }
  }

  cachedSession = { cookies, crumb, ts: Date.now() }
  return cachedSession
}

async function fetchYahoo(symbol: string, modules: string): Promise<any> {
  const session = await getYahooSession()
  const crumbParam = encodeURIComponent(session.crumb)
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${crumbParam}`
  const res = await httpsGet(url, {
    "User-Agent": UA,
    Cookie: session.cookies,
  })
  if (res.status === 200) {
    try {
      return JSON.parse(res.body)?.quoteSummary?.result?.[0] ?? null
    } catch { return null }
  }
  // Reset and retry
  cachedSession = null
  const s2 = await getYahooSession()
  const url2 = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}&crumb=${encodeURIComponent(s2.crumb)}`
  const res2 = await httpsGet(url2, { "User-Agent": UA, Cookie: s2.cookies })
  if (res2.status === 200) {
    try { return JSON.parse(res2.body)?.quoteSummary?.result?.[0] ?? null } catch { return null }
  }
  return null
}

async function getChart(symbol: string): Promise<any> {
  try {
    const res = await httpsGet(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
      { "User-Agent": UA },
    )
    if (res.status !== 200) return null
    return JSON.parse(res.body)?.chart?.result?.[0] ?? null
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")
  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 })
  }

  const ticker = symbol.toUpperCase().trim()

  const [summary, chart] = await Promise.all([
    fetchYahoo(ticker, "assetProfile,defaultKeyStatistics,financialData,earningsTrend,summaryDetail,recommendationTrend,price"),
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

  const raw = (obj: any): number | null => {
    if (obj == null) return null
    if (typeof obj === "number") return obj
    if (typeof obj === "object" && typeof obj.raw === "number") return obj.raw
    return null
  }

  const statsMap: Record<string, number | null> = {
    trailingPE: raw(stats.trailingPE) ?? raw(detail.trailingPE),
    forwardPE: raw(stats.forwardPE) ?? raw(detail.forwardPE),
    pegRatio: raw(stats.pegRatio),
    priceToBook: raw(stats.priceToBook) ?? raw(detail.priceToBook),
    priceToSalesTrailing12Months: raw(stats.priceToSalesTrailing12Months) ?? raw(detail.priceToSalesTrailing12Months),
    enterpriseToRevenue: raw(stats.enterpriseToRevenue),
    enterpriseToEbitda: raw(stats.enterpriseToEbitda) ?? raw(detail.enterpriseToEbitda),
    trailingEps: raw(stats.trailingEps),
    forwardEps: raw(stats.forwardEps),
    bookValue: raw(stats.bookValue),
    revenueGrowth: raw(financial.revenueGrowth),
    earningsGrowth: raw(financial.earningsGrowth),
    revenue: raw(financial.totalRevenue),
    ebitda: raw(financial.ebitda),
    freeCashflow: raw(financial.freeCashflow),
    operatingCashflow: raw(financial.operatingCashflow),
    totalCash: raw(financial.totalCash),
    totalDebt: raw(financial.totalDebt),
    debtToEquity: raw(financial.debtToEquity),
    returnOnEquity: raw(financial.returnOnEquity),
    returnOnAssets: raw(financial.returnOnAssets),
    grossMargins: raw(financial.grossMargins),
    operatingMargins: raw(financial.operatingMargins),
    profitMargins: raw(financial.profitMargins),
    currentRatio: raw(financial.currentRatio),
    targetMeanPrice: raw(financial.targetMeanPrice),
    targetHighPrice: raw(financial.targetHighPrice),
    targetLowPrice: raw(financial.targetLowPrice),
    recommendationMean: raw(financial.recommendationMean),
    numberOfAnalystOpinions: raw(financial.numberOfAnalystOpinions),
    dividendYield: raw(detail.dividendYield),
    payoutRatio: raw(detail.payoutRatio),
    marketCap: raw(detail.marketCap) ?? raw(stats.marketCap),
    enterpriseValue: raw(stats.enterpriseValue),
    beta: raw(detail.beta),
    sharesOutstanding: raw(stats.sharesOutstanding),
    heldPercentInsiders: raw(stats.heldPercentInsiders),
    heldPercentInstitutions: raw(stats.heldPercentInstitutions),
    earningsQuarterlyGrowth: raw(financial.earningsQuarterlyGrowth),
    yearGrowth: null,
  }

  const trend = summary?.earningsTrend?.trend ?? []
  const currentYear = new Date().getFullYear()
  for (const t of trend) {
    if (t?.period === `${currentYear}-year` || t?.period === "0 year") {
      statsMap.estimatedEpsCurrentYear = raw(t?.earningsEstimate?.avg)
      statsMap.estimatedRevenueGrowth = raw(t?.revenueEstimate?.avg)
    }
    if (t?.period === `${currentYear + 1}-year` || t?.period === "1 year") {
      statsMap.estimatedEpsNextYear = raw(t?.earningsEstimate?.avg)
    }
  }

  const recTrend = summary?.recommendationTrend?.trend ?? []
  let buyCount = 0, holdCount = 0, sellCount = 0
  for (const r of recTrend) {
    buyCount += (r?.strongBuy ?? 0) + (r?.buy ?? 0)
    holdCount += (r?.hold ?? 0)
    sellCount += (r?.sell ?? 0) + (r?.strongSell ?? 0)
  }

  return NextResponse.json({
    profile: {
      symbol: ticker,
      name: profile.longName ?? profile.shortName ?? chart?.meta?.longName ?? ticker,
      exchange: summary?.price?.exchangeName ?? chart?.meta?.exchangeName ?? "",
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
      week52High: raw(detail.fiftyTwoWeekHigh) ?? chart?.meta?.fiftyTwoWeekHigh ?? 0,
      week52Low: raw(detail.fiftyTwoWeekLow) ?? chart?.meta?.fiftyTwoWeekLow ?? 0,
      marketCap: statsMap.marketCap ?? 0,
      volume: chart?.meta?.regularMarketVolume ?? 0,
      currency: chart?.meta?.currency ?? "USD",
    },
    stats: statsMap,
    analystData: {
      targetMean: statsMap.targetMeanPrice,
      targetHigh: statsMap.targetHighPrice,
      targetLow: statsMap.targetLowPrice,
      numberOfAnalysts: statsMap.numberOfAnalystOpinions,
      recommendationMean: statsMap.recommendationMean,
      recommendationKey: financial.recommendationKey ?? null,
      buyCount,
      holdCount,
      sellCount,
    },
  })
}

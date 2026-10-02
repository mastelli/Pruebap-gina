import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const UA = { "User-Agent": "Mozilla/5.0" }

interface SearchResult {
  symbol: string
  name: string
  exchange?: string
  type?: string
  currency?: string
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] })
  }
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`,
      { headers: UA }
    )
    if (!res.ok) return NextResponse.json({ results: [] })
    const json = await res.json()
    const results: SearchResult[] = []
    for (const quote of json?.quotes ?? []) {
      if (!quote?.symbol) continue
      results.push({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        exchange: quote.exchange || undefined,
        type: quote.quoteType || undefined,
        currency: quote.currency || undefined,
      })
    }
    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}

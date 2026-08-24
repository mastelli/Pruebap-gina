import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Cotaciones de Yahoo Finance (retardo ~15 min en algunos mercados)
const UA = { "User-Agent": "Mozilla/5.0" }
const QUOTE_TTL = 10 * 60 * 1000

interface Quote {
  symbol: string
  price: number
  previousClose: number | null
  currency: string
}

type SymbolCache = Map<string, string>
type QuoteCache = Map<string, { ts: number; quote: Quote | null }>

const globalCache = globalThis as unknown as {
  __pfSymbols?: SymbolCache
  __pfQuotes?: QuoteCache
}
const symbolCache: SymbolCache = (globalCache.__pfSymbols ??= new Map())
const quoteCache: QuoteCache = (globalCache.__pfQuotes ??= new Map())

async function resolveSymbol(isin: string, name?: string): Promise<string | null> {
  const cached = symbolCache.get(isin)
  if (cached) return cached

  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/lookup?query=${encodeURIComponent(isin)}&type=all&count=5`,
      { headers: UA },
    )
    const json = await res.json()
    const symbol = json?.finance?.result?.[0]?.documents?.[0]?.symbol ?? null
    if (symbol) {
      symbolCache.set(isin, symbol)
      return symbol
    }
  } catch {
    // seguimos con la busqueda por nombre
  }

  if (name && name.trim().length > 1) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(name.trim())}&quotesCount=3&newsCount=0`,
        { headers: UA },
      )
      const json = await res.json()
      const symbol = (json?.quotes ?? []).find((q: { symbol?: string }) => q.symbol)?.symbol ?? null
      if (symbol) {
        symbolCache.set(isin, symbol)
        return symbol
      }
    } catch {
      // sin simbolo
    }
  }

  return null
}

async function getQuote(symbol: string): Promise<Quote | null> {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
    { headers: UA },
  )
  const json = await res.json()
  const meta = json?.chart?.result?.[0]?.meta
  if (!meta || typeof meta.regularMarketPrice !== "number") return null
  const previousClose =
    typeof meta.chartPreviousClose === "number"
      ? meta.chartPreviousClose
      : typeof meta.previousClose === "number"
        ? meta.previousClose
        : null
  return {
    symbol: meta.symbol ?? symbol,
    price: meta.regularMarketPrice,
    previousClose,
    currency: meta.currency ?? "",
  }
}

export async function POST(request: NextRequest) {
  let assets: Array<{ isin?: string; name?: string }> = []
  try {
    const body = await request.json()
    assets = Array.isArray(body?.assets) ? body.assets : []
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const results: Record<string, Quote | null> = {}

  for (const asset of assets) {
    const isin = String(asset?.isin ?? "").trim().toUpperCase()
    if (!isin || results[isin] !== undefined) continue

    const cached = quoteCache.get(isin)
    if (cached && Date.now() - cached.ts < QUOTE_TTL) {
      results[isin] = cached.quote
      continue
    }

    try {
      const symbol = await resolveSymbol(isin, asset?.name)
      const quote = symbol ? await getQuote(symbol) : null
      quoteCache.set(isin, { ts: Date.now(), quote })
      results[isin] = quote
    } catch {
      results[isin] = null
    }
  }

  return NextResponse.json({ results })
}

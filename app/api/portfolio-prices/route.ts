import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Fuentes: Yahoo Finance + Stooq.com para mercados europeos
const UA = { "User-Agent": "Mozilla/5.0" }
const QUOTE_TTL = 5 * 1000

interface Quote {
  symbol: string
  price: number
  previousClose: number | null
  currency: string
  exchange?: string
  marketOpen?: boolean
  sessionStart?: number
  sessionEnd?: number
  quoteTime?: number
}

interface SymbolInfo {
  symbol: string
  currency?: string
}

type SymbolCache = Map<string, SymbolInfo>
type QuoteCache = Map<string, { ts: number; quote: Quote | null }>

const globalCache = globalThis as unknown as {
  __pfSymbols?: SymbolCache
  __pfQuotes?: QuoteCache
}
const symbolCache: SymbolCache = (globalCache.__pfSymbols ??= new Map())
const quoteCache: QuoteCache = (globalCache.__pfQuotes ??= new Map())

// --- Stooq.com (gratis, sin API key) ---

const STOOQ_SUFFIX_MAP: Record<string, string> = {
  MC: "mc",
  L: "l",
  DE: "de",
  PA: "pa",
  AS: "as",
  BR: "br",
  SW: "sw",
  IM: "it",
  HI: "he",
  MI: "mi",
  TO: "to",
  CN: "cn",
  HK: "hk",
  T: "t",
  SS: "ss",
  SZ: "sz",
  KS: "kr",
  SA: "sa",
  AX: "ax",
  NZ: "nz",
  IR: "ie",
  JO: "za",
  VX: "ch",
  TG: "tg",
}

function isEuropeanSymbol(yahooSymbol: string): boolean {
  const suffix = yahooSymbol.split(".")[1]
  return suffix !== undefined && suffix in STOOQ_SUFFIX_MAP
}

function yahooToStooq(yahooSymbol: string): string {
  const dotIdx = yahooSymbol.indexOf(".")
  if (dotIdx === -1) return `${yahooSymbol.toLowerCase()}.us`
  const ticker = yahooSymbol.slice(0, dotIdx).toLowerCase()
  const suffix = yahooSymbol.slice(dotIdx + 1).toUpperCase()
  const stooqSuffix = STOOQ_SUFFIX_MAP[suffix] ?? suffix.toLowerCase()
  return `${ticker}.${stooqSuffix}`
}

function stooqCurrencyFromSymbol(stooqSymbol: string): string {
  const suffix = stooqSymbol.split(".")[1]
  switch (suffix) {
    case "mc": case "pa": case "as": case "br": case "de": case "it": case "he": case "mi": case "ie": return "EUR"
    case "l": return "GBP"
    case "sw": case "ch": return "CHF"
    case "us": return "USD"
    case "to": case "cn": return "CAD"
    case "hk": return "HKD"
    case "t": return "JPY"
    case "ss": case "sz": return "CNY"
    case "kr": return "KRW"
    case "sa": return "SAR"
    case "ax": return "AUD"
    case "nz": return "NZD"
    case "za": return "ZAR"
    case "mx": return "MXN"
    case "bvsp": return "BRL"
    default: return "EUR"
  }
}

async function getStooqQuote(yahooSymbol: string): Promise<Quote | null> {
  const stooqSymbol = yahooToStooq(yahooSymbol)
  try {
    const res = await fetch(
      `https://stooq.com/q/l/?s=${encodeURIComponent(stooqSymbol)}&f=sd2t2ohlcv&h&e=csv`,
      { headers: UA, signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) return null
    const text = await res.text()
    const lines = text.trim().split("\n")
    if (lines.length < 2) return null
    const headers = lines[0].split(",")
    const values = lines[1].split(",")
    if (headers.length < 7 || values.length < 7) return null

    const get = (name: string) => {
      const idx = headers.indexOf(name)
      return idx >= 0 ? values[idx]?.trim() : undefined
    }

    const closeStr = get("Close")
    const openStr = get("Open")
    const highStr = get("High")
    const lowStr = get("Low")
    if (!closeStr || closeStr === "N/A") return null

    const price = parseFloat(closeStr)
    if (isNaN(price)) return null

    // Stooq no da previousClose directamente; usar Open como estimación
    const open = openStr && openStr !== "N/A" ? parseFloat(openStr) : null
    const dateStr = get("Date")
    const timeStr = get("Time")
    let quoteTime: number | undefined
    if (dateStr && timeStr) {
      const d = new Date(`${dateStr}T${timeStr}`)
      if (!isNaN(d.getTime())) quoteTime = Math.floor(d.getTime() / 1000)
    }

    return {
      symbol: yahooSymbol,
      price,
      previousClose: open,
      currency: stooqCurrencyFromSymbol(stooqSymbol),
      exchange: undefined,
      marketOpen: undefined,
      sessionStart: undefined,
      sessionEnd: undefined,
      quoteTime,
    }
  } catch {
    return null
  }
}

async function getStooqBatch(yahooSymbols: string[]): Promise<Map<string, Quote>> {
  const out = new Map<string, Quote>()
  const european = yahooSymbols.filter(isEuropeanSymbol)
  if (european.length === 0) return out
  const results = await Promise.allSettled(european.map(getStooqQuote))
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      out.set(r.value.symbol, r.value)
    }
  }
  return out
}

// --- Yahoo Finance (resto del mundo) ---

async function resolveSymbolCandidates(isin: string, name?: string): Promise<string[]> {
  const symbols: string[] = []
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/lookup?query=${encodeURIComponent(isin)}&type=all&count=5`,
      { headers: UA },
    )
    const json = await res.json()
    for (const doc of json?.finance?.result?.[0]?.documents ?? []) {
      if (doc?.symbol && !symbols.includes(doc.symbol)) symbols.push(doc.symbol)
    }
  } catch {
    // seguimos con la busqueda por nombre
  }

  if (symbols.length === 0 && name && name.trim().length > 1) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(name.trim())}&quotesCount=3&newsCount=0`,
        { headers: UA },
      )
      const json = await res.json()
      const symbol = (json?.quotes ?? []).find((q: { symbol?: string }) => q.symbol)?.symbol ?? null
      if (symbol) symbols.push(symbol)
    } catch {
      // sin simbolo
    }
  }

  return symbols
}

// Estado y horario de la sesion regular segun el calendario del mercado
function sessionFromMeta(meta: {
  currentTradingPeriod?: { regular?: { start?: number; end?: number } }
}): { marketOpen?: boolean; sessionStart?: number; sessionEnd?: number } {
  const regular = meta?.currentTradingPeriod?.regular
  if (typeof regular?.start !== "number" || typeof regular?.end !== "number") return {}
  const now = Math.floor(Date.now() / 1000)
  return {
    marketOpen: now >= regular.start && now < regular.end,
    sessionStart: regular.start,
    sessionEnd: regular.end,
  }
}

async function getChartQuote(symbol: string): Promise<Quote | null> {
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
  const session = sessionFromMeta(meta)
  return {
    symbol: meta.symbol ?? symbol,
    price: meta.regularMarketPrice,
    previousClose,
    currency: meta.currency ?? "",
    exchange: meta.exchangeData?.exchange ?? meta.exchange ?? undefined,
    marketOpen: session.marketOpen,
    sessionStart: session.sessionStart,
    sessionEnd: session.sessionEnd,
    quoteTime: typeof meta.regularMarketTime === "number" ? meta.regularMarketTime : undefined,
  }
}

// Resuelve el ISIN probando candidatos y prefiriendo el listado en EUR
// (p. ej. listing europeo en vez de la suiza en CHF para ETFs UCITS)
async function resolveAsset(isin: string, name?: string): Promise<SymbolInfo | null> {
  const cached = symbolCache.get(isin)
  if (cached) return cached

  const candidates = await resolveSymbolCandidates(isin, name)
  let fallback: Quote | null = null
  for (const symbol of candidates) {
    const quote = await getChartQuote(symbol).catch(() => null)
    if (!quote) continue
    if (quote.currency === "EUR") {
      const info = { symbol, currency: quote.currency || undefined }
      symbolCache.set(isin, info)
      return info
    }
    if (!fallback) fallback = quote
  }
  if (fallback) {
    const info = { symbol: fallback.symbol, currency: fallback.currency || undefined }
    symbolCache.set(isin, info)
    return info
  }
  return null
}

// Un unico GET para todos los simbolos (endpoint spark publico)
async function getBatchQuotes(symbols: string[]): Promise<Map<string, Quote>> {
  const out = new Map<string, Quote>()
  if (symbols.length === 0) return out
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(symbols.join(","))}&range=1d&interval=5m`,
      { headers: UA },
    )
    if (!res.ok) return out
    const json = await res.json()
    for (const item of json?.spark?.result ?? []) {
      const meta = item?.response?.[0]?.meta
      if (!item?.symbol || !meta || typeof meta.regularMarketPrice !== "number") continue
      const previousClose =
        typeof meta.chartPreviousClose === "number"
          ? meta.chartPreviousClose
          : typeof meta.previousClose === "number"
            ? meta.previousClose
            : null
      const session = sessionFromMeta(meta)
      out.set(item.symbol, {
        symbol: meta.symbol ?? item.symbol,
        price: meta.regularMarketPrice,
        previousClose,
        currency: meta.currency ?? "",
        exchange: meta.exchangeData?.exchange ?? meta.exchange ?? undefined,
        marketOpen: session.marketOpen,
        sessionStart: session.sessionStart,
        sessionEnd: session.sessionEnd,
        quoteTime: typeof meta.regularMarketTime === "number" ? meta.regularMarketTime : undefined,
      })
    }
  } catch {
    // sin datos por lote
  }
  return out
}

export async function POST(request: NextRequest) {
  let assets: Array<{ isin?: string; name?: string }> = []
  let currencies: string[] = []
  try {
    const body = await request.json()
    assets = Array.isArray(body?.assets) ? body.assets : []
    currencies = Array.isArray(body?.currencies)
      ? Array.from(
          new Set(
            body.currencies.map((c: unknown) => String(c).trim().toUpperCase()).filter(Boolean),
          ),
        )
      : []
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const results: Record<string, Quote | null> = {}
  const pendingAssets: Array<{ isin: string; name?: string }> = []

  for (const asset of assets) {
    const isin = String(asset?.isin ?? "").trim().toUpperCase()
    if (!isin || results[isin] !== undefined) continue

    const cached = quoteCache.get(isin)
    if (cached && Date.now() - cached.ts < QUOTE_TTL) {
      results[isin] = cached.quote
      continue
    }

    pendingAssets.push({ isin, name: String(asset?.name ?? "") })
  }

  // 1) aseguramos el simbolo de cada ISIN pendiente (solo la primera vez)
  const resolved = new Map<string, SymbolInfo>()
  for (const { isin, name } of pendingAssets) {
    const info = await resolveAsset(isin, name).catch(() => null)
    if (info) resolved.set(isin, info)
  }

  // 2) cotizaciones: Stooq para europeas, Yahoo para el resto
  const symbols = Array.from(resolved.values()).map((info) => info.symbol)
  const europeanSymbols = symbols.filter(isEuropeanSymbol)
  const yahooSymbols = symbols.filter((s) => !isEuropeanSymbol(s))
  const fxSymbols = currencies.filter((c) => c !== "EUR").map((c) => `${c}EUR=X`)

  const [stooqBatch, yahooBatch] = await Promise.all([
    getStooqBatch(europeanSymbols),
    getBatchQuotes([...yahooSymbols, ...fxSymbols]),
  ])

  // 3) combinar resultados: Stooq tiene prioridad para europeas
  for (const [isin, info] of resolved) {
    let quote = stooqBatch.get(info.symbol) ?? yahooBatch.get(info.symbol) ?? null
    if (!quote) {
      quote = await getChartQuote(info.symbol).catch(() => null)
    }
    if (quote && !quote.currency && info.currency) {
      quote = { ...quote, currency: info.currency }
    }
    quoteCache.set(isin, { ts: Date.now(), quote })
    results[isin] = quote
  }

  // 4) tipos de cambio frente al euro
  const fx: Record<string, number> = {}
  for (const currency of currencies) {
    const rate = yahooBatch.get(`${currency}EUR=X`)?.price
    if (typeof rate === "number") fx[currency] = rate
  }

  return NextResponse.json({ results, fx })
}

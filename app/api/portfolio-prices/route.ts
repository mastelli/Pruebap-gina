import { NextRequest, NextResponse } from "next/server"
import { getTradingViewQuoteByIsin } from "@/lib/tradingview"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Fuentes: TradingView directo por ISIN, Tradegate por ISIN,
// Yahoo Finance + Stooq.com como respaldo
const UA = { "User-Agent": "Mozilla/5.0" }
const QUOTE_TTL = 5 * 1000

interface Quote {
  symbol: string
  price: number
  previousClose: number | null
  currency: string
  longName?: string
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

// --- Tradegate Exchange (endpoint publico por ISIN) ---

function tradegateNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") {
    // Tradegate mezcla floats ("130.21"), formato aleman ("296,40") y
    // miles con espacio ("1 220,00"): se quitan todos los espacios primero
    const s = value.trim().replace(/\s/g, "")
    if (!s) return null
    const normalized = /,\d{1,4}$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s
    const n = parseFloat(normalized)
    return Number.isFinite(n) ? n : null
  }
  return null
}

async function getTradegateQuote(isin: string): Promise<Quote | null> {
  if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin.trim().toUpperCase())) return null
  try {
    const res = await fetch(
      `https://www.tradegate.de/refresh.php?isin=${encodeURIComponent(isin.trim().toUpperCase())}`,
      { headers: UA, signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) return null
    const text = await res.text()
    if (!text.trim()) return null
    const json = JSON.parse(text)
    const price = tradegateNumber(json?.last) ?? tradegateNumber(json?.ask) ?? tradegateNumber(json?.bid)
    if (price === null) return null
    return {
      symbol: isin.trim().toUpperCase(),
      price,
      previousClose: tradegateNumber(json?.close),
      currency: "EUR",
      exchange: "Tradegate",
    }
  } catch {
    return null
  }
}

// --- TradingView (respaldo para Tradegate: search por ISIN + scanner) ---

const TV_HEADERS = {
  ...UA,
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  Referer: "https://www.tradingview.com/",
  Origin: "https://www.tradingview.com",
}

const tvTickerCache: Map<string, string | null> = (
  globalThis as unknown as { __tvTickers?: Map<string, string | null> }
).__tvTickers ??= new Map()

// Ticker del ISIN en Tradegate segun TradingView (p. ej. MSFT -> "MSF")
async function getTradingViewTradegateTicker(isin: string): Promise<string | null> {
  const key = isin.trim().toUpperCase()
  if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(key)) return null
  const cached = tvTickerCache.get(key)
  if (cached !== undefined) return cached
  try {
    const res = await fetch(
      `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(key)}`,
      { headers: TV_HEADERS, signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return null
    const json = await res.json()
    const rows = Array.isArray(json) ? json : []
    const hit = rows.find(
      (h: { exchange?: unknown; symbol?: unknown }) =>
        String(h?.exchange ?? "").toUpperCase() === "TRADEGATE" && typeof h?.symbol === "string" && h.symbol !== "",
    ) as { symbol?: string } | undefined
    const ticker = hit?.symbol ?? null
    if (ticker) tvTickerCache.set(key, ticker)
    return ticker
  } catch {
    return null
  }
}

async function getTradingViewTradegateQuote(isin: string): Promise<Quote | null> {
  const ticker = await getTradingViewTradegateTicker(isin).catch(() => null)
  if (!ticker) return null
  try {
    const res = await fetch(
      `https://scanner.tradingview.com/symbol?symbol=${encodeURIComponent(`TRADEGATE:${ticker}`)}&fields=${encodeURIComponent("close,change_abs,currency,description")}`,
      { headers: TV_HEADERS, signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return null
    const json = await res.json()
    const price = typeof json?.close === "number" && Number.isFinite(json.close) ? json.close : null
    if (price === null) return null
    const changeAbs =
      typeof json?.change_abs === "number" && Number.isFinite(json.change_abs) ? json.change_abs : null
    return {
      symbol: `TRADEGATE:${ticker}`,
      price,
      previousClose: changeAbs !== null ? price - changeAbs : null,
      currency: typeof json?.currency === "string" && json.currency !== "" ? json.currency : "EUR",
      longName: typeof json?.description === "string" && json.description !== "" ? json.description : undefined,
      exchange: "Tradegate",
    }
  } catch {
    return null
  }
}

// Tradegate por ISIN con respaldo en TradingView
async function getTradegateQuoteWithFallback(isin: string): Promise<Quote | null> {
  const direct = await getTradegateQuote(isin).catch(() => null)
  if (direct) return direct
  return getTradingViewTradegateQuote(isin).catch(() => null)
}

// --- Yahoo Finance (resto del mundo) ---

async function resolveSymbolCandidates(isin: string, name?: string, exchangeReq?: string): Promise<string[]> {
  const symbols: string[] = []
  const exchangeNorm = exchangeReq ? exchangeReq.trim().toUpperCase() : ""
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
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(name.trim())}&quotesCount=5&newsCount=0`,
        { headers: UA },
      )
      const json = await res.json()
      const quotes: Array<{ symbol?: string; exchange?: string }> = json?.quotes ?? []
      if (exchangeNorm) {
        const m = quotes.find((q) => (q.exchange ?? "").toUpperCase().includes(exchangeNorm) || exchangeNorm.includes((q.exchange ?? "").toUpperCase()))
        if (m?.symbol) symbols.push(m.symbol)
      }
      if (symbols.length === 0) {
        const symbol = quotes.find((q: { symbol?: string }) => q.symbol)?.symbol ?? null
        if (symbol) symbols.push(symbol)
      }
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
    longName: meta.longName ?? meta.shortName ?? undefined,
    exchange: meta.exchangeData?.exchange ?? meta.exchange ?? undefined,
    marketOpen: session.marketOpen,
    sessionStart: session.sessionStart,
    sessionEnd: session.sessionEnd,
    quoteTime: typeof meta.regularMarketTime === "number" ? meta.regularMarketTime : undefined,
  }
}

// Resuelve el ISIN probando candidatos y prefiriendo el listado en EUR
// (p. ej. listing europeo en vez de la suiza en CHF para ETFs UCITS)
async function resolveAsset(isin: string, name?: string, exchangeReq?: string, symbolReq?: string): Promise<SymbolInfo | null> {
  const cacheKey = `${symbolReq ?? ""}|${isin}|${exchangeReq ?? ""}`
  const cached = symbolCache.get(cacheKey) || symbolCache.get(isin)
  if (cached) return cached

  if (symbolReq) {
    const quote = await getChartQuote(symbolReq).catch(() => null)
    if (quote) {
      const info = { symbol: quote.symbol ?? symbolReq, currency: quote.currency || undefined }
      symbolCache.set(cacheKey, info)
      symbolCache.set(isin, info)
      return info
    }
    // El usuario eligio un listing exacto (p. ej. "MSF.TG"). Si no existe
    // tal cual, se prueba Stooq en Europa, pero jamas se sustituye por otro
    // listing distinto (p. ej. el de EEUU). Solo cuando el "simbolo" es en
    // realidad un ISIN se sigue buscando por ISIN/nombre.
    if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(symbolReq.trim().toUpperCase())) {
      if (isEuropeanSymbol(symbolReq)) {
        const stooq = await getStooqQuote(symbolReq).catch(() => null)
        if (stooq) {
          const info = { symbol: stooq.symbol ?? symbolReq, currency: stooq.currency || undefined }
          symbolCache.set(cacheKey, info)
          symbolCache.set(isin, info)
          return info
        }
      }
      return null
    }
  }

  const candidates = await resolveSymbolCandidates(isin, name, exchangeReq)
  let fallback: Quote | null = null
  const ex = exchangeReq ? exchangeReq.trim().toUpperCase() : ""
  for (const symbol of candidates) {
    const quote = await getChartQuote(symbol).catch(() => null)
    if (!quote) continue
    const qex = (quote.exchange ?? "").toUpperCase()
    const matchesEx = !ex || qex.includes(ex) || ex.includes(qex)
    if (quote.currency === "EUR" && matchesEx) {
      const info = { symbol, currency: quote.currency || undefined }
      symbolCache.set(cacheKey, info)
      symbolCache.set(isin, info)
      return info
    }
    if (matchesEx && !fallback) fallback = quote
    if (!matchesEx && !fallback) fallback = quote
  }
  if (fallback) {
    const info = { symbol: fallback.symbol, currency: fallback.currency || undefined }
    symbolCache.set(cacheKey, info)
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
        longName: meta.longName ?? meta.shortName ?? undefined,
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
  let assets: Array<{ isin?: string; name?: string; exchange?: string; symbol?: string }> = []
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
  const pendingAssets: Array<{ key: string; isin: string; name?: string; exchange?: string; symbol?: string }> = []

  for (const asset of assets) {
    const name = String(asset?.name ?? "").trim()
    const isin = String(asset?.isin ?? "").trim().toUpperCase()
    const key = isin || name.toUpperCase()
    if (!key || results[key] !== undefined) continue

    const cached = quoteCache.get(key)
    if (cached && Date.now() - cached.ts < QUOTE_TTL) {
      results[key] = cached.quote
      continue
    }

    // Posiciones de Tradegate: cotizan en su propio endpoint por ISIN.
    // Si no hay ISIN o Tradegate no lo conoce, no se inventa otra cotizacion.
    const symbolReq = asset?.symbol ? String(asset.symbol).trim() : ""
    const exchangeReq = asset?.exchange ? String(asset.exchange).trim() : ""
    if (/tradegate/i.test(exchangeReq) || /\.tg$/i.test(symbolReq)) {
      const tgIsin = /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)
        ? isin
        : /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(symbolReq.toUpperCase())
          ? symbolReq.toUpperCase()
          : ""
      const tgQuote = tgIsin ? await getTradegateQuoteWithFallback(tgIsin).catch(() => null) : null
      quoteCache.set(key, { ts: Date.now(), quote: tgQuote })
      results[key] = tgQuote
      continue
    }

    // TradingView directo por ISIN antes que Yahoo: respeta el listing
    // de la bolsa pedida y trae nombre oficial + moneda real.
    const tvIsin = /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)
      ? isin
      : /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(key)
        ? key
        : ""
    if (tvIsin) {
      const tvQuote = await getTradingViewQuoteByIsin(
        tvIsin,
        asset?.exchange ? String(asset.exchange) : undefined,
      ).catch(() => null)
      if (tvQuote) {
        quoteCache.set(key, { ts: Date.now(), quote: tvQuote })
        results[key] = tvQuote
        continue
      }
    }

    pendingAssets.push({ key, isin: isin || key, name, exchange: asset?.exchange ? String(asset.exchange) : undefined, symbol: asset?.symbol ? String(asset.symbol).trim() : undefined })
  }

  // 1) aseguramos el simbolo de cada ISIN pendiente (solo la primera vez)
  const resolved = new Map<string, SymbolInfo>()
  for (const { key, isin, name, exchange, symbol } of pendingAssets) {
    const info = await resolveAsset(isin, name, exchange, symbol).catch(() => null)
    if (info) {
      resolved.set(key, info)
    }
  }

  // 1b) rescate por Tradegate: lo que Yahoo/Stooq no resolvieron y tenga
  // ISIN valido se prueba en Tradegate (p. ej. ejecuciones XGAT ya
  // importadas). Si tampoco esta, queda sin cotizacion: no se inventa nada.
  const tgMissing = pendingAssets.filter(
    (p) => !resolved.has(p.key) && /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(p.isin),
  )
  if (tgMissing.length > 0) {
    const tgResults = await Promise.allSettled(
      tgMissing.map((p) => getTradegateQuoteWithFallback(p.isin).catch(() => null)),
    )
    tgResults.forEach((r, i) => {
      const quote = r.status === "fulfilled" ? r.value : null
      if (quote) {
        const key = tgMissing[i].key
        quoteCache.set(key, { ts: Date.now(), quote })
        results[key] = quote
      }
    })
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
  for (const [key, info] of resolved) {
    let quote = stooqBatch.get(info.symbol) ?? yahooBatch.get(info.symbol) ?? null
    if (!quote) {
      quote = await getChartQuote(info.symbol).catch(() => null)
    }
    if (quote && !quote.currency && info.currency) {
      quote = { ...quote, currency: info.currency }
    }
    quoteCache.set(key, { ts: Date.now(), quote })
    results[key] = quote
    if (quote) {
      for (const p of pendingAssets) {
        if (p.key === key && p.name) {
          const n = p.name.trim().toUpperCase()
          if (n && !results[n]) results[n] = quote
        }
      }
    }
  }

  // 4) tipos de cambio frente al euro
  const fx: Record<string, number> = {}
  for (const currency of currencies) {
    const rate = yahooBatch.get(`${currency}EUR=X`)?.price
    if (typeof rate === "number") fx[currency] = rate
  }

  return NextResponse.json({ results, fx })
}

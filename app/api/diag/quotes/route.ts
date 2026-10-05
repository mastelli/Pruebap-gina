import { NextRequest, NextResponse } from "next/server"
import { getTradegateQuote } from "@/lib/tradegate"
import { getTradingViewQuoteByIsin } from "@/lib/tradingview"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Diagnostico (requiere sesion): prueba cada fuente con un ISIN y dice
// que responde, cuanto tarda y que precio da. Ej:
// /api/diag/quotes?isin=US5949181045
async function timed<T>(source: string, fn: () => Promise<T>) {
  const start = Date.now()
  try {
    const value = await fn()
    return { source, ok: value !== null && value !== undefined, ms: Date.now() - start, value }
  } catch (e) {
    return {
      source,
      ok: false,
      ms: Date.now() - start,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

export async function GET(request: NextRequest) {
  const isin = request.nextUrl.searchParams.get("isin")?.trim().toUpperCase() ?? ""
  if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)) {
    return NextResponse.json({ error: "ISIN inválido. Uso: /api/diag/quotes?isin=US5949181045" }, { status: 400 })
  }
  const [tradegate, tradingview] = await Promise.all([
    timed("tradegate.de", () => getTradegateQuote(isin)),
    timed("tradingview", () => getTradingViewQuoteByIsin(isin)),
  ])
  return NextResponse.json({ isin, tradegate, tradingview })
}

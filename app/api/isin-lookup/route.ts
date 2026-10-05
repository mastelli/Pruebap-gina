import { NextRequest, NextResponse } from "next/server"
import { findIsinForSymbol } from "@/lib/tradingview"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Devuelve el ISIN de un simbolo (y bolsa opcional) usando TradingView.
// Sirve para rellenar solas las posiciones que no traen ISIN.
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim() ?? ""
  const exchange = request.nextUrl.searchParams.get("exchange")?.trim() ?? ""
  if (!symbol) {
    return NextResponse.json({ error: "Falta symbol" }, { status: 400 })
  }
  try {
    const isin = await findIsinForSymbol(symbol, exchange)
    return NextResponse.json({ isin })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al buscar ISIN" },
      { status: 502 },
    )
  }
}

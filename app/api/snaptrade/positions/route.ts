import { NextRequest, NextResponse } from "next/server"
import { getCallerSnapTradeUser, getSnapTradeClient, isSnapTradeConfigured } from "@/lib/snaptrade-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function kindFromSnapTrade(kind: unknown): "stock" | "etf" | "fund" | "other" {
  const k = String(kind ?? "").toLowerCase()
  if (k === "etf") return "etf"
  if (k === "mutualfund" || k === "fund") return "fund"
  if (k === "stock" || k === "adr") return "stock"
  return "other"
}

// Posiciones de una cuenta del cliente que llama, normalizadas para la
// cartera. No se inventa nada: solo lo que devuelve su broker.
export async function GET(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get("accountId")?.trim()
  if (!accountId) {
    return NextResponse.json({ error: "Falta accountId" }, { status: 400 })
  }
  if (!isSnapTradeConfigured()) {
    return NextResponse.json({ error: "SnapTrade no configurado" }, { status: 400 })
  }
  try {
    const client = getSnapTradeClient()
    const { userId, userSecret } = await getCallerSnapTradeUser()
    const res = (await client.accountInformation.getAllAccountPositions({
      accountId,
      userId,
      userSecret,
    })) as unknown as { data?: { results?: Array<Record<string, unknown>> } }
    const results = Array.isArray(res?.data?.results) ? res.data.results : []
    const positions = []
    for (const p of results) {
      const inst = (p["instrument"] ?? {}) as Record<string, unknown>
      const symbol = String(inst["symbol"] ?? inst["raw_symbol"] ?? "").trim()
      const quantity = toNumber(p["units"])
      if (!symbol || quantity === null || !(quantity > 0)) continue
      positions.push({
        symbol,
        name: String(inst["description"] ?? symbol),
        exchange: String(inst["exchange"] ?? ""),
        currency: String(p["currency"] ?? inst["currency"] ?? "EUR").toUpperCase() || "EUR",
        quantity,
        price: toNumber(p["price"]),
        costBasis: toNumber(p["cost_basis"]),
        kind: kindFromSnapTrade(inst["kind"]),
      })
    }
    return NextResponse.json({ positions })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al leer posiciones" },
      { status: 502 },
    )
  }
}

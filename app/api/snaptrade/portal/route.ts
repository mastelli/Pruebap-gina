import { NextResponse } from "next/server"
import { getSnapTradeClient, isSnapTradeConfigured } from "@/lib/snaptrade-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Genera la URL del portal de SnapTrade para conectar el broker
// (el usuario inicia sesion en DEGIRO dentro del portal, nunca aqui).
export async function POST() {
  if (!isSnapTradeConfigured()) {
    return NextResponse.json({ error: "SnapTrade no configurado" }, { status: 400 })
  }
  try {
    const client = getSnapTradeClient()
    const res = (await client.authentication.loginSnapTradeUser({})) as unknown as {
      data?: { redirectURI?: string }
    }
    const redirectURI = res?.data?.redirectURI
    if (!redirectURI) {
      return NextResponse.json({ error: "El portal no devolvió URL" }, { status: 502 })
    }
    return NextResponse.json({ redirectURI })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al generar el portal" },
      { status: 502 },
    )
  }
}

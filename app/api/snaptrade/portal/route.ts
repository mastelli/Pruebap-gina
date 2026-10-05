import { NextResponse } from "next/server"
import { getCallerSnapTradeUser, getSnapTradeClient, isSnapTradeConfigured } from "@/lib/snaptrade-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Genera la URL del portal de SnapTrade para que EL CLIENTE conecte su
// propio broker (sus credenciales de DEGIRO se escriben en el portal,
// nunca en esta pagina).
export async function POST() {
  if (!isSnapTradeConfigured()) {
    return NextResponse.json({ error: "SnapTrade no configurado" }, { status: 400 })
  }
  try {
    const client = getSnapTradeClient()
    const { userId, userSecret } = await getCallerSnapTradeUser()
    const res = (await client.authentication.loginSnapTradeUser({
      userId,
      userSecret,
    })) as unknown as {
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

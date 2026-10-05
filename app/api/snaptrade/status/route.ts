import { NextResponse } from "next/server"
import { getSnapTradeClient, isSnapTradeConfigured } from "@/lib/snaptrade-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  if (!isSnapTradeConfigured()) {
    return NextResponse.json({ configured: false, ok: false })
  }
  try {
    const client = getSnapTradeClient()
    await client.apiStatus.check()
    return NextResponse.json({ configured: true, ok: true })
  } catch (e) {
    return NextResponse.json(
      { configured: true, ok: false, error: e instanceof Error ? e.message : "Error de conexión" },
      { status: 502 },
    )
  }
}

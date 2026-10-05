import { NextResponse } from "next/server"
import { getCallerSnapTradeUser, getSnapTradeClient, isSnapTradeConfigured } from "@/lib/snaptrade-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Cuentas del broker del cliente que llama (solo las suyas).
export async function GET() {
  if (!isSnapTradeConfigured()) {
    return NextResponse.json({ error: "SnapTrade no configurado" }, { status: 400 })
  }
  try {
    const client = getSnapTradeClient()
    const { userId, userSecret } = await getCallerSnapTradeUser()
    const res = (await client.accountInformation.listUserAccounts({
      userId,
      userSecret,
    })) as unknown as {
      data?: Array<Record<string, unknown>>
    }
    const accounts = (Array.isArray(res?.data) ? res.data : []).map((a) => {
      const id = String(a["id"] ?? a["accountId"] ?? "")
      return {
        id,
        name: String(a["name"] ?? a["number"] ?? id),
        institution: String(a["institution_name"] ?? a["institution"] ?? ""),
      }
    }).filter((a) => a.id !== "")
    return NextResponse.json({ accounts })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al listar cuentas" },
      { status: 502 },
    )
  }
}

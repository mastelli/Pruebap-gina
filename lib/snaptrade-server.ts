// Solo servidor (claves en variables de entorno, jamas al navegador).
// Modelo Commercial de SnapTrade: cada cliente de la app tiene su propio
// usuario de SnapTrade y conecta su propio broker (p. ej. su DEGIRO).
// Nadie ve la cartera de otro: todo va con userId+userSecret por cliente.
import { auth } from "@clerk/nextjs/server"
import { Snaptrade, SnaptradeAuth } from "snaptrade-typescript-sdk"
import { cloudGet, cloudSet } from "./cloud-storage"

const SNAP_USER_BASE = "snaptrade-user"

export function isSnapTradeConfigured(): boolean {
  return Boolean(process.env.SNAPTRADE_CLIENT_ID && process.env.SNAPTRADE_CONSUMER_KEY)
}

export function getSnapTradeClient() {
  const clientId = process.env.SNAPTRADE_CLIENT_ID
  const consumerKey = process.env.SNAPTRADE_CONSUMER_KEY
  if (!clientId || !consumerKey) {
    throw new Error("SnapTrade no configurado: faltan SNAPTRADE_CLIENT_ID / SNAPTRADE_CONSUMER_KEY")
  }
  return new Snaptrade({
    auth: SnaptradeAuth.commercialApiKey({ consumerKey, clientId }),
  })
}

export interface SnapTradeUser {
  userId: string
  userSecret: string
}

// Usuario de SnapTrade del cliente que llama (se crea una sola vez y su
// secreto se guarda en su propia fila de la nube).
export async function getCallerSnapTradeUser(): Promise<SnapTradeUser> {
  const { userId } = await auth()
  if (!userId) throw new Error("Sin sesión")
  const stored = (await cloudGet(userId, `${SNAP_USER_BASE}::${userId}`)) as {
    userId?: string
    userSecret?: string
  } | null
  if (stored && typeof stored.userSecret === "string" && stored.userSecret !== "") {
    return { userId, userSecret: stored.userSecret }
  }
  const client = getSnapTradeClient()
  const res = (await client.authentication.registerSnapTradeUser({ userId })) as unknown as {
    data?: { userSecret?: string }
  }
  const userSecret = res?.data?.userSecret
  if (!userSecret) throw new Error("No se pudo registrar el usuario")
  await cloudSet(userId, `${SNAP_USER_BASE}::${userId}`, { userId, userSecret })
  return { userId, userSecret }
}

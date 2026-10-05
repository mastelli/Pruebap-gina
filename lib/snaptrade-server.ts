// Solo servidor (claves en variables de entorno, jamas al navegador).
// Modelo Personal de SnapTrade: las claves son del propio dueno y dan
// acceso de solo lectura a sus cuentas conectadas (p. ej. DEGIRO).
import { Snaptrade, SnaptradeAuth } from "snaptrade-typescript-sdk"

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
    auth: SnaptradeAuth.personalApiKey({ consumerKey, clientId }),
  })
}

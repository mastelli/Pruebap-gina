"use client"

import { useState } from "react"
import { Clock, Landmark, Link2, RefreshCw, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n"

// Posicion traida de SnapTrade, lista para entrar en la cartera
export interface SnapTradeImportItem {
  symbol: string
  name: string
  exchange: string
  currency: string
  quantity: number
  costBasis: number | null
  kind: "stock" | "etf" | "fund" | "other"
}

interface BrokerAccount {
  id: string
  name: string
  institution: string
}

type DegiroState = "idle" | "checking" | "setup" | "accounts" | "importing" | "error"

const SETUP_STEPS: string[] = [
  "Crea tu cuenta Commercial en dashboard.snaptrade.com (para probar vale la clave de test; para clientes reales pide aprobación y facturación).",
  "Copia el clientId y el consumerKey de tu API key.",
  "En Vercel > tu proyecto > Settings > Environment Variables añade SNAPTRADE_CLIENT_ID y SNAPTRADE_CONSUMER_KEY y haz Redeploy.",
  "Cada cliente pulsa Conectar, enlaza su propio DEGIRO en el portal y luego Sincronizar: cada uno ve solo su cartera.",
]

export function BrokerConnectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useLanguage()
  const [degiroState, setDegiroState] = useState<DegiroState>("idle")
  const [accounts, setAccounts] = useState<BrokerAccount[]>([])
  const [syncError, setSyncError] = useState<string | null>(null)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState<number | null>(null)

  const goToImport = () => {
    onOpenChange(false)
    window.setTimeout(() => {
      document.getElementById("mis-posiciones")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 150)
  }

  const syncDegiro = async () => {
    setSyncError(null)
    setImportedCount(null)
    setDegiroState("checking")
    try {
      const statusRes = await fetch("/api/snaptrade/status")
      const status = await statusRes.json()
      if (!status?.configured) {
        setDegiroState("setup")
        return
      }
      const accRes = await fetch("/api/snaptrade/accounts")
      const accJson = await accRes.json()
      if (!accRes.ok) throw new Error(accJson?.error || "Error al listar cuentas")
      setAccounts(Array.isArray(accJson?.accounts) ? accJson.accounts : [])
      setDegiroState("accounts")
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : "Error de conexión")
      setDegiroState("error")
    }
  }

  const openPortal = async () => {
    setSyncError(null)
    try {
      const res = await fetch("/api/snaptrade/portal", { method: "POST" })
      const json = await res.json()
      if (!res.ok || !json?.redirectURI) throw new Error(json?.error || "No se pudo abrir el portal")
      window.open(json.redirectURI, "_blank", "noopener,noreferrer")
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : "Error al abrir el portal")
    }
  }

  const importAccount = async (accountId: string) => {
    setSyncError(null)
    setImportedCount(null)
    setImportingId(accountId)
    setDegiroState("importing")
    try {
      const res = await fetch(`/api/snaptrade/positions?accountId=${encodeURIComponent(accountId)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Error al leer posiciones")
      const items = (Array.isArray(json?.positions) ? json.positions : []) as SnapTradeImportItem[]
      window.dispatchEvent(new CustomEvent("snaptrade:import", { detail: items }))
      setImportedCount(items.length)
      setDegiroState("accounts")
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : "Error al importar")
      setDegiroState("accounts")
    } finally {
      setImportingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Conectar bróker")}</DialogTitle>
          <DialogDescription>
            {t("Sincroniza tu cartera directamente o impórtala por CSV. Tus claves del bróker nunca se escriben aquí.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="rounded-xl border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Landmark className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">DEGIRO</p>
                    <Badge variant="secondary">{t("Sincronización")}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("Conecta tu cuenta y trae tus posiciones con un clic.")}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={openPortal}>
                  <Link2 className="mr-2 h-4 w-4" />
                  {t("Conectar")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={degiroState === "checking" || degiroState === "importing"}
                  onClick={syncDegiro}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${degiroState === "checking" || degiroState === "importing" ? "animate-spin" : ""}`}
                  />
                  {t("Sincronizar")}
                </Button>
              </div>
            </div>

            {syncError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{syncError}</p>
            )}
            {importedCount !== null && (
              <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                {t("Posiciones importadas")}: {importedCount}
              </p>
            )}

            {degiroState === "setup" && (
              <div className="mt-3 rounded-lg bg-secondary/40 p-3">
                <p className="text-xs font-semibold">{t("Activa la sincronización una sola vez")}:</p>
                <ol className="mt-1 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
                  {SETUP_STEPS.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </div>
            )}

            {(degiroState === "accounts" || degiroState === "importing") && (
              <div className="mt-3 space-y-2">
                {accounts.length === 0 ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/40 p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("No hay cuentas conectadas todavía.")}
                    </p>
                    <Button size="sm" variant="outline" onClick={openPortal}>
                      {t("Abrir portal")}
                    </Button>
                  </div>
                ) : (
                  accounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg bg-secondary/40 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.name}</p>
                        {a.institution ? (
                          <p className="truncate text-xs text-muted-foreground">{a.institution}</p>
                        ) : null}
                      </div>
                      <Button
                        size="sm"
                        disabled={importingId !== null}
                        onClick={() => void importAccount(a.id)}
                      >
                        {importingId === a.id ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {t("Importar")}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Landmark className="h-4 w-4 text-primary" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">MyInvestor</p>
                  <Badge variant="secondary">{t("Importación CSV")}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("Descarga tus órdenes de fondos e impórtalas aquí.")}
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={goToImport}>
              <Upload className="mr-2 h-4 w-4" />
              {t("Importar CSV")}
            </Button>
          </div>

          {[
            { id: "ibkr", name: "Interactive Brokers" },
            { id: "trade-republic", name: "Trade Republic" },
            { id: "etoro", name: "eToro" },
            { id: "xtb", name: "XTB" },
          ].map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Landmark className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{b.name}</p>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {t("Próximamente")}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("De momento, añade tus posiciones manualmente desde «Añadir acción».")}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0" disabled>
                {t("Próximamente")}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

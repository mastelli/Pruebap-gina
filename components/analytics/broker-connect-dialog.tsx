"use client"

import { Clock, Landmark, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n"

interface Broker {
  id: string
  name: string
  method: "csv" | "soon"
  hint: string
}

const BROKERS: Broker[] = [
  {
    id: "degiro",
    name: "DEGIRO",
    method: "csv",
    hint: "Exporta tus transacciones (Actividad > Transacciones > Exportar) y súbelas aquí.",
  },
  {
    id: "myinvestor",
    name: "MyInvestor",
    method: "csv",
    hint: "Descarga tus órdenes de fondos e impórtalas aquí.",
  },
  {
    id: "ibkr",
    name: "Interactive Brokers",
    method: "soon",
    hint: "De momento, añade tus posiciones manualmente desde «Añadir acción».",
  },
  {
    id: "trade-republic",
    name: "Trade Republic",
    method: "soon",
    hint: "De momento, añade tus posiciones manualmente desde «Añadir acción».",
  },
  {
    id: "etoro",
    name: "eToro",
    method: "soon",
    hint: "De momento, añade tus posiciones manualmente desde «Añadir acción».",
  },
  {
    id: "xtb",
    name: "XTB",
    method: "soon",
    hint: "De momento, añade tus posiciones manualmente desde «Añadir acción».",
  },
]

export function BrokerConnectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useLanguage()

  const goToImport = () => {
    onOpenChange(false)
    window.setTimeout(() => {
      document.getElementById("mis-posiciones")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 150)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Conectar bróker")}</DialogTitle>
          <DialogDescription>
            {t("Elige tu bróker para traer tu cartera aquí. La conexión automática no existe: ningún bróker ofrece API pública para particulares, así que la importación CSV mantiene tus datos en tu cuenta.")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {BROKERS.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Landmark className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{b.name}</p>
                    {b.method === "csv" ? (
                      <Badge variant="secondary">{t("Importación CSV")}</Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {t("Próximamente")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.hint}</p>
                </div>
              </div>
              {b.method === "csv" ? (
                <Button size="sm" variant="outline" className="shrink-0" onClick={goToImport}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("Importar CSV")}
                </Button>
              ) : (
                <Button size="sm" variant="ghost" className="shrink-0" disabled>
                  {t("Próximamente")}
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

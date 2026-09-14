"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Trash2, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { storageGetItem, storageSetItem } from "@/lib/auth"

const STORAGE_KEY = "appManualStocks"

interface ManualStock {
  id: string
  name: string
  exchange: string
  price: number
  quantity: number
}

const EXCHANGES = [
  "NASDAQ",
  "NYSE",
  "LSE",
  "BME",
  "Euronext",
  "XETRA",
  "Other",
]

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function ManualStocks() {
  const { t } = useLanguage()
  const [stocks, setStocks] = useState<ManualStock[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState("")
  const [exchange, setExchange] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")

  useEffect(() => {
    try {
      const raw = storageGetItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setStocks(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      storageSetItem(STORAGE_KEY, JSON.stringify(stocks))
    } catch {
      // ignore
    }
  }, [stocks])

  const addStock = () => {
    if (!name || !exchange || !price || !quantity) return
    const newStock: ManualStock = {
      id: `stock-${Date.now()}`,
      name: name.toUpperCase(),
      exchange,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    }
    setStocks([...stocks, newStock])
    setName("")
    setExchange("")
    setPrice("")
    setQuantity("")
    setShowAdd(false)
  }

  const removeStock = (id: string) => {
    setStocks(stocks.filter((s) => s.id !== id))
  }

  const totalValue = stocks.reduce((sum, s) => sum + s.price * s.quantity, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("Manual Stocks")}
          </CardTitle>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t("Add Stock")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Add Stock")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("Stock Name")}</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: AAPL"
                  />
                </div>
                <div>
                  <Label>{t("Exchange")}</Label>
                  <Select value={exchange} onValueChange={setExchange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXCHANGES.map((ex) => (
                        <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("Price")} (€)</Label>
                  <Input
                    type="number"
                    step={0.01}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>{t("Quantity")}</Label>
                  <Input
                    type="number"
                    step={0.01}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <Button onClick={addStock} className="w-full">{t("Add Stock")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {stocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No stocks added")}</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 text-xs font-medium text-muted-foreground px-2">
              <span>{t("Stock Name")}</span>
              <span>{t("Exchange")}</span>
              <span className="text-right">{t("Price")}</span>
              <span className="text-right">{t("Quantity")}</span>
              <span className="text-right">{t("Total Value")}</span>
            </div>
            {stocks.map((stock) => (
              <div
                key={stock.id}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center p-2 rounded-lg bg-secondary/50"
              >
                <span className="font-medium">{stock.name}</span>
                <span className="text-sm text-muted-foreground">{stock.exchange}</span>
                <span className="text-sm font-mono text-right">{formatEuros(stock.price)}</span>
                <span className="text-sm font-mono text-right">{stock.quantity}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold">{formatEuros(stock.price * stock.quantity)}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeStock(stock.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold text-sm">
              <span>{t("Total Value")}</span>
              <span className="font-mono">{formatEuros(totalValue)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
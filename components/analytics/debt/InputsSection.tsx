"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS, type Category, type Item } from "./debt-engine"

let idCounter = 0
function newId() {
  idCounter += 1
  return `item-${Date.now()}-${idCounter}`
}

function emptyItem(category: Category): Item {
  return { id: newId(), name: "", value: 0, interest: 0, category }
}

const CATEGORIES: Category[] = ["AC", "ANC", "PC", "PNC"]

export function InputsSection({ items, onChange }: { items: Item[]; onChange: (items: Item[]) => void }) {
  const update = (id: string, patch: Partial<Item>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id))
  const add = (category: Category) => onChange([...items, emptyItem(category)])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de entrada</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {CATEGORIES.map((cat) => {
          const catItems = items.filter((i) => i.category === cat)
          return (
            <div key={cat} className="rounded-lg border p-3">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <h4 className="font-semibold">
                  {CATEGORY_LABELS[cat]} <span className="text-muted-foreground">({cat})</span>
                </h4>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{CATEGORY_DESCRIPTIONS[cat]}</p>
              <div className="space-y-2">
                {catItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sin elementos. Añade uno para empezar.</p>
                )}
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_110px_90px_150px_auto] sm:items-end"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        placeholder="Ej. Hipoteca"
                        value={item.name}
                        onChange={(e) => update(item.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor (€)</Label>
                      <Input
                        type="number"
                        value={item.value || ""}
                        onChange={(e) => update(item.id, { value: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Interés %</Label>
                      <Input
                        type="number"
                        step={0.1}
                        value={item.interest || ""}
                        onChange={(e) => update(item.id, { interest: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Vencimiento</Label>
                      <Input
                        type="date"
                        value={item.dueDate ?? ""}
                        onChange={(e) => update(item.id, { dueDate: e.target.value || undefined })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => remove(item.id)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="mt-1" onClick={() => add(cat)}>
                  <Plus className="mr-1 h-4 w-4" /> Añadir {CATEGORY_LABELS[cat]}
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

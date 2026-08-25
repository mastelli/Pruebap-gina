"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Settings, Plus, Trash2, Palette } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import {
  getAllExpenseCategoriesIncludingHidden,
  addCustomCategory,
  removeCustomCategory,
  toggleCategoryHidden,
  isCategoryHidden,
  EXPENSE_CATEGORY_DEFS,
} from "@/lib/categories"

const PRESET_COLORS = [
  "#ef5350", "#e53935", "#29b6f6", "#ba68c8", "#7e57c2",
  "#b58900", "#5c6bc0", "#ff7043", "#26c6da", "#42a5f5",
  "#9ccc65", "#c0ca33", "#8d6e63", "#26a69a", "#ffa726",
  "#66bb6a", "#ffb300", "#ab47bc", "#78909c", "#00897b",
  "#d81b60", "#ec407a", "#90a4ae",
]

export function CategoryManager({ trigger, onChange }: { trigger?: React.ReactNode; onChange?: () => void }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [showAdd, setShowAdd] = useState(false)

  // Staged hidden state — toggles update this, not localStorage directly
  const [hiddenState, setHiddenState] = useState<Record<string, boolean>>({})
  const [initialized, setInitialized] = useState(false)

  const categories = getAllExpenseCategoriesIncludingHidden()
  const isBuiltin = (key: string) => EXPENSE_CATEGORY_DEFS.some((d) => d.key === key)

  // Initialize staged state when dialog opens
  useEffect(() => {
    if (open && !initialized) {
      const state: Record<string, boolean> = {}
      for (const cat of categories) {
        state[cat.key] = isCategoryHidden(cat.key)
      }
      setHiddenState(state)
      setInitialized(true)
    }
    if (!open) {
      setInitialized(false)
    }
  }, [open, initialized, categories])

  const handleAdd = () => {
    if (!newName.trim()) return
    addCustomCategory({ key: newName.trim(), color: newColor, keywords: [] })
    setNewName("")
    setNewColor(PRESET_COLORS[0])
    setShowAdd(false)
    onChange?.()
  }

  const handleRemove = (key: string) => {
    removeCustomCategory(key)
    onChange?.()
  }

  const handleToggleStaged = (key: string) => {
    setHiddenState((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    for (const cat of categories) {
      const wasHidden = isCategoryHidden(cat.key)
      const wantHidden = hiddenState[cat.key] ?? false
      if (wasHidden !== wantHidden) {
        toggleCategoryHidden(cat.key)
      }
    }
    onChange?.()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-9 w-9" title={t("Categories")}>
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Categories")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const hidden = hiddenState[cat.key] ?? false
            return (
              <div key={cat.key} className="flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center">
                <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className={`text-xs font-medium leading-tight ${hidden ? "text-foreground/40" : ""}`}>
                  {t(cat.key)}
                </span>
                <Switch
                  checked={!hidden}
                  onCheckedChange={() => handleToggleStaged(cat.key)}
                  className={hidden ? "data-[state=unchecked]:bg-red-500" : "data-[state=checked]:bg-green-500"}
                />
                {!isBuiltin(cat.key) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(cat.key)}
                    title={t("Delete")}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {showAdd ? (
          <div className="mt-4 space-y-3 p-3 border rounded-lg">
            <Input
              placeholder={t("Category name")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <Palette className="h-4 w-4 text-muted-foreground" />
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`h-6 w-6 rounded-full border-2 shrink-0 ${newColor === color ? "border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewColor(color)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
                {t("Add")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => setShowAdd(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("Add category")}
          </Button>
        )}

        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={handleSave}>
            {t("Save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Plus, Trash2, EyeOff, Eye, Palette } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import {
  getAllExpenseCategories,
  addCustomCategory,
  removeCustomCategory,
  toggleCategoryHidden,
  isCategoryHidden,
  EXPENSE_CATEGORY_DEFS,
  type ExpenseCategoryDef,
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

  const categories = getAllExpenseCategories()
  const isBuiltin = (key: string) => EXPENSE_CATEGORY_DEFS.some((d) => d.key === key)

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

  const handleToggleHidden = (key: string) => {
    toggleCategoryHidden(key)
    onChange?.()
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
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("Categories")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.key} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm font-medium">{t(cat.key)}</span>
                {isBuiltin(cat.key) && (
                  <span className="text-xs text-muted-foreground">({t("Default")})</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleToggleHidden(cat.key)}
                  title={isCategoryHidden(cat.key) ? t("Show") : t("Hide")}
                >
                  {isCategoryHidden(cat.key)
                    ? <EyeOff className="h-3.5 w-3.5" />
                    : <Eye className="h-3.5 w-3.5" />
                  }
                </Button>
                {!isBuiltin(cat.key) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(cat.key)}
                    title={t("Delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
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
      </DialogContent>
    </Dialog>
  )
}

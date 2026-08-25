import { isElectricityBill, isInternetBill, isWaterBill, isSubscription } from "./bill-companies"
import { normalize } from "./bill-companies"
import { accountStorageKey, readStorage, writeStorage } from "./auth"

// Palabras clave de nomina y transferencia (sin acentos; el nombre se
// normaliza antes de comparar)
export const SALARY_KEYWORDS = [
  "nomina",
  "salario",
  "sueldo",
  "retribucion",
  "remuneracion",
]

export const TRANSFER_KEYWORDS = ["transferencia", "traf"]

export type TransactionCategory = string

export interface ExpenseCategoryDef {
  key: string
  color: string
  keywords: string[]
}

// Orden de clasificacion: cuanto mas especifico, antes
const BUILTIN_EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  { key: "Electricity", color: "#ef5350", keywords: [] },
  { key: "Internet", color: "#e53935", keywords: [] },
  { key: "Water", color: "#29b6f6", keywords: [] },
  { key: "Subscriptions", color: "#ba68c8", keywords: [] },
  { key: "Rent/Mortgage", color: "#7e57c2", keywords: ["alquiler", "hipoteca", "inmueble", "inmobiliaria"] },
  { key: "ATM", color: "#b58900", keywords: ["cajero", "retirada", "extraccion", "atm"] },
  { key: "Insurance", color: "#5c6bc0", keywords: ["seguro", "mapfre", "allianz", "axa", "mutua", "zurich", "generali", "linea directa"] },
  { key: "Fuel", color: "#ff7043", keywords: ["gasolinera", "gasolina", "combustible", "repsol", "cepsa", "shell", "galp", "disa"] },
  { key: "Health", color: "#26c6da", keywords: ["farmacia", "clinica", "dentista", "medico", "hospital", "fisio", "optica", "salud", "sanitas", "adeslas"] },
  { key: "Education", color: "#42a5f5", keywords: ["colegio", "universidad", "escuela", "academia", "matricula", "curso", "formacion", "guarderia"] },
  { key: "Pets", color: "#9ccc65", keywords: ["veterinario", "mascota", "pienso", "petshop", "animal"] },
  { key: "Sport", color: "#c0ca33", keywords: ["gimnasio", "deporte", "padel", "fitness", "decathlon", "polideportivo", "futbol"] },
  { key: "Car", color: "#8d6e63", keywords: ["taller", "neumaticos", "itv", "vehiculo", "coche", "garaje", "garage", "norauto", "midas", "aparcamiento", "parking"] },
  { key: "Transport", color: "#26a69a", keywords: ["metro", "autobus", "bus ", "taxi", "uber", "cabify", "renfe", "cercanias", "tren", "billete", "transporte"] },
  { key: "Dining Out", color: "#ffa726", keywords: ["restaurante", "bar ", "cafeteria", "mcdonalds", "burger", "pizza", "dominos", "telepizza", "kfc", "starbucks", "glovo", "justeat", "just eat", "deliveroo", "ubereats", "tapas", "menu del dia"] },
  { key: "Groceries", color: "#66bb6a", keywords: ["supermercado", "mercadona", "carrefour", "lidl", "aldi", "eroski", "alcampo", "consum", "bonarea", "hipercor", "ahorramas", "alimentacion", "fruteria", "carniceria", "pescaderia", "condis"] },
  { key: "Shopping", color: "#ffb300", keywords: ["amazon", "aliexpress", "corte ingles", "corteingles", "fnac", "zara", "shein", "temu", "ebay", "wallapop", "tienda", "compra"] },
  { key: "Clothing", color: "#ab47bc", keywords: ["ropa", "moda", "primark", "mango", "zapatilla", "zapateria", "calzado"] },
  { key: "Home", color: "#78909c", keywords: ["muebles", "ikea", "leroy merlin", "bricomart", "ferreteria", "electrodomestico", "hogar", "fontanero", "electricista", "limpieza", "jardin", "comunidad"] },
  { key: "Travel", color: "#00897b", keywords: ["hotel", "viaje", "avion", "vuelo", "ryanair", "vueling", "iberia", "airbnb", "booking", "expedia", "crucero"] },
  { key: "Gifts", color: "#d81b60", keywords: ["regalo", "floristeria", "joyeria"] },
  { key: "Leisure", color: "#ec407a", keywords: ["cine", "teatro", "concierto", "museo", "ocio", "steam", "playstation", "xbox", "nintendo", "entradas", "bolera"] },
  { key: "Other", color: "#90a4ae", keywords: [] },
]

const BIZUM_RE = /bizum/i

export const INCOME_CATEGORIES: TransactionCategory[] = ["Salary", "Transfers", "Bizum"]

// Modificaciones manuales del tipo por movimiento (persistidas y
// aisladas por cuenta de usuario)
const OVERRIDES_STORAGE_KEY = "appCategoryOverrides"
type CategoryOverrides = Record<string, TransactionCategory>

let cachedOverrides: CategoryOverrides | null = null
let cachedStorageKey: string | null = null

function loadOverrides(): CategoryOverrides {
  const storageKey = accountStorageKey(OVERRIDES_STORAGE_KEY)
  if (cachedOverrides && cachedStorageKey === storageKey) return cachedOverrides
  try {
    const raw = readStorage(OVERRIDES_STORAGE_KEY)
    cachedOverrides = raw ? (JSON.parse(raw) as CategoryOverrides) : {}
    cachedStorageKey = storageKey
  } catch {
    cachedOverrides = {}
    cachedStorageKey = storageKey
  }
  return cachedOverrides
}

export function getStoredCategory(id: string): TransactionCategory | undefined {
  return loadOverrides()[id]
}

export function storeCategory(id: string, category: TransactionCategory) {
  cachedOverrides = { ...loadOverrides(), [id]: category }
  try {
    writeStorage(OVERRIDES_STORAGE_KEY, JSON.stringify(cachedOverrides))
  } catch {}
}

// Tipo efectivo de un movimiento: manual si existe, automatico si no
export function getCategoryFor(transaction: { id: string; name: string; amount: number }): TransactionCategory {
  const manual = getStoredCategory(transaction.id)
  if (manual && !isCategoryHidden(manual)) return manual
  const auto = classifyTransaction(transaction)
  return isCategoryHidden(auto) ? "Other" : auto
}

// Clasifica cualquier movimiento en una de las categorias del dashboard
export function classifyTransaction(transaction: { name: string; amount: number }): TransactionCategory {
  const name = transaction.name.toLowerCase()

  if (transaction.amount > 0) {
    if (BIZUM_RE.test(name)) return "Bizum"
    if (SALARY_KEYWORDS.some((keyword) => name.includes(keyword))) return "Salary"
    if (TRANSFER_KEYWORDS.some((keyword) => name.includes(keyword))) return "Transfers"
    return "Transfers"
  }

  if (isElectricityBill(transaction.name)) return "Electricity"
  if (isInternetBill(transaction.name)) return "Internet"
  if (isWaterBill(transaction.name)) return "Water"
  if (isSubscription(transaction.name)) return "Subscriptions"

  const normalizedName = normalize(transaction.name)
  for (const def of EXPENSE_CATEGORY_DEFS) {
    if (def.keywords.some((keyword) => normalizedName.includes(keyword))) return def.key
  }

  return "Other"
}

// --- Custom category management (per-user) ---

const CUSTOM_CATEGORIES_KEY = "appCustomCategories"
const HIDDEN_CATEGORIES_KEY = "appHiddenCategories"

export interface CustomCategoryDef {
  key: string
  color: string
  keywords: string[]
}

function loadCustomCategories(): CustomCategoryDef[] {
  try {
    const raw = readStorage(CUSTOM_CATEGORIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCustomCategories(categories: CustomCategoryDef[]) {
  try {
    writeStorage(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories))
  } catch {}
}

function loadHiddenCategories(): string[] {
  try {
    const raw = readStorage(HIDDEN_CATEGORIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHiddenCategories(hidden: string[]) {
  try {
    writeStorage(HIDDEN_CATEGORIES_KEY, JSON.stringify(hidden))
  } catch {}
}

export function getHiddenCategories(): string[] {
  return loadHiddenCategories()
}

export function isCategoryHidden(key: string): boolean {
  return loadHiddenCategories().includes(key)
}

export function toggleCategoryHidden(key: string) {
  const hidden = loadHiddenCategories()
  const next = hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key]
  saveHiddenCategories(next)
  // When hiding a category, clear manual overrides for that category
  // so those transactions fall back to auto-classification → "Other"
  if (!hidden.includes(key)) {
    const overrides = loadOverrides()
    let changed = false
    for (const [txId, cat] of Object.entries(overrides)) {
      if (cat === key) {
        delete overrides[txId]
        changed = true
      }
    }
    if (changed) {
      cachedOverrides = overrides
      try {
        writeStorage(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides))
      } catch {}
    }
  }
}

export function addCustomCategory(cat: CustomCategoryDef) {
  const existing = loadCustomCategories()
  saveCustomCategories([...existing, cat])
}

export function updateCustomCategory(key: string, updates: Partial<CustomCategoryDef>) {
  const existing = loadCustomCategories()
  saveCustomCategories(existing.map((c) => (c.key === key ? { ...c, ...updates } : c)))
}

export function removeCustomCategory(key: string) {
  const existing = loadCustomCategories()
  saveCustomCategories(existing.filter((c) => c.key !== key))
}

// Returns all expense categories (builtin + custom), excluding hidden ones
// Used by transactions page filter and analytics charts
export function getAllExpenseCategories(): ExpenseCategoryDef[] {
  const hidden = loadHiddenCategories()
  const custom = loadCustomCategories()
  return [...BUILTIN_EXPENSE_CATEGORIES, ...custom].filter((c) => !hidden.includes(c.key))
}

// Returns all expense categories including hidden ones
// Used by the category manager dialog so hidden ones still appear (with toggle)
export function getAllExpenseCategoriesIncludingHidden(): ExpenseCategoryDef[] {
  const custom = loadCustomCategories()
  return [...BUILTIN_EXPENSE_CATEGORIES, ...custom]
}

// For backwards compat: export as EXPENSE_CATEGORY_DEFS (always returns all including hidden, for classification)
export const EXPENSE_CATEGORY_DEFS: ExpenseCategoryDef[] = [...BUILTIN_EXPENSE_CATEGORIES]

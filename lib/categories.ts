import { isElectricityBill, isInternetBill, isWaterBill, isSubscription } from "./bill-companies"
import { normalize } from "./bill-companies"
import { SALARY_KEYWORDS, TRANSFER_KEYWORDS } from "./income"

export type TransactionCategory =
  | "Salary"
  | "Transfers"
  | "Bizum"
  | "Electricity"
  | "Internet"
  | "Water"
  | "Subscriptions"
  | "Rent/Mortgage"
  | "Groceries"
  | "Car"
  | "Transport"
  | "Shopping"
  | "Dining Out"
  | "Leisure"
  | "Fuel"
  | "Insurance"
  | "Health"
  | "Education"
  | "Clothing"
  | "Home"
  | "Travel"
  | "Gifts"
  | "Pets"
  | "Sport"
  | "ATM"
  | "Other"

export interface ExpenseCategoryDef {
  key: TransactionCategory
  color: string
  keywords: string[]
}

// Orden de clasificacion: cuanto mas especifico, antes
export const EXPENSE_CATEGORY_DEFS: ExpenseCategoryDef[] = [
  {
    key: "Electricity",
    color: "#ef5350",
    keywords: [],
  },
  {
    key: "Internet",
    color: "#e53935",
    keywords: [],
  },
  {
    key: "Water",
    color: "#29b6f6",
    keywords: [],
  },
  {
    key: "Subscriptions",
    color: "#ba68c8",
    keywords: [],
  },
  {
    key: "Rent/Mortgage",
    color: "#7e57c2",
    keywords: ["alquiler", "hipoteca", "inmueble", "inmobiliaria"],
  },
  {
    key: "ATM",
    color: "#b58900",
    keywords: ["cajero", "retirada", "extraccion", "atm"],
  },
  {
    key: "Insurance",
    color: "#5c6bc0",
    keywords: ["seguro", "mapfre", "allianz", "axa", "mutua", "zurich", "generali", "linea directa"],
  },
  {
    key: "Fuel",
    color: "#ff7043",
    keywords: ["gasolinera", "gasolina", "combustible", "repsol", "cepsa", "shell", "galp", "disa"],
  },
  {
    key: "Health",
    color: "#26c6da",
    keywords: [
      "farmacia",
      "clinica",
      "dentista",
      "medico",
      "hospital",
      "fisio",
      "optica",
      "salud",
      "sanitas",
      "adeslas",
    ],
  },
  {
    key: "Education",
    color: "#42a5f5",
    keywords: [
      "colegio",
      "universidad",
      "escuela",
      "academia",
      "matricula",
      "curso",
      "formacion",
      "guarderia",
    ],
  },
  {
    key: "Pets",
    color: "#9ccc65",
    keywords: ["veterinario", "mascota", "pienso", "petshop", "animal"],
  },
  {
    key: "Sport",
    color: "#c0ca33",
    keywords: ["gimnasio", "deporte", "padel", "fitness", "decathlon", "polideportivo", "futbol"],
  },
  {
    key: "Car",
    color: "#8d6e63",
    keywords: [
      "taller",
      "neumaticos",
      "itv",
      "vehiculo",
      "coche",
      "garaje",
      "garage",
      "norauto",
      "midas",
      "aparcamiento",
      "parking",
    ],
  },
  {
    key: "Transport",
    color: "#26a69a",
    keywords: [
      "metro",
      "autobus",
      "bus ",
      "taxi",
      "uber",
      "cabify",
      "renfe",
      "cercanias",
      "tren",
      "billete",
      "transporte",
    ],
  },
  {
    key: "Dining Out",
    color: "#ffa726",
    keywords: [
      "restaurante",
      "bar ",
      "cafeteria",
      "mcdonalds",
      "burger",
      "pizza",
      "dominos",
      "telepizza",
      "kfc",
      "starbucks",
      "glovo",
      "justeat",
      "just eat",
      "deliveroo",
      "ubereats",
      "tapas",
      "menu del dia",
    ],
  },
  {
    key: "Groceries",
    color: "#66bb6a",
    keywords: [
      "supermercado",
      "mercadona",
      "carrefour",
      "lidl",
      "aldi",
      "eroski",
      "alcampo",
      "consum",
      "bonarea",
      "hipercor",
      "ahorramas",
      "alimentacion",
      "fruteria",
      "carniceria",
      "pescaderia",
      "condis",
    ],
  },
  {
    key: "Shopping",
    color: "#ffb300",
    keywords: [
      "amazon",
      "aliexpress",
      "corte ingles",
      "corteingles",
      "fnac",
      "zara",
      "shein",
      "temu",
      "ebay",
      "wallapop",
      "tienda",
      "compra",
    ],
  },
  {
    key: "Clothing",
    color: "#ab47bc",
    keywords: ["ropa", "moda", "primark", "mango", "zapatilla", "zapateria", "calzado"],
  },
  {
    key: "Home",
    color: "#78909c",
    keywords: [
      "muebles",
      "ikea",
      "leroy merlin",
      "bricomart",
      "ferreteria",
      "electrodomestico",
      "hogar",
      "fontanero",
      "electricista",
      "limpieza",
      "jardin",
      "comunidad",
    ],
  },
  {
    key: "Travel",
    color: "#00897b",
    keywords: [
      "hotel",
      "viaje",
      "avion",
      "vuelo",
      "ryanair",
      "vueling",
      "iberia",
      "airbnb",
      "booking",
      "expedia",
      "crucero",
    ],
  },
  {
    key: "Gifts",
    color: "#d81b60",
    keywords: ["regalo", "floristeria", "joyeria"],
  },
  {
    key: "Leisure",
    color: "#ec407a",
    keywords: [
      "cine",
      "teatro",
      "concierto",
      "museo",
      "ocio",
      "steam",
      "playstation",
      "xbox",
      "nintendo",
      "entradas",
      "bolera",
    ],
  },
  {
    key: "Other",
    color: "#90a4ae",
    keywords: [],
  },
]

const BIZUM_RE = /bizum/i

export const INCOME_CATEGORIES: TransactionCategory[] = ["Salary", "Transfers", "Bizum"]

// Modificaciones manuales del tipo por movimiento (persistidas)
const OVERRIDES_STORAGE_KEY = "appCategoryOverrides"
type CategoryOverrides = Record<string, TransactionCategory>

let cachedOverrides: CategoryOverrides | null = null

function loadOverrides(): CategoryOverrides {
  if (cachedOverrides) return cachedOverrides
  try {
    const raw = window.localStorage.getItem(OVERRIDES_STORAGE_KEY)
    cachedOverrides = raw ? (JSON.parse(raw) as CategoryOverrides) : {}
  } catch {
    cachedOverrides = {}
  }
  return cachedOverrides
}

export function getStoredCategory(id: string): TransactionCategory | undefined {
  return loadOverrides()[id]
}

export function storeCategory(id: string, category: TransactionCategory) {
  cachedOverrides = { ...loadOverrides(), [id]: category }
  try {
    window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(cachedOverrides))
  } catch {
    // almacenamiento no disponible
  }
}

// Tipo efectivo de un movimiento: manual si existe, automatico si no
export function getCategoryFor(transaction: { id: string; name: string; amount: number }): TransactionCategory {
  return getStoredCategory(transaction.id) ?? classifyTransaction(transaction)
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

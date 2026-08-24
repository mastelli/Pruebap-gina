import { isElectricityBill, isInternetBill, isWaterBill, isSubscription } from "./bill-companies"
import { SALARY_KEYWORDS, TRANSFER_KEYWORDS } from "./income"

export type TransactionCategory =
  | "Salary"
  | "Transfers"
  | "Bizum"
  | "Electricity"
  | "Internet"
  | "Water"
  | "Subscriptions"
  | "Other"

const BIZUM_RE = /bizum/i

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
  return "Other"
}

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "Electricity",
  "Internet",
  "Water",
  "Subscriptions",
  "Other",
]

// Verdes para ingresos; rojos/morado/gris para tipos de gasto
export const CATEGORY_COLORS = {
  Salary: "#66bb6a",
  Transfers: "#43a047",
  Bizum: "#2e7d32",
  Electricity: "#ef5350",
  Internet: "#e53935",
  Water: "#ff8a65",
  Subscriptions: "#ba68c8",
  Other: "#90a4ae",
}

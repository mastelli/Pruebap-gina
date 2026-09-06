import type { DetectableMovement } from "./bill-companies"
import { getCategoryFor, INTERNAL_TRANSFER_CATEGORY } from "./categories"

// Movimiento con identificador, necesario para consultar su tipo manual
export interface IdentifiableMovement extends DetectableMovement {
  id: string
}

export interface IncomeBreakdownTotals {
  salary: number
  transfers: number
  bizum: number
}

// Reparte los ingresos del periodo en nomina, transferencia o bizum
// usando el tipo efectivo de cada movimiento (manual si el usuario lo
// cambio en Transacciones, automatico si no), de forma que las
// analiticas reflejan siempre las ediciones del usuario
export function getIncomeBreakdown(
  movements: IdentifiableMovement[],
  yearPrefix: string,
): IncomeBreakdownTotals {
  const totals: IncomeBreakdownTotals = {
    salary: 0,
    transfers: 0,
    bizum: 0,
  }

  for (const movement of movements) {
    if (movement.amount <= 0 || !movement.date.startsWith(yearPrefix)) continue

    const category = getCategoryFor(movement)
    if (category === INTERNAL_TRANSFER_CATEGORY) continue
    if (category === "Salary") {
      totals.salary += movement.amount
    } else if (category === "Transfers") {
      totals.transfers += movement.amount
    } else {
      totals.bizum += movement.amount
    }
  }

  return totals
}

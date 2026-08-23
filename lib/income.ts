import { normalize, type DetectableMovement } from "./bill-companies"

// Palabras clave de nomina (sin acentos; el concepto se normaliza antes)
const SALARY_KEYWORDS = [
  "nomina",
  "salario",
  "sueldo",
  "retribucion",
  "remuneracion",
]

// Transferencias: "Transferencia", "TRAF. DE:", etc.
const TRANSFER_KEYWORDS = ["transferencia", "traf"]

export interface IncomeBreakdownTotals {
  salary: number
  transfers: number
  bizum: number
}

// Clasifica los ingresos del ano en nomina, transferencia o bizum;
// un ingreso que no sea nomina ni transferencia se considera bizum
export function getIncomeBreakdown(
  movements: DetectableMovement[],
  yearPrefix: string,
): IncomeBreakdownTotals {
  const totals: IncomeBreakdownTotals = {
    salary: 0,
    transfers: 0,
    bizum: 0,
  }

  for (const movement of movements) {
    if (movement.amount <= 0 || !movement.date.startsWith(yearPrefix)) continue

    const concept = normalize(movement.name)
    if (SALARY_KEYWORDS.some((keyword) => concept.includes(keyword))) {
      totals.salary += movement.amount
    } else if (TRANSFER_KEYWORDS.some((keyword) => concept.includes(keyword))) {
      totals.transfers += movement.amount
    } else {
      totals.bizum += movement.amount
    }
  }

  return totals
}

import { describe, expect, it } from "vitest"
import { parseBankMovements, type BankMovement } from "@/lib/bank-import"

function incomeBreakdown(transactions: BankMovement[], prefix: string) {
  const totals = { salary: 0, transfers: 0, bizum: 0 }
  for (const movement of transactions) {
    if (movement.amount <= 0 || !movement.date.startsWith(prefix)) continue
    const name = movement.concept.toLowerCase()
    if (/bizum/i.test(name)) totals.bizum += movement.amount
    else if (["nomina", "salario", "sueldo", "retribucion", "remuneracion"].some((k) => name.includes(k)))
      totals.salary += movement.amount
    else totals.transfers += movement.amount
  }
  return totals
}

// Misma logica que lib/transactions getPeriodPrefix
function getPeriodPrefix(transactions: BankMovement[], month: string): string {
  let latestYear = -Infinity
  for (const movement of transactions) {
    if (movement.date.length < 7 || movement.date.slice(5, 7) !== month) continue
    const year = Number.parseInt(movement.date.slice(0, 4), 10)
    if (Number.isFinite(year) && year > latestYear) latestYear = year
  }
  if (!Number.isFinite(latestYear)) return `${new Date().getFullYear()}-${month}`
  return `${latestYear}-${month}`
}

describe("bank import -> dashboard filters", () => {
  it("parses a Spanish bank semicolon CSV with signed amounts and ISO dates", () => {
    const csv = [
      "05/09/2026;Mercadona;;-45,67;1520,90",
      "02/09/2026;Nomina;;2000,00;1566,57",
      "04/09/2026;Iberdrola;;-80,00;1520,90",
    ].join("\n")

    const movements = parseBankMovements(csv)
    expect(movements.length).toBe(3)
    expect(movements[0].date).toBe("2026-09-05")
    expect(movements[0].amount).toBe(-45.67)
    expect(movements[1].date).toBe("2026-09-02")
    expect(movements[1].amount).toBe(2000)
    expect(movements[2].amount).toBe(-80)
  })

  it("parses a Revolut-style CSV keeping expense sign and ISO dates (dot decimals)", () => {
    const csv = [
      "Type;Product;Started Date;Completed Date;Description;Amount;Fee;Currency;State;Balance",
      "CARD_PAYMENT;Revolut;;2026-09-01 10:00:00;2026-09-01 10:00:00;Mercadona-Madrid;;-23.45;0;EUR;COMPLETED;1234.56",
      "TRANSFER;Revolut;;2026-09-02 09:00:00;2026-09-02 09:00:00;Libre;0;0;EUR;COMPLETED;1258.01",
    ].join("\n")

    const movements = parseBankMovements(csv)
    expect(movements.length).toBe(2)
    expect(movements[0].date).toBe("2026-09-01")
    expect(movements[0].amount).toBe(-23.45)
    expect(movements[0].concept).toContain("Mercadona")
  })

  it("parses a Revolut-style CSV with comma decimals keeping full amount and sign", () => {
    const csv = [
      "Tipo;Producto;Fecha de inicio;Fecha de finalización;Descripcion;Importe;Comision;Divisa;Estado;Saldo",
      "CARD_PAYMENT;Revolut;;2026-09-01 10:00:00;2026-09-01 10:00:00;Mercadona-Madrid;;-23,45;0;EUR;COMPLETED;1234,56",
      "TRANSFER;Revolut;;2026-09-02 09:00:00;2026-09-02 09:00:00;Salario;2000,00;0;EUR;COMPLETED;3258,01",
    ].join("\n")

    const movements = parseBankMovements(csv)
    expect(movements.length).toBe(2)
    expect(movements[0].amount).toBe(-23.45)
    expect(movements[1].amount).toBe(2000)
  })

  it("ingest pipelines transactions into income and expense views", () => {
    const csv = [
      "05/09/2026;Mercadona;;-45,67;1520,90",
      "02/09/2026;Nomina;;2000,00;1566,57",
    ].join("\n")

    const movements = parseBankMovements(csv)

    const prefix = getPeriodPrefix(movements, "09")
    expect(prefix).toBe("2026-09")

    const incomes = movements.filter(
      (movement) => movement.amount > 0 && movement.date.startsWith(prefix),
    )
    expect(incomes.length).toBe(1)

    const expenses = movements.filter(
      (movement) => movement.amount < 0 && movement.date.startsWith(prefix),
    )
    expect(expenses.length).toBe(1)

    const breakdown = incomeBreakdown(movements, prefix)
    expect(breakdown.salary).toBe(2000)
    expect(breakdown.transfers + breakdown.bizum).toBe(0)
  })

  it("per-month views resolve the correct year for past data", () => {
    const transactions: BankMovement[] = [
      { date: "2025-06-30", concept: "Nomina", reference: "", amount: 2000 },
      { date: "2025-06-01", concept: "Alquiler", reference: "", amount: -700 },
    ]

    expect(getPeriodPrefix(transactions, "06")).toBe("2025-06")

    const incomes = transactions.filter((t) => t.amount > 0 && t.date.startsWith("2025-06"))
    expect(incomes.length).toBe(1)
  })
})
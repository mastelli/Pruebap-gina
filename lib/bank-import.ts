import { parseNorma43Movements } from "./norma43"

export interface BankMovement {
  date: string
  concept: string
  reference: string
  amount: number
  balance?: number
}

const SPANISH_DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/
const NUMERIC_RE = /^[-+]?\d[\d.,]*\s?€?$/

function parseEuropeanNumber(raw: string): number {
  let value = raw.trim().replace(/[€\s]/g, "")
  if (!value) return Number.NaN

  const negative = value.startsWith("-")
  value = value.replace(/^[-+]/, "")

  if (value.includes(",")) {
    value = value.replace(/\./g, "").replace(",", ".")
  } else if (/^\d{1,3}(\.\d{3})+$/.test(value)) {
    value = value.replace(/\./g, "")
  }

  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) return Number.NaN

  return negative ? -parsed : parsed
}

function isoFromSpanishDate(raw: string): string {
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!match) return ""
  const [, day, month, year] = match
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

function looksLikeCsv(content: string): boolean {
  const head = content.slice(0, 2000)
  return head.includes(";")
}

function parseCsvMovements(content: string): BankMovement[] {
  const movements: BankMovement[] = []

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    let fields = line
      .split(";")
      .map((field) => field.trim())
      .filter((field) => field !== "")

    if (fields.length < 3) continue
    if (
      fields.some(
        (field) =>
          field === "Fecha" ||
          field === "Fecha valor" ||
          field === "Concepto" ||
          field === "Importe" ||
          field === "Saldo Posterior",
      )
    ) {
      continue
    }

    // Extraer las fechas del principio (fecha y opcionalmente fecha valor)
    const dates: string[] = []
    while (fields.length > 0 && dates.length < 2 && SPANISH_DATE_RE.test(fields[0])) {
      dates.push(fields.shift() as string)
    }
    if (dates.length === 0) continue

    // Localizar importe y saldo (los dos últimos campos numéricos)
    const numericIndices = fields
      .map((field, index) => ({ field, index }))
      .filter(({ field }) => NUMERIC_RE.test(field))

    if (numericIndices.length === 0) continue

    const saldoEntry = numericIndices[numericIndices.length - 1]
    const amountEntry =
      numericIndices.length >= 2 ? numericIndices[numericIndices.length - 2] : saldoEntry

    const amount = parseEuropeanNumber(amountEntry.field)
    if (Number.isNaN(amount)) continue

    // Saldo posterior (el último campo numérico), si existe
    let balance: number | undefined
    if (numericIndices.length >= 2) {
      const parsedBalance = parseEuropeanNumber(saldoEntry.field)
      if (!Number.isNaN(parsedBalance)) {
        balance = parsedBalance
      }
    }

    const conceptFields = fields.filter(
      (_, index) => index !== amountEntry.index && index !== saldoEntry.index,
    )

    movements.push({
      date: isoFromSpanishDate(dates[0]),
      concept: conceptFields.join(" ") || "Sin concepto",
      reference: "",
      amount,
      balance,
    })
  }

  return movements
}

function parseBankMovements(content: string): BankMovement[] {
  if (looksLikeCsv(content)) {
    const csvMovements = parseCsvMovements(content)
    if (csvMovements.length > 0) {
      return csvMovements
    }
  }
  return parseNorma43Movements(content).map((movement) => ({
    date: movement.date,
    concept: movement.concept,
    reference: movement.reference,
    amount: movement.amount,
    balance: movement.balance,
  }))
}

export { parseBankMovements }

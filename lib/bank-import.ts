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

// Campos de cabecera: se eliminan aunque aparezcan mezclados con datos
// (algunos bancos pegan la cabecera y la primera fila en la misma línea)
const HEADER_FIELDS = new Set([
  "Cantidades expresadas en euros",
  "Fecha",
  "Fecha valor",
  "Concepto",
  "Importe",
  "Saldo Posterior",
])

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
      .filter((field) => field !== "" && !HEADER_FIELDS.has(field))

    if (fields.length < 3) continue

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

function looksLikeRevolut(content: string): boolean {
  const head = content.slice(0, 2000)
  return head.includes("Fecha de inicio") && head.includes("Saldo")
}

// Fechas tipo "2026-08-02 22:07:29"
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/

function parseRevolutMovements(content: string): BankMovement[] {
  const movements: BankMovement[] = []

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const fields = line.split(",").map((field) => field.trim())
    if (fields.length < 6) continue

    // Localizar las dos primeras fechas (fecha de inicio y fecha de finalización);
    // la descripción queda entre ellas y los últimos cinco campos son
    // Importe, Comisión, Divisa, State y Saldo (así tolera cabeceras pegadas,
    // comas dentro de la descripción y columnas extra)
    let startDateIdx = fields.findIndex((field) => ISO_DATE_RE.test(field))
    if (startDateIdx === -1) continue

    let endDateIdx = startDateIdx + 1
    if (endDateIdx < fields.length && ISO_DATE_RE.test(fields[endDateIdx])) {
      endDateIdx += 1
    }

    const rest = fields.slice(endDateIdx)
    if (rest.length < 5) continue

    const tail = rest.slice(-5)
    const amountValue = Number.parseFloat(tail[0])
    const feeValue = tail[1] === "" ? 0 : Number.parseFloat(tail[1])
    const balanceValue = Number.parseFloat(tail[4])

    if (Number.isNaN(amountValue) || Number.isNaN(balanceValue)) continue

    const conceptFields = rest.slice(0, rest.length - 5)

    movements.push({
      date: fields[startDateIdx].slice(0, 10),
      concept: conceptFields.join(" ").trim() || "Sin concepto",
      reference: "",
      // La comision siempre es un cargo adicional al importe
      amount: Number.isNaN(feeValue) ? amountValue : amountValue - Math.abs(feeValue),
      balance: balanceValue,
    })
  }

  return movements
}

// Recargas/traspasos de tarjeta Revolut: se descartan al importar
const REVOLUT_TRANSFER_RE = /revolut\s*\*\*/i

export function parseBankMovements(content: string): BankMovement[] {
  let parsed: BankMovement[] = []

  if (looksLikeRevolut(content)) {
    parsed = parseRevolutMovements(content)
  }
  if (parsed.length === 0 && looksLikeCsv(content)) {
    parsed = parseCsvMovements(content)
  }
  if (parsed.length === 0) {
    parsed = parseNorma43Movements(content).map((movement) => ({
      date: movement.date,
      concept: movement.concept,
      reference: movement.reference,
      amount: movement.amount,
      balance: movement.balance,
    }))
  }

  return parsed.filter((movement) => !REVOLUT_TRANSFER_RE.test(movement.concept))
}

// Parser de CSVs de broker. Dos formatos:
// 1) Por posicion: Producto, ISIN, Cantidad, Precio actual, Moneda,
//    Valor local total, Valor EUR total.
// 2) Ordenes de MyInvestor: Fecha de la orden, ISIN, Importe estimado,
//    N de participaciones, Estado (solo se importan las finalizadas).
// El delimitador se detecta solo (tabulador, ";" o ",") y respeta
// campos entre comillas. Sin dependencias de React: se puede usar
// tanto en la cartera clasica como en la cartera 2.0.

export interface BrokerAsset {
  id: string
  product: string
  isin: string
  quantity: number
  currency?: string
  csvPrice?: number
  eurValue?: number
  kind?: "stock" | "etf" | "fund" | "other"
  date?: string
  exchange?: string
  side?: "buy" | "sell"
  orderId?: string
}

export interface ParsedPortfolio {
  assets: BrokerAsset[]
  cash: number
}

function parseNumber(raw: string): number {
  let value = (raw ?? "").trim().replace(/[€$%\s]/g, "")
  if (/,\d{1,4}$/.test(value)) {
    value = value.replace(/\./g, "").replace(",", ".")
  } else {
    value = value.replace(/,/g, "")
  }
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : NaN
}

// Divide una linea respetando campos entre comillas (nombres con comas)
function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(current)
      current = ""
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells.map((cell) => cell.trim().replace(/^"|"$/g, ""))
}

export function parsePortfolioCsv(text: string): ParsedPortfolio {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return { assets: [], cash: 0 }

  const firstLine = lines[0]
  const tabs = firstLine.match(/\t/g)?.length ?? 0
  const semis = firstLine.match(/;/g)?.length ?? 0
  const commas = firstLine.match(/,/g)?.length ?? 0
  const delimiter = tabs > semis && tabs > commas ? "\t" : semis > commas ? ";" : ","

  // Formato MyInvestor (ordenes de fondos): Fecha, ISIN, Importe,
  // N de participaciones, Estado. Se detecta por la cabecera.
  if (isMyInvestorHeader(splitCsvLine(firstLine, delimiter))) {
    return { assets: parseMyInvestorLines(lines.slice(1), delimiter), cash: 0 }
  }

  // Extracto de transacciones de DEGIRO: Fecha, Hora, Producto, ISIN,
  // Bolsa, Centro, Numero (positivo = compra, negativo = venta), Precio,
  // ..., Total EUR, ID Orden. Se detecta por la cabecera.
  if (isDegiroTransactionsHeader(splitCsvLine(firstLine, delimiter))) {
    return { assets: parseDegiroTransactionLines(lines.slice(1), delimiter), cash: 0 }
  }

  const assets: BrokerAsset[] = []
  let cash = 0

  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line, delimiter)
    const product = (cells[0] ?? "").trim()
    const isin = (cells[1] ?? "").trim().toUpperCase()

    // Linea de efectivo/cash: sin ISIN y con un texto que lo identifica.
    // Ej.: "CASH & CASH FUND & FTX CASH (EUR)" con su valor en las ultimas columnas.
    if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin) && /cash/i.test(product)) {
      // valor EUR = ultimo campo numerico de la linea
      let amount = NaN
      for (let i = cells.length - 1; i >= 0; i--) {
        const parsed = parseNumber(cells[i] ?? "")
        if (Number.isFinite(parsed) && parsed !== 0) {
          amount = parsed
          break
        }
      }
      if (Number.isFinite(amount) && amount !== 0) cash += amount
      continue
    }

    // El resto de lineas sin ISIN valido (cabecera repetida, etc.) se ignoran
    if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)) continue

    const quantity = parseNumber(cells[2] ?? "")
    const csvPrice = parseNumber(cells[3] ?? "")
    const eurValue = parseNumber(cells[6] ?? cells[5] ?? "")
    if (!Number.isFinite(quantity) || (!Number.isFinite(csvPrice) && !Number.isFinite(eurValue))) continue

    assets.push({
      id: `${isin}-${Date.now()}-${assets.length}`,
      product: product || isin,
      isin,
      quantity,
      currency: (cells[4] ?? "").trim().toUpperCase() || undefined,
      csvPrice: Number.isFinite(csvPrice) ? csvPrice : undefined,
      eurValue: Number.isFinite(eurValue) ? eurValue : undefined,
    })
  }

  return { assets, cash }
}

function isDegiroTransactionsHeader(cells: string[]): boolean {
  const head = cells.join(" ").toLowerCase()
  return head.includes("id orden") && head.includes("isin")
}

// Lotes para conciliar compras y ventas (FIFO): las ventas consumen las
// compras mas antiguas. Todo en la misma moneda de la posicion.
export interface TxLot {
  qty: number
  price: number
  date: string
  orderId?: string
}

export interface TxRow {
  quantity: number
  price: number
  date: string
  orderId?: string
  side: "buy" | "sell"
}

// Aplica filas de transacciones sobre los lotes de apertura y devuelve
// los lotes restantes. Las filas con orderId ya presente se ignoran
// (reimportar el mismo archivo no duplica). Si todo se ha vendido,
// devuelve [] para que la posicion desaparezca.
export function applyTransactions(opening: TxLot[], rows: TxRow[]): TxLot[] {
  const seen = new Set<string>()
  for (const lot of opening) {
    if (lot.orderId) seen.add(lot.orderId)
  }
  const lots: TxLot[] = opening.map((lot) => ({ ...lot }))
  const sorted = [...rows].sort((a, b) => (a.date || "").localeCompare(b.date || ""))
  for (const row of sorted) {
    if (row.orderId && seen.has(row.orderId)) continue
    if (row.orderId) seen.add(row.orderId)
    if (!(row.quantity > 0)) continue
    if (row.side === "sell") {
      let need = row.quantity
      for (const lot of lots) {
        if (need <= 0) break
        if (!(lot.qty > 0)) continue
        const take = Math.min(lot.qty, need)
        lot.qty -= take
        need -= take
      }
    } else {
      lots.push({ qty: row.quantity, price: row.price, date: row.date, orderId: row.orderId })
    }
  }
  return lots.filter((lot) => lot.qty > 1e-9)
}

// Bolsa de referencia / centro de ejecucion de DEGIRO -> nombre de bolsa.
// XGAT es el codigo MIC de Tradegate (igual que TDG en bolsa de referencia).
// Si no se conoce, se deja vacio y la API elige el listado en EUR.
function mapDegiroExchange(raw: string, venue?: string): string {
  const code = (raw ?? "").trim().toUpperCase()
  const exec = (venue ?? "").trim().toUpperCase()
  if (code === "TDG" || exec === "XGAT") return "Tradegate"
  if (code === "NDQ") return "NASDAQ"
  if (code === "MAD") return "BME"
  if (code === "MIL") return "MIL"
  return ""
}

function isMyInvestorHeader(cells: string[]): boolean {
  const head = cells.join(" ").toLowerCase()
  return head.includes("fecha") && head.includes("isin") && head.includes("participacion")
}

function isoFromSpanishDate(raw: string): string {
  const m = (raw ?? "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!m) return ""
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`
}

// Ordenes de fondos de MyInvestor: solo se importan las finalizadas.
// Precio = importe / participaciones; la divisa sale del propio importe ("500 EUR").
function parseMyInvestorLines(lines: string[], delimiter: string): BrokerAsset[] {
  const out: BrokerAsset[] = []
  for (const line of lines) {
    const cells = splitCsvLine(line, delimiter)
    if (cells.length < 4) continue
    const status = (cells[4] ?? "").toLowerCase()
    if (!status.includes("finalizada")) continue
    const isin = (cells[1] ?? "").trim().toUpperCase()
    if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)) continue
    const amountRaw = (cells[2] ?? "").trim()
    const currency = ((/([A-Za-z]{3})\s*$/.exec(amountRaw) ?? [])[1] ?? "EUR").toUpperCase()
    const amount = parseNumber(amountRaw)
    const shares = parseNumber(cells[3] ?? "")
    if (!Number.isFinite(amount) || !Number.isFinite(shares) || shares <= 0) continue
    const date = isoFromSpanishDate(cells[0] ?? "")
    out.push({
      id: `${isin}-${date || Date.now()}-${out.length}`,
      product: "",
      isin,
      quantity: shares,
      currency,
      csvPrice: amount / shares,
      eurValue: currency === "EUR" ? amount : undefined,
      kind: "fund",
      date: date || undefined,
    })
  }
  return out
}

// Filas del extracto de transacciones de DEGIRO. Numero positivo =
// compra, negativo = venta. El coste unitario sale del Total EUR
// (dinero realmente pagado, con comisiones y cambio ya aplicados).
function parseDegiroTransactionLines(lines: string[], delimiter: string): BrokerAsset[] {
  const out: BrokerAsset[] = []
  for (const line of lines) {
    const cells = splitCsvLine(line, delimiter)
    if (cells.length < 16) continue
    const isin = (cells[3] ?? "").trim().toUpperCase()
    if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)) continue
    const product = (cells[2] ?? "").trim()
    const qty = parseNumber(cells[6] ?? "")
    if (!Number.isFinite(qty) || qty === 0) continue
    // Precio nativo de la orden (columna Precio + su moneda): p. ej.
    // 15 acciones a 9,36 USD. Solo si falta se deriva del Total EUR.
    const nativePrice = parseNumber(cells[7] ?? "")
    const priceCcy = (cells[8] ?? "").trim().toUpperCase()
    const totalEur = parseNumber(cells[15] ?? "")
    let unit: number
    let currency: string
    if (Number.isFinite(nativePrice)) {
      unit = nativePrice
      currency = priceCcy || "EUR"
    } else if (Number.isFinite(totalEur) && totalEur !== 0) {
      unit = Math.abs(totalEur) / Math.abs(qty)
      currency = "EUR"
    } else {
      continue
    }
    const date = isoFromSpanishDate((cells[0] ?? "").trim().replace(/-/g, "/"))
    if (!date) continue
    const orderId = (cells[16] ?? "").trim() || undefined
    out.push({
      id: `${isin}-${date}-${orderId ?? out.length}`,
      product: product || isin,
      isin,
      quantity: Math.abs(qty),
      currency,
      csvPrice: unit,
      kind: /etf/i.test(product) ? "etf" : /\betc\b/i.test(product) ? "etf" : "stock",
      date,
      exchange: mapDegiroExchange(cells[4] ?? "", cells[5] ?? ""),
      side: qty > 0 ? "buy" : "sell",
      orderId,
    })
  }
  return out
}

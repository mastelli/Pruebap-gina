// Parser del CSV del broker (por posicion):
// Producto, ISIN, Cantidad, Precio actual, Moneda, Valor local total, Valor EUR total.
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

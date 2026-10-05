import { describe, expect, it } from "vitest"
import { isValidIsin, parseTvScanner, pickIsinRow, pickTvRow } from "@/lib/tradingview"

describe("tradingview helpers", () => {
  it("validates ISINs", () => {
    expect(isValidIsin("US5949181045")).toBe(true)
    expect(isValidIsin("ie00b4l5y983")).toBe(true)
    expect(isValidIsin("MSFT")).toBe(false)
    expect(isValidIsin("")).toBe(false)
  })

  it("picks the row matching the requested exchange first", () => {
    const rows = [
      { symbol: "MSFT", exchange: "NASDAQ", currency: "USD", description: "Microsoft Corporation" },
      { symbol: "MSF", exchange: "TRADEGATE", currency: "EUR", description: "Microsoft Corporation" },
      { symbol: "MSF", exchange: "XETR", currency: "EUR", description: "Microsoft Corporation" },
    ]
    expect(pickTvRow(rows, "Tradegate")?.symbol).toBe("MSF")
    expect(pickTvRow(rows, "Tradegate")?.exchange).toBe("TRADEGATE")
    // Sin bolsa pedida prefiere el listado en EUR
    expect(pickTvRow(rows)?.currency).toBe("EUR")
    // Los alias valen: XETRA encuentra XETR, BME Madrid encuentra BME
    const euRows = [
      { symbol: "MSF", exchange: "XETR", currency: "EUR", description: "Microsoft" },
      { symbol: "MSFT", exchange: "NASDAQ", currency: "USD", description: "Microsoft" },
    ]
    expect(pickTvRow(euRows, "XETRA")?.exchange).toBe("XETR")
    expect(pickTvRow([{ symbol: "OHL", exchange: "BME", currency: "EUR", description: "OHLA" }], "BME Madrid")?.exchange).toBe("BME")
    // Sin filas validas devuelve null
    expect(pickTvRow([{ symbol: "", exchange: "X" }])).toBeNull()
    expect(pickTvRow([])).toBeNull()
  })

  it("parses scanner payload and converts GBX pence to GBP", () => {
    const q = parseTvScanner("MSF", "TRADEGATE", {
      close: 461.65,
      change_abs: 1.95,
      currency: "EUR",
      description: "Microsoft Corporation",
    })
    expect(q?.price).toBeCloseTo(461.65, 5)
    expect(q?.previousClose).toBeCloseTo(459.7, 5)
    expect(q?.currency).toBe("EUR")
    expect(q?.longName).toBe("Microsoft Corporation")
    expect(q?.exchange).toBe("TRADEGATE")

    const lse = parseTvScanner("SWDA", "LSE", { close: 850, currency: "GBX" })
    expect(lse?.price).toBeCloseTo(8.5, 5)
    expect(lse?.currency).toBe("GBP")

    expect(parseTvScanner("X", "Y", { close: null })).toBeNull()
    expect(parseTvScanner("X", "Y", {})).toBeNull()
  })

  it("picks the ISIN only from exact-symbol rows", () => {
    const rows = [
      { symbol: "MSF", exchange: "TRADEGATE", isin: "US5949181045" },
      { symbol: "MSF", exchange: "XETR", isin: "US5949181045" },
      { symbol: "MSFU", exchange: "NASDAQ", isin: "US00LEV12345" },
    ]
    // Prefiere la bolsa pedida dentro del mismo simbolo
    expect(pickIsinRow(rows, "MSF", "Tradegate")).toBe("US5949181045")
    expect(pickIsinRow(rows, "msf", "Xetra")).toBe("US5949181045")
    // Sin bolsa, coge el simbolo exacto aunque haya apalancados
    expect(pickIsinRow(rows, "MSF")).toBe("US5949181045")
    // Sin simbolo exacto no inventa nada (el apalancado tiene otro ISIN)
    expect(pickIsinRow(rows, "MSFU")).toBe("US00LEV12345")
    expect(pickIsinRow(rows, "APPLE")).toBeNull()
    expect(pickIsinRow([], "MSF")).toBeNull()
    expect(pickIsinRow(rows, "")).toBeNull()
  })
})

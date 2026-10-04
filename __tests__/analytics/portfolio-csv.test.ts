import { describe, expect, it } from "vitest"
import { parsePortfolioCsv } from "@/lib/portfolio-csv"

describe("parsePortfolioCsv", () => {
  it("parses MyInvestor order csv (date, ISIN, amount, shares, status)", () => {
    const csv = [
      "Fecha de la orden;ISIN;Importe estimado;Nº de participaciones;Estado",
      "27/09/2026;IE00B4L5Y983;500 EUR;6,05;Finalizada",
      "15/08/2026;IE00B4L5Y983;500 EUR;8,02;Finalizada",
      "01/10/2026;IE00B4L5Y983;500 EUR;7,00;En curso",
    ].join("\n")
    const { assets } = parsePortfolioCsv(csv)
    // Solo las finalizadas
    expect(assets).toHaveLength(2)
    expect(assets[0].isin).toBe("IE00B4L5Y983")
    expect(assets[0].quantity).toBeCloseTo(6.05, 5)
    expect(assets[0].csvPrice).toBeCloseTo(500 / 6.05, 5)
    expect(assets[0].currency).toBe("EUR")
    expect(assets[0].kind).toBe("fund")
    expect(assets[0].date).toBe("2026-09-27")
    expect(assets[1].quantity).toBeCloseTo(8.02, 5)
    expect(assets[1].date).toBe("2026-08-15")
  })

  it("keeps parsing classic broker csv (product, ISIN, qty, price, ccy, values)", () => {
    const csv = [
      "Producto;ISIN;Cantidad;Precio actual;Moneda;Valor local total;Valor EUR total",
      "APPLE INC;US0378331005;10;180,00;USD;1800,00;1650,00",
    ].join("\n")
    const { assets, cash } = parsePortfolioCsv(csv)
    expect(cash).toBe(0)
    expect(assets).toHaveLength(1)
    expect(assets[0].isin).toBe("US0378331005")
    expect(assets[0].quantity).toBe(10)
    expect(assets[0].csvPrice).toBeCloseTo(180, 5)
    expect(assets[0].currency).toBe("USD")
  })
})

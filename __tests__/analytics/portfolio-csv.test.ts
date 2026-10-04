import { describe, expect, it } from "vitest"
import { applyTransactions, parsePortfolioCsv } from "@/lib/portfolio-csv"

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

  it("parses DEGIRO transactions csv (buys and sells with order id)", () => {
    const csv = [
      "Fecha,Hora,Producto,ISIN,Bolsa de referencia,Centro de ejecución,Número,Precio,,Valor local,,Valor EUR,Tipo de cambio,Comisión AutoFX,Costes de transacción y/o externos EUR,Total EUR,ID Orden",
      '28-09-2026,15:30,"ADMA BIOLOGICS, INC.",US0008991046,NDQ,XNAS,15,"9,3600",USD,"-140,40",USD,"-123,53","1,1366","-0,31","-2,00","-125,84",fdd44c87-0d9d-497c-96ba-10ea12de362e',
      "14-07-2026,11:35,VANGUARD S&P 500 UCITS ETF USD ACC,IE00BFMXXD54,TDG,XGAT,3,\"125,2750\",EUR,\"-375,82\",EUR,\"-375,82\",,\"0,00\",\"-1,00\",\"-376,82\",00bb2d37-2bae-4012-a306-96237537c676",
      "14-07-2026,11:35,VANGUARD S&P 500 UCITS ETF USD ACC,IE00BFMXXD54,TDG,XGAT,-9,\"127,2550\",EUR,\"1145,30\",EUR,\"1145,30\",,\"0,00\",\"-1,00\",\"1144,30\",9410ae88-8162-467f-bd80-d8d0abe2c722",
      ",,UCITS ETF,,,,,,,,,,,,,,",
    ].join("\n")
    const { assets } = parsePortfolioCsv(csv)
    // 1 compra ADMA + 1 compra + 1 venta del ETF (la fila partida se ignora)
    expect(assets).toHaveLength(3)
    const adma = assets.find((a) => a.isin === "US0008991046")
    expect(adma?.side).toBe("buy")
    expect(adma?.quantity).toBe(15)
    expect(adma?.csvPrice).toBeCloseTo(125.84 / 15, 5)
    expect(adma?.currency).toBe("EUR")
    expect(adma?.date).toBe("2026-09-28")
    expect(adma?.orderId).toBe("fdd44c87-0d9d-497c-96ba-10ea12de362e")
    const sell = assets.find((a) => a.side === "sell")
    expect(sell?.quantity).toBe(9)
    expect(sell?.orderId).toBe("9410ae88-8162-467f-bd80-d8d0abe2c722")
  })

  it("reconciles sells with FIFO and ignores repeated order ids", () => {
    const opening: { qty: number; price: number; date: string; orderId?: string }[] = []
    const buy = { quantity: 40, price: 7.481, date: "2026-04-07", orderId: "buy-1", side: "buy" as const }
    const sell = { quantity: 40, price: 6.754, date: "2026-04-08", orderId: "sell-1", side: "sell" as const }
    // Vendido todo: no queda nada
    expect(applyTransactions(opening, [buy, sell])).toHaveLength(0)
    // Venta parcial de 9 sobre 12: quedan las 3 mas nuevas (FIFO)
    const partial = applyTransactions(opening, [
      { quantity: 3, price: 111.93, date: "2026-04-08", orderId: "b1", side: "buy" as const },
      { quantity: 3, price: 117.65, date: "2026-04-29", orderId: "b2", side: "buy" as const },
      { quantity: 3, price: 125.27, date: "2026-05-29", orderId: "b3", side: "buy" as const },
      { quantity: 3, price: 130.0, date: "2026-05-30", orderId: "b4", side: "buy" as const },
      { quantity: 9, price: 127.25, date: "2026-07-14", orderId: "s1", side: "sell" as const },
    ])
    expect(partial).toHaveLength(1)
    expect(partial[0].qty).toBe(3)
    expect(partial[0].price).toBeCloseTo(130.0, 5)
    expect(partial[0].date).toBe("2026-05-30")
    // Las ordenes ya presentes en los lotes se ignoran al reimportar
    const again = applyTransactions(partial, [
      { quantity: 3, price: 130.0, date: "2026-05-30", orderId: "b4", side: "buy" as const },
      { quantity: 2, price: 140.0, date: "2026-08-01", orderId: "b5", side: "buy" as const },
    ])
    expect(again).toHaveLength(2)
    expect(again[0].qty).toBe(3)
    expect(again[1].qty).toBe(2)
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

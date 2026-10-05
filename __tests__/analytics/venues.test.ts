import { describe, expect, it } from "vitest"
import { sameVenue } from "@/lib/exchanges"

describe("sameVenue", () => {
  it("matches codes, suffixes and names of the same market", () => {
    expect(sameVenue("XETRA", "GER")).toBe(true)
    expect(sameVenue("XETRA", "XETR")).toBe(true)
    expect(sameVenue("BME Madrid", "MC")).toBe(true)
    expect(sameVenue("BME Madrid", "BME")).toBe(true)
    expect(sameVenue("Bolsa Italiana", "MIL")).toBe(true)
    expect(sameVenue("Tradegate", "TRADEGATE")).toBe(true)
    expect(sameVenue("NASDAQ", "NMS")).toBe(true)
    expect(sameVenue("Euronext París", "PA")).toBe(true)
    expect(sameVenue("SIX Suiza", "SW")).toBe(true)
  })

  it("rejects different markets and empty values", () => {
    expect(sameVenue("NASDAQ", "XETRA")).toBe(false)
    expect(sameVenue("BME Madrid", "NASDAQ")).toBe(false)
    expect(sameVenue("", "XETRA")).toBe(false)
    expect(sameVenue("XETRA", "")).toBe(false)
  })
})

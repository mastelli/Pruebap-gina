import { describe, expect, it } from "vitest"
import { tradegateNumber } from "@/lib/tradegate"

describe("tradegateNumber", () => {
  it("parses floats, german decimals and space thousands", () => {
    expect(tradegateNumber(130.21)).toBeCloseTo(130.21, 5)
    expect(tradegateNumber("296,40")).toBeCloseTo(296.4, 5)
    expect(tradegateNumber("1 220,00")).toBe(1220)
    expect(tradegateNumber("1 215,00")).toBe(1215)
    expect(tradegateNumber("462,00")).toBe(462)
    expect(tradegateNumber("44,20")).toBeCloseTo(44.2, 5)
  })

  it("returns null on empty or invalid values", () => {
    expect(tradegateNumber("")).toBeNull()
    expect(tradegateNumber("  ")).toBeNull()
    expect(tradegateNumber(null)).toBeNull()
    expect(tradegateNumber(undefined)).toBeNull()
    expect(tradegateNumber(Number.NaN)).toBeNull()
  })
})

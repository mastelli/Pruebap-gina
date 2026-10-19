import { describe, expect, it } from "vitest"
import { buildTechnicalSnapshot, pctChange, rsi, sma, volumeRatio } from "@/lib/technical-indicators"

describe("technical indicators", () => {
  it("computes simple moving averages on the last closes", () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toBe(4)
    expect(sma([1, 2, 3], 3)).toBe(2)
    expect(sma([1, 2], 3)).toBeNull()
  })

  it("computes Wilder RSI", () => {
    const rising = Array.from({ length: 20 }, (_, i) => 100 + i)
    expect(rsi(rising)).toBe(100)
    const flat = Array.from({ length: 20 }, () => 100)
    expect(rsi(flat)).toBe(50)
    const falling = Array.from({ length: 20 }, (_, i) => 100 - i)
    expect(rsi(falling)).toBe(0)
    expect(rsi([1, 2, 3])).toBeNull()
  })

  it("computes trend and volume ratio with enough data", () => {
    const closes = [100, 105, 110, 121]
    expect(pctChange(closes, 3)).toBe(21)
    expect(pctChange(closes, 4)).toBeNull()
    expect(volumeRatio([10, 10, 10, 10, 20, 20], 2)).toBe(2)
    expect(volumeRatio([10, 10, 20], 2)).toBeNull()
  })

  it("builds a snapshot from history and quote", () => {
    const history = Array.from({ length: 70 }, (_, i) => ({ price: 100 + i, volume: 1000 }))
    const snapshot = buildTechnicalSnapshot(history, {
      price: 169,
      dayChangePct: 1.2,
      week52High: 200,
      week52Low: 80,
    })
    expect(snapshot).not.toBeNull()
    expect(snapshot?.price).toBe(169)
    expect(snapshot?.sma20).toBe(159.5)
    expect(snapshot?.sma50).toBe(144.5)
    expect(snapshot?.rsi14).toBe(100)
    expect(snapshot?.trend1mPct).toBeGreaterThan(0)
    expect(snapshot?.volumeRatio).toBe(1)
  })

  it("returns null without a usable price", () => {
    expect(buildTechnicalSnapshot([], {})).toBeNull()
    expect(buildTechnicalSnapshot([{ price: null }], { price: 0 })).toBeNull()
  })
})

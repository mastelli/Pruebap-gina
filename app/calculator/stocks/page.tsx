"use client"

import { StockAnalyzer } from "@/components/stock-analyzer"
import { AdsenseScript } from "@/components/ads/adsense-script"
import { AdSlot } from "@/components/ads/ad-slot"

export default function StocksCalculatorPage() {
  return (
    <div className="space-y-4">
      <AdsenseScript />
      <AdSlot className="min-h-[90px] w-full" />
      <StockAnalyzer />
    </div>
  )
}

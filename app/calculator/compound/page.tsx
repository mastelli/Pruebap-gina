"use client"

import { CompoundInterestCalculator } from "@/components/calculator/compound-interest-calculator"
import { AdsenseScript } from "@/components/ads/adsense-script"
import { AdSlot } from "@/components/ads/ad-slot"

export default function CompoundCalculatorPage() {
  return (
    <div className="space-y-4">
      <AdsenseScript />
      <AdSlot className="min-h-[90px] w-full" />
      <CompoundInterestCalculator />
    </div>
  )
}

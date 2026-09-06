"use client"

import AdvancedRealEstateCalculator from "@/components/advanced-real-estate-calculator"
import { AdsenseScript } from "@/components/ads/adsense-script"
import { AdSlot } from "@/components/ads/ad-slot"

export default function RealEstateCalculatorPage() {
  return (
    <div className="space-y-4">
      <AdsenseScript />
      <AdSlot className="min-h-[90px] w-full" />
      <AdvancedRealEstateCalculator />
    </div>
  )
}

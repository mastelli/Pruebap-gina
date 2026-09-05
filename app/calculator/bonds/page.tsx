"use client"

import { Landmark } from "lucide-react"
import { BondCalculator } from "@/components/bond-calculator"

export default function BondsCalculatorPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Landmark className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">Bonos</h1>
      </div>
      <BondCalculator />
    </div>
  )
}
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"

export default function BondsCalculatorPage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-20">
          <p className="text-lg text-muted-foreground">{t("Coming soon")}</p>
        </CardContent>
      </Card>
    </div>
  )
}

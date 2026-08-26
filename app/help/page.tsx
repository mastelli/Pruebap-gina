"use client"

import { useLanguage } from "@/lib/i18n"

export default function HelpPage() {
  const { t } = useLanguage()
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <p className="text-xl text-muted-foreground">{t("Coming Soon")}</p>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Newspaper } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"

export interface CompanyNewsItem {
  title: string
  link: string
  date?: string
  description?: string
  source?: string
}

// Noticias de la empresa analizada, obtenidas de /api/news/company
export function CompanyNews({ companyName }: { companyName?: string | null }) {
  const { t } = useLanguage()
  const [items, setItems] = useState<CompanyNewsItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!companyName) {
      setItems([])
      return
    }
    const controller = new AbortController()
    setLoading(true)
    fetch(`/api/news/company?q=${encodeURIComponent(companyName)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json: { items?: CompanyNewsItem[] }) => setItems(json.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [companyName])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="rounded-lg bg-indigo-500/10 p-1.5">
            <Newspaper className="h-4 w-4 text-indigo-500" />
          </div>
          {t("Latest News")}{companyName ? ` — ${companyName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!companyName ? (
          <p className="text-sm text-muted-foreground">{t("Search for a stock to begin analysis")}</p>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No news available for this company")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="group block">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    {item.source && <span className="font-medium">{item.source}</span>}
                    {item.source && item.date && <span>·</span>}
                    {item.date && (
                      <span>{new Date(item.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

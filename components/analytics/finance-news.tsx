"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Newspaper } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import type { NewsItem } from "@/app/api/news/route"

function formatRelative(dateIso?: string): string {
  if (!dateIso) return ""
  const date = new Date(dateIso)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

// Noticias economicas actuales tomadas por RSS desde /api/news
export function FinanceNews() {
  const { t } = useLanguage()
  const [items, setItems] = useState<NewsItem[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/news")
      .then((res) => res.json())
      .then((json: { items?: NewsItem[] }) => {
        if (!cancelled) setItems(json.items ?? [])
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
          <Newspaper className="h-4 w-4 text-indigo-500" />
        </span>
        <h3 className="text-base font-semibold">{t("Financial news")}</h3>
      </div>

      {failed ? (
        <p className="px-5 py-8 text-sm text-muted-foreground">{t("News error")}</p>
      ) : items === null ? (
        <div className="space-y-3 px-5 py-5">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="animate-pulse space-y-1.5">
              <div className="h-3.5 w-4/5 rounded bg-secondary" />
              <div className="h-3 w-2/5 rounded bg-secondary/60" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="px-5 py-8 text-sm text-muted-foreground">{t("News error")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item, index) => (
            <li key={index}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug group-hover:text-foreground">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  {item.date && (
                    <p className="mt-1 text-xs text-muted-foreground/70">{formatRelative(item.date)}</p>
                  )}
                </div>
                <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
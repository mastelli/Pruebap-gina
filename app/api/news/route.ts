import { NextResponse } from "next/server"

// Fuentes de noticias economicas internacionales y espanolas
const FEEDS = [
  // Espanolas
  "https://www.expansion.com/rss/economia.html",
  "https://www.eleconomista.es/rss/rss-economia.php",
  // Internacionales (ingles)
  "https://feeds.bloomberg.com/markets/news.rss",
  "https://feeds.wsjonline.com/wsj/marketspulse",
  "https://www.ft.com/rss/markets",
  "https://www.ft.com/rss/home/uk",
  "https://www.reuters.com/business/finance/rss",
  "https://www.marketwatch.com/rss/topstories",
]

const CACHE_TTL_MS = 10 * 60 * 1000

export interface NewsItem {
  title: string
  link: string
  date?: string
  description?: string
  source?: string
}

interface CachedFeed {
  at: number
  items: NewsItem[]
}

let cache: CachedFeed | null = null

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&/g, "&")
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function extractTag(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))
  return match ? decodeXml(match[1]).trim() : undefined
}

function parseFeed(xml: string, sourceUrl: string): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.match(/<(item|entry)[^>]*>([\s\S]*?)<\/(item|entry)>/gi) ?? []

  for (const block of blocks) {
    const title = extractTag(block, "title")
    if (!title) continue

    let link: string | undefined
    const linkInline = block.match(/<link[^>]*href="([^"]+)"/i)
    const linkTag = extractTag(block, "link")
    link = linkInline?.[1] ?? (linkTag && /^https?:\/\//i.test(linkTag) ? linkTag : undefined)

    const pubDate = extractTag(block, "pubDate") ?? extractTag(block, "updated") ?? extractTag(block, "published")
    const description = extractTag(block, "description") ?? extractTag(block, "summary")

    items.push({
      title: stripHtml(title),
      link: link ?? "#",
      date: pubDate ? new Date(pubDate).toISOString() : undefined,
      description: description ? stripHtml(decodeXml(description)) : undefined,
      source: sourceUrl,
    })
  }

  const sorted = items
    .filter((item) => item.link !== "#")
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  return sorted.slice(0, 10)
}

async function fetchFeed(url: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal,
  })
  if (!res.ok) throw new Error(`Feed ${url} respondio ${res.status}`)
  return res.text()
}

function deduplicateItems(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.title.toLowerCase().replace(/\s+/g, " ")
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json({
      items: cache.items,
      cachedAt: cache.at,
    })
  }

  const controllers = FEEDS.map(() => new AbortController())
  const timeouts = controllers.map((c) => setTimeout(() => c.abort(), 8000))

  const results = await Promise.allSettled(
    FEEDS.map((url, i) =>
      fetchFeed(url, controllers[i].signal)
        .then((xml) => parseFeed(xml, url))
        .catch(() => [])
    )
  )

  timeouts.forEach(clearTimeout)

  // Combinar todos los items de todas las fuentes exitosas
  const allItems: NewsItem[] = []
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value)
    }
  }

  // Ordenar por fecha (mas recientes primero) y deduplicar
  const sorted = allItems
    .filter((item) => item.link !== "#")
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  const unique = deduplicateItems(sorted).slice(0, 20)

  if (unique.length > 0) {
    cache = { at: Date.now(), items: unique }
  }

  return NextResponse.json({ items: unique, cachedAt: cache?.at ?? Date.now() })
}
import { NextResponse } from "next/server"

// Fuentes de noticias economicas internacionales y espanolas que se prueban en orden
// hasta encontrar una que responda con articulos
const FEEDS = [
  // Espanolas (sin El Pais)
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
}

interface CachedFeed {
  at: number
  source: string
  items: NewsItem[]
}

let cache: CachedFeed | null = null

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function extractTag(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))
  return match ? decodeXml(match[1]).trim() : undefined
}

function parseFeed(xml: string): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.match(/<(item|entry)[^>]*>([\s\S]*?)<\/(item|entry)>/gi) ?? []

  for (const block of blocks) {
    const title = extractTag(block, "title")
    if (!title) continue

    // enlaces: <link>URL</link> (RSS) o <link href="URL"/> (Atom)
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

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json({
      source: cache.source,
      items: cache.items,
      cachedAt: cache.at,
    })
  }

  for (const url of FEEDS) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      try {
        const xml = await fetchFeed(url, controller.signal)
        const items = parseFeed(xml)
        if (items.length > 0) {
          cache = { at: Date.now(), source: url, items }
          return NextResponse.json({ source: url, items, cachedAt: cache.at })
        }
      } finally {
        clearTimeout(timeout)
      }
    } catch {
      // pasa a la siguiente fuente
    }
  }

  return NextResponse.json({ source: null, items: [], cachedAt: Date.now() })
}
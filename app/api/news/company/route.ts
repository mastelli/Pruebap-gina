import { NextRequest, NextResponse } from "next/server"

export interface NewsItem {
  title: string
  link: string
  date?: string
  description?: string
  source?: string
}

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

function parseFeed(xml: string): NewsItem[] {
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
    })
  }

  return items
    .filter((item) => item.link !== "#")
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
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

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")
  if (!q) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  const query = `${q} stock`
  const encodedQuery = encodeURIComponent(query)

  // Multiple Google News RSS feeds for different languages/regions
  const feeds = [
    `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`,
    `https://news.google.com/rss/search?q=${encodedQuery}&hl=es&gl=ES&ceid=ES:es`,
  ]

  const controllers = feeds.map(() => new AbortController())
  const timeouts = controllers.map((c) => setTimeout(() => c.abort(), 8000))

  const results = await Promise.allSettled(
    feeds.map((url, i) =>
      fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: controllers[i].signal,
      })
        .then((res) => res.text())
        .then((xml) => parseFeed(xml))
        .catch(() => [] as NewsItem[])
    )
  )

  timeouts.forEach(clearTimeout)

  const allItems: NewsItem[] = []
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value)
    }
  }

  const sorted = allItems
    .filter((item) => item.link !== "#")
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  const unique = deduplicateItems(sorted).slice(0, 8)

  return NextResponse.json({ items: unique })
}

import { NextRequest, NextResponse } from "next/server"

export interface NewsItem {
  title: string
  link: string
  date?: string
  description?: string
  source?: string
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function stripHtml(value: string): string {
  return decodeEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function extractTag(block: string, name: string): string | undefined {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))
  return match ? stripHtml(match[1]) : undefined
}

async function resolveGoogleNewsUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    })
    return res.url
  } catch {
    return url
  }
}

function parseFeed(xml: string): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.match(/<(item|entry)[^>]*>([\s\S]*?)<\/(item|entry)>/gi) ?? []

  for (const block of blocks) {
    const title = extractTag(block, "title")
    if (!title) continue

    let link: string | undefined
    const linkInline = block.match(/<link[^>]*href="([^"]+)"/i)
    const linkTag = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)
    link = linkInline?.[1] ?? (linkTag ? stripHtml(linkTag[1]) : undefined)
    if (link && !/^https?:\/\//i.test(link)) link = undefined

    const pubDate = extractTag(block, "pubDate") ?? extractTag(block, "updated") ?? extractTag(block, "published")
    const description = extractTag(block, "description") ?? extractTag(block, "summary")

    // Extract source name from <source> tag or <media:credit>
    const sourceTag = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)
    const source = sourceTag ? stripHtml(sourceTag[1]) : undefined

    items.push({
      title: stripHtml(title),
      link: link ?? "#",
      date: pubDate ? new Date(pubDate).toISOString() : undefined,
      description: description || undefined,
      source: source || undefined,
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

function extractSourceFromUrl(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    const sourceMap: Record<string, string> = {
      "reuters.com": "Reuters",
      "bloomberg.com": "Bloomberg",
      "wsj.com": "Wall Street Journal",
      "ft.com": "Financial Times",
      "marketwatch.com": "MarketWatch",
      "cnbc.com": "CNBC",
      "finance.yahoo.com": "Yahoo Finance",
      "investopedia.com": "Investopedia",
      "expansion.com": "Expansión",
      "eleconomista.es": "El Economista",
      "cincodias.elpais.com": "Cinco Días",
      "elconfidencial.com": "El Confidencial",
    }
    for (const [domain, name] of Object.entries(sourceMap)) {
      if (hostname.includes(domain)) return name
    }
    return hostname
  } catch {
    return undefined
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")
  if (!q) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
  }

  const query = `${q} stock`
  const encodedQuery = encodeURIComponent(query)

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

  // Resolve Google News redirect URLs to actual article URLs (in parallel, with timeout)
  const resolved = await Promise.all(
    unique.map(async (item) => {
      if (item.link.includes("news.google.com")) {
        const realUrl = await resolveGoogleNewsUrl(item.link)
        return {
          ...item,
          link: realUrl,
          source: item.source ?? extractSourceFromUrl(realUrl),
        }
      }
      return {
        ...item,
        source: item.source ?? extractSourceFromUrl(item.link),
      }
    })
  )

  return NextResponse.json({ items: resolved })
}

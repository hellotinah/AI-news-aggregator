# API Reference

## `GET /api/news`

Returns all aggregated news articles.

**URL:** `/api/news`
**Method:** `GET`
**Auth:** None
**Caching:** Disabled (`force-dynamic`)

### Success Response (200)

```json
{
  "last_updated": "2026-03-04T18:00:27.184418",
  "articles": [
    {
      "id": "3829ce3a21a37632",
      "title": "Why AI startups are selling the same equity at two different prices",
      "summary": "Some AI founders are using a novel valuation mechanism...",
      "url": "https://techcrunch.com/2026/03/03/why-ai-startups-are...",
      "source": "news",
      "source_name": "TechCrunch AI",
      "published_date": "2026-03-04T00:31:25",
      "author": "Marina Temkin"
    }
  ]
}
```

### Error Response (500)

Returned when `data/news.json` cannot be read or parsed.

```json
{
  "error": "Failed to load news data",
  "last_updated": "2026-03-05T03:00:00.000Z",
  "articles": []
}
```

### Implementation

Defined in `frontend/app/api/news/route.ts`. The route reads `data/news.json` from the filesystem using a relative path (`../data/news.json` from the frontend working directory) and returns its contents directly as JSON.

---

## Data Schema (`data/news.json`)

### Top-level object

```
{
  "last_updated": string,   // ISO 8601 timestamp of the last aggregation run
  "articles": Article[]     // Array of article objects, sorted by date descending
}
```

### Article object

```
{
  "id":             string,          // Deterministic 16-char hex ID (MD5 of URL)
  "title":          string,          // Article title (max ~100 chars for tweets)
  "summary":        string,          // Article summary (max 300 chars)
  "url":            string,          // Original article/tweet/video URL
  "source":         SourceType,      // Category: "twitter" | "news" | "company"
  "source_name":    string,          // Human-readable source name
  "published_date": string,          // ISO 8601 timestamp
  "author":         string | null    // Author name or Twitter handle (optional)
}
```

### TypeScript definition

From `frontend/types/news.ts`:

```typescript
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: 'twitter' | 'news' | 'company';
  source_name: string;
  published_date: string;
  author?: string;
}

interface NewsData {
  last_updated: string;
  articles: NewsArticle[];
}

type SourceFilter = 'all' | 'twitter' | 'news' | 'company';
```

---

## Source Categorization

Each article is assigned a `source` category used for filtering in the frontend.

### `"twitter"`

Articles fetched from the Twitter/X API v2. These are individual tweets from monitored accounts.

- `source_name` format: `@Username` (e.g. `@OpenAI`, `@AndrewYNg`)
- `title` is truncated to 100 characters from the tweet text
- `summary` is the full tweet text (up to 300 characters)
- `author` is the Twitter handle (e.g. `@OpenAI`)

### `"news"`

Articles from RSS feeds and YouTube channels. This is the broadest category.

**RSS sources:**
- `source_name`: `TechCrunch AI`, `The Verge AI`, `VentureBeat AI`
- `title` and `summary` come from the feed entry
- `author` comes from the feed entry's author field (may be null)

**YouTube sources:**
- `source_name` format: `YouTube - Channel Name` (e.g. `YouTube - Two Minute Papers`)
- `title` is the video title from the YouTube API snippet
- `summary` is the video description (up to 300 characters)
- `author` is the channel name
- `url` format: `https://youtube.com/watch?v=VIDEO_ID`

### `"company"`

Reserved for articles scraped directly from AI company blogs. Currently not populated (the scraping function is a placeholder).

- Expected `source_name` values: `OpenAI`, `Anthropic`, `Google DeepMind`, `Meta AI`

---

## Article ID Generation

Article IDs are generated deterministically from the article URL:

```python
hashlib.md5(url.encode()).hexdigest()[:16]
```

This produces a 16-character hexadecimal string. The same URL always produces the same ID, which enables deduplication across runs.

---

## Limits

- Maximum articles stored: **100** (configured via `MAX_ARTICLES` in the aggregation script)
- RSS articles per feed: **10**
- Tweets per account: **5**
- YouTube videos per channel: **5**
- Summary truncation: **300 characters**
- Tweet title truncation: **100 characters**

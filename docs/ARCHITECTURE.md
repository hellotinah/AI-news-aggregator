# Architecture

## System Overview

The AI News Aggregator is composed of four main parts:

1. **Aggregation script** (`scripts/aggregate_news.py`) — a Python script that fetches articles from external APIs and RSS feeds, deduplicates them, and writes the result to `data/news.json`.
2. **Data layer** (`data/news.json`) — a flat JSON file that serves as the single source of truth for all article data.
3. **Next.js frontend** (`frontend/`) — a web application that reads `news.json` via an API route and renders it in a responsive, filterable news grid.
4. **Oz scheduled agent** — a Warp cloud agent that runs the aggregation script on a cron schedule, commits the updated data, and pushes to `main`.

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        External Sources                             │
│                                                                     │
│  ┌──────────┐  ┌───────────────┐  ┌───────────┐  ┌──────────────┐  │
│  │ RSS Feeds│  │ Twitter API v2│  │YouTube API│  │Company Blogs │  │
│  │(3 feeds) │  │ (6 accounts)  │  │(4 channels│  │(4 sites)     │  │
│  └────┬─────┘  └──────┬────────┘  └─────┬─────┘  └──────┬───────┘  │
└───────┼───────────────┼────────────────┼────────────────┼──────────┘
        │               │                │                │
        └───────┬───────┴────────┬───────┘                │
                │                │                        │
                ▼                ▼                        ▼
     ┌──────────────────────────────────────────────────────────┐
     │              aggregate_news.py                            │
     │                                                          │
     │  fetch_rss_news()  ─┐                                    │
     │  fetch_twitter_news() ── deduplicate ── sort ── limit ─► │
     │  fetch_youtube_videos()┘   (by URL)   (by date) (100)    │
     │  fetch_company_blogs()                                    │
     └────────────────────────────┬─────────────────────────────┘
                                  │ writes JSON
                                  ▼
                        ┌──────────────────┐
                        │  data/news.json  │
                        └────────┬─────────┘
                                 │ read by API route
                                 ▼
     ┌──────────────────────────────────────────────────────────┐
     │              Next.js Frontend (Vercel)                    │
     │                                                          │
     │  GET /api/news ── reads news.json ── returns JSON        │
     │                                                          │
     │  page.tsx ── fetches /api/news ── renders:               │
     │    ├── Header (last_updated timestamp)                   │
     │    ├── SourceFilter (all / twitter / news / company)     │
     │    └── NewsGrid → NewsCard[]                             │
     └──────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                           End user (browser)
```

## Component Breakdown

### Aggregation Script (`scripts/aggregate_news.py`)

The script is the data backbone of the project. It runs as a standalone Python process.

**Functions:**

- `fetch_rss_news()` — Parses RSS/Atom feeds using `feedparser`. Fetches up to 10 articles per feed from TechCrunch AI, The Verge AI, and VentureBeat AI.
- `fetch_twitter_news()` — Calls the Twitter API v2 to get recent tweets from 6 key AI accounts. Requires `TWITTER_BEARER_TOKEN`. Skips gracefully if the token is not set.
- `fetch_youtube_videos()` — Uses the YouTube Data API v3 to search for recent videos from 4 AI-focused channels. Requires `YOUTUBE_API_KEY`. Skips gracefully if the key is not set.
- `fetch_company_blogs()` — Placeholder for HTML scraping of OpenAI, Anthropic, DeepMind, and Meta AI blogs. Currently returns an empty list.
- `deduplicate_articles()` — Removes duplicate articles based on URL.
- `generate_id()` — Produces a deterministic 16-character hex ID from the article URL using MD5.
- `main()` — Orchestrates all fetchers, deduplicates, sorts by date descending, limits to 100 articles, and writes `data/news.json`.

**Configuration (top of file):**

- `RSS_FEEDS` — dict mapping source names to RSS feed URLs
- `TWITTER_ACCOUNTS` — list of Twitter usernames to monitor
- `YOUTUBE_CHANNELS` — dict mapping channel names to YouTube channel IDs
- `COMPANY_BLOGS` — dict mapping company names to blog URLs
- `MAX_ARTICLES` — maximum number of articles to keep (default: 100)
- `OUTPUT_FILE` — path to the output JSON file (`data/news.json`)

### Data Layer (`data/news.json`)

A single JSON file containing all aggregated articles. This file is committed to the repository and read at runtime by the frontend.

See [API.md](API.md) for the full schema.

### Frontend (`frontend/`)

A Next.js 16 application using React 19 and Tailwind CSS 4.

**Key files:**

- `app/api/news/route.ts` — Server-side API route that reads `data/news.json` from the filesystem and returns it as JSON. Uses `force-dynamic` to prevent caching.
- `app/page.tsx` — Client component that fetches `/api/news`, manages filter state, and renders the UI.
- `components/Header.tsx` — Displays the site title and `last_updated` timestamp.
- `components/SourceFilter.tsx` — Renders filter buttons for `all`, `twitter`, `news`, and `company` source types with article counts.
- `components/NewsCard.tsx` — Renders a single article card with source badge, title, summary, author, and "Read more" link. Uses color-coded badges per source type.
- `components/NewsGrid.tsx` — Responsive CSS grid (1/2/3 columns) that renders a list of `NewsCard` components.
- `types/news.ts` — TypeScript interfaces: `NewsArticle`, `NewsData`, and `SourceFilter` type.

### Oz Scheduled Agent

A Warp Oz cloud agent configured to run on a cron schedule (`0 9 * * *`).

**Workflow:**
1. Checks out the repository.
2. Installs Python dependencies.
3. Runs `scripts/aggregate_news.py` with `TWITTER_BEARER_TOKEN` and `YOUTUBE_API_KEY` injected from Oz secrets.
4. Commits the updated `data/news.json`.
5. Pushes to `main`, which triggers a Vercel deployment.

This keeps the site's data fresh without any manual intervention.

## Technology Stack

**Backend / Data pipeline:**
- Python 3.9+
- `feedparser` 6.0.11 — RSS/Atom feed parsing
- `requests` 2.31.0 — HTTP client
- `beautifulsoup4` 4.12.3 — HTML parsing
- `google-api-python-client` 2.108.0 — YouTube Data API v3

**Frontend:**
- Next.js 16.1.6 (App Router)
- React 19.2.3
- Tailwind CSS 4 (via `@tailwindcss/postcss`)
- TypeScript 5

**Infrastructure:**
- Vercel — frontend hosting with automatic deploys on push
- Warp Oz — scheduled agent for automated data updates
- GitHub — source control and CI trigger

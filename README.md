# AI News Aggregator

A self-updating microsite that aggregates AI news from multiple sources — RSS feeds, X/Twitter, YouTube, and AI company blogs. A Python aggregation script collects articles into a single JSON file, and a Next.js frontend renders them with source filtering and dark mode. The entire pipeline runs autonomously via a scheduled [Oz](https://www.warp.dev/oz) agent.

## Features

- **Multi-source aggregation** — RSS feeds, X/Twitter API, YouTube Data API, and company blog scraping
- **Automatic daily updates** — Oz scheduled agent runs the aggregation script, commits, and pushes
- **Modern frontend** — Next.js 16 + React 19 + Tailwind CSS 4
- **Dark mode** — respects system preference
- **Source filtering** — filter articles by Twitter, News Outlets, or AI Companies
- **Deduplication** — URL-based dedup prevents duplicate articles
- **Deterministic IDs** — MD5-based article IDs for stable references

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Oz Scheduled Agent                       │
│              (runs daily at 9:00 AM UTC)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  1. pip install -r requirements.txt                     │ │
│  │  2. python scripts/aggregate_news.py                    │ │
│  │  3. git add data/news.json && git commit && git push    │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────┬───────────────────────────────────────────┘
                   │ writes
                   ▼
          ┌────────────────┐
          │  data/news.json │
          └───────┬────────┘
                  │ reads
                  ▼
┌──────────────────────────────────────────────┐
│           Next.js Frontend (Vercel)          │
│  ┌────────────────────────────────────────┐  │
│  │  /api/news  →  reads data/news.json   │  │
│  │  /          →  renders NewsGrid UI    │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a detailed component breakdown and data flow.

## Project Structure

```
AI-news-aggregator/
├── frontend/                  # Next.js web application
│   ├── app/
│   │   ├── api/news/route.ts  # API endpoint serving news.json
│   │   ├── page.tsx           # Main page (client component)
│   │   ├── layout.tsx         # Root layout with fonts
│   │   └── globals.css        # Tailwind + global styles
│   ├── components/
│   │   ├── Header.tsx         # Site header with last-updated time
│   │   ├── NewsCard.tsx       # Individual article card
│   │   ├── NewsGrid.tsx       # Responsive grid of NewsCards
│   │   └── SourceFilter.tsx   # Filter buttons by source type
│   ├── types/news.ts          # TypeScript interfaces
│   ├── package.json
│   └── next.config.ts
├── scripts/
│   └── aggregate_news.py      # Python aggregation script
├── data/
│   └── news.json              # Aggregated article data
├── docs/
│   ├── ARCHITECTURE.md        # Architecture documentation
│   ├── SETUP.md               # Detailed setup guide
│   └── API.md                 # API & data schema documentation
├── requirements.txt           # Python dependencies
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Twitter/X Developer** account with a Bearer Token (optional — script skips Twitter if unset)
- **YouTube Data API** key (optional — script skips YouTube if unset)

### 1. Clone and install

```bash
git clone https://github.com/<your-org>/AI-news-aggregator.git
cd AI-news-aggregator

# Python dependencies
pip install -r requirements.txt

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Set environment variables

```bash
export TWITTER_BEARER_TOKEN="your_twitter_bearer_token"
export YOUTUBE_API_KEY="your_youtube_api_key"
```

Both are optional. If omitted, the aggregation script will skip the corresponding source and still fetch from RSS feeds.

See [docs/SETUP.md](docs/SETUP.md) for instructions on obtaining these credentials.

### 3. Run the aggregation script

```bash
python scripts/aggregate_news.py
```

This fetches articles from all configured sources and writes `data/news.json`.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TWITTER_BEARER_TOKEN` | No | Twitter/X API v2 Bearer Token for fetching tweets |
| `YOUTUBE_API_KEY` | No | YouTube Data API v3 key for fetching videos |

When running via the Oz agent, these are stored as **Oz secrets** and injected automatically. See [docs/SETUP.md](docs/SETUP.md#creating-oz-secrets) for details.

## API Sources

### RSS Feeds
- **TechCrunch AI** — `techcrunch.com/category/artificial-intelligence/feed/`
- **The Verge AI** — `theverge.com/rss/ai-artificial-intelligence/index.xml`
- **VentureBeat AI** — `venturebeat.com/category/ai/feed/`

### X/Twitter Accounts
`@OpenAI`, `@AnthropicAI`, `@GoogleDeepMind`, `@MetaAI`, `@ylecun`, `@AndrewYNg`

### YouTube Channels
- Two Minute Papers
- Yannic Kilcher
- AI Explained
- Matthew Berman

### Company Blogs (placeholder)
- OpenAI (`openai.com/news/`)
- Anthropic (`anthropic.com/news`)
- Google DeepMind (`deepmind.google/discover/blog/`)
- Meta AI (`ai.meta.com/blog/`)

> Company blog scraping is stubbed out and requires per-site HTML parsing to be implemented.

## Deployment

### Vercel

1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Vercel auto-detects Next.js — no build settings changes needed.
4. Every push to `main` triggers a new deployment.

The API route reads `data/news.json` from the repo, so the file must be committed before deployment. The Oz agent handles this automatically.

### Manual deployment

```bash
cd frontend
npm run build
npm run start
```

## Oz Scheduled Agent

The project uses a [Warp Oz](https://www.warp.dev/oz) scheduled agent to automate daily news updates.

### What it does

1. Installs Python dependencies
2. Runs `scripts/aggregate_news.py` (with secrets injected)
3. Commits the updated `data/news.json`
4. Pushes to `main`, triggering a Vercel redeploy

### Schedule

The agent is configured to run **daily at 9:00 AM UTC**.

### Configuring the agent

1. Open the Warp desktop app and navigate to **Oz Agents**.
2. Create a new scheduled agent with:
   - **Repository**: `AI-news-aggregator`
   - **Schedule**: `0 9 * * *` (cron syntax for daily at 9 AM UTC)
   - **Task prompt**: a description of the aggregation + commit + push workflow
3. Add secrets `TWITTER_BEARER_TOKEN` and `YOUTUBE_API_KEY` under the agent's secret configuration.

See [docs/SETUP.md](docs/SETUP.md#configuring-the-oz-scheduled-agent) for a step-by-step walkthrough.

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — Detailed setup guide, API credentials, Oz secrets, troubleshooting
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture, component breakdown, data flow
- [docs/API.md](docs/API.md) — API endpoint reference and data schema

## Future Enhancements

- **Company blog scraping** — Implement actual HTML parsers for OpenAI, Anthropic, DeepMind, and Meta AI blogs
- **Full-text search** — Add client-side or server-side search across article titles and summaries
- **Pagination** — Paginate the news grid for better performance with large datasets
- **Tagging / topic clustering** — Auto-tag articles by topic (e.g. LLMs, robotics, policy) using keyword extraction or an LLM
- **Email digest** — Send a daily/weekly summary email via the Oz agent
- **RSS output** — Expose an RSS feed of the aggregated articles
- **Database backend** — Replace `news.json` with a database (e.g. SQLite, Postgres) for better querying and history
- **Article thumbnails** — Fetch Open Graph images for richer card displays
- **Rate-limit handling** — Add retry logic and backoff for Twitter/YouTube API rate limits
- **Metrics dashboard** — Track article counts, source distribution, and fetch success rates over time

## License

MIT

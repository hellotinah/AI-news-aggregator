# Setup Guide

Complete setup instructions for the AI News Aggregator project.

## Prerequisites

- **Python 3.9+** — for the aggregation script
- **Node.js 18+** and **npm** — for the Next.js frontend
- **Git** — for version control
- A **GitHub** account (for Oz agent and Vercel deployment)
- A **Vercel** account (optional, for production hosting)

## Step 1: Clone the Repository

```bash
git clone https://github.com/<your-org>/AI-news-aggregator.git
cd AI-news-aggregator
```

## Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `feedparser` — RSS/Atom feed parsing
- `requests` — HTTP client for Twitter API and blog scraping
- `beautifulsoup4` — HTML parsing for company blogs
- `google-api-python-client` — YouTube Data API v3 client

You can optionally use a virtual environment:

```bash
python -m venv venv
source venv/bin/activate   # Linux/macOS
# venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

## Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Step 4: Configure API Credentials

The aggregation script supports two optional API keys. RSS feeds work without any credentials.

### Getting a Twitter/X Bearer Token

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2. Sign in with your Twitter/X account.
3. Create a new **Project** and **App** (or use an existing one).
4. Navigate to your app's **Keys and tokens** page.
5. Under **Bearer Token**, click **Generate** (or **Regenerate** if one already exists).
6. Copy the token.

Set it as an environment variable:

```bash
export TWITTER_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAAx..."
```

> **Note:** The free tier of the Twitter API v2 provides limited access. If you hit rate limits, the script will log errors for affected accounts and continue with other sources.

### Getting a YouTube Data API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services > Library**.
4. Search for **YouTube Data API v3** and click **Enable**.
5. Go to **APIs & Services > Credentials**.
6. Click **Create Credentials > API key**.
7. Copy the API key.

Optionally restrict the key:
- Under **Application restrictions**, select **None** (or restrict by IP/referrer as needed).
- Under **API restrictions**, select **Restrict key** and choose **YouTube Data API v3**.

Set it as an environment variable:

```bash
export YOUTUBE_API_KEY="AIzaSy..."
```

> **Note:** The YouTube Data API has a daily quota of 10,000 units. Each `search.list` call costs 100 units. With 4 channels and 5 results each, a single aggregation run uses ~400 units.

## Step 5: Run the Aggregation Script

```bash
python scripts/aggregate_news.py
```

Expected output:

```
🚀 Starting AI News Aggregation...

📰 Fetching RSS feeds...
✓ Fetched: Why AI startups are selling the same equity at tw... from TechCrunch AI
✓ Fetched: Alibaba's Qwen tech lead steps down after major ... from TechCrunch AI
...

𝕏 Fetching Twitter/X posts...
✓ Fetched tweet from @OpenAI
...

🎥 Fetching YouTube videos...
✓ Fetched video: ... from Two Minute Papers
...

🏢 Fetching company blogs...
⚠ Company blog scraping requires specific implementations per site.

🔄 Deduplicating articles...

✅ Successfully aggregated 42 articles
📁 Output written to: /path/to/data/news.json
```

If `TWITTER_BEARER_TOKEN` or `YOUTUBE_API_KEY` is not set, the script prints a warning and skips that source.

## Step 6: Start the Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page fetches `data/news.json` via the `/api/news` endpoint and renders the news grid.

## Creating Oz Secrets

When running the aggregation via the Oz scheduled agent, API keys must be stored as Oz secrets so they are injected into the agent's environment securely.

### Via the Warp CLI

```bash
# Store Twitter Bearer Token
warp oz secrets set TWITTER_BEARER_TOKEN

# Store YouTube API Key
warp oz secrets set YOUTUBE_API_KEY
```

You will be prompted to enter the secret value interactively.

### Via the Warp Desktop App

1. Open Warp and go to **Settings > Oz > Secrets**.
2. Click **Add Secret**.
3. Enter `TWITTER_BEARER_TOKEN` as the name and paste the token value.
4. Repeat for `YOUTUBE_API_KEY`.

Secrets are encrypted at rest and injected as environment variables when the agent runs.

## Configuring the Oz Scheduled Agent

1. Open the Warp desktop app.
2. Navigate to **Oz Agents** and click **Create Agent**.
3. Configure the agent:
   - **Name**: `AI News Aggregator - Daily Update`
   - **Repository**: select your `AI-news-aggregator` repo
   - **Branch**: `main`
   - **Schedule**: `0 9 * * *` (daily at 9:00 AM UTC)
   - **Secrets**: attach `TWITTER_BEARER_TOKEN` and `YOUTUBE_API_KEY`
4. Set the **Task prompt** to something like:

   > Install Python dependencies with `pip install -r requirements.txt`. Run `python scripts/aggregate_news.py` to fetch the latest AI news. Then commit and push the updated `data/news.json` to the main branch.

5. Save and enable the agent.

The agent will run every day at 9 AM UTC, update the news data, and push to `main` — which triggers a Vercel redeploy.

## Troubleshooting

### "Twitter Bearer Token not found" warning

The `TWITTER_BEARER_TOKEN` environment variable is not set. Export it in your shell or add it to a `.env` file (the script reads directly from `os.environ`, so you need to export it or use a wrapper like `dotenv`).

### Twitter API returns 401 or 403

- Verify your Bearer Token is correct and hasn't been revoked.
- Check that your Twitter Developer App has the required access level (at minimum, **Read** access for the v2 tweets endpoint).
- The free tier has strict rate limits — wait and retry if you hit `429 Too Many Requests`.

### YouTube API returns 403 (quota exceeded)

- The YouTube Data API v3 has a daily quota of 10,000 units. Each search costs 100 units.
- Check your quota usage at **Google Cloud Console > APIs & Services > YouTube Data API v3 > Quotas**.
- Quota resets at midnight Pacific Time.

### "YouTube API Key not found" warning

The `YOUTUBE_API_KEY` environment variable is not set. See [Getting a YouTube Data API Key](#getting-a-youtube-data-api-key) above.

### RSS feeds return empty results

- Check your internet connection.
- Some RSS feeds may be temporarily down or have changed their URL structure.
- The `feedparser` library handles most feed formats, but malformed feeds will be skipped with an error message.

### Frontend shows "Failed to load news data"

- Make sure `data/news.json` exists and contains valid JSON. Run the aggregation script first.
- If running the frontend from a different working directory, the relative path `../data/news.json` may not resolve correctly. Run `npm run dev` from inside the `frontend/` directory.

### `npm run dev` fails with module errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Python import errors

Make sure you installed dependencies in the correct environment:

```bash
pip install -r requirements.txt
python -c "import feedparser; import requests; import bs4; print('All imports OK')"
```

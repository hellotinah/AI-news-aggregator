# AI News Aggregator

A microsite that aggregates AI news from multiple sources including X/Twitter, major news outlets, and AI company blogs. Automatically updated daily via a scheduled Oz agent.

## Features

- 📰 Aggregates AI news from multiple sources
- 🔄 Automatic daily updates via Oz scheduled agent
- 🎨 Modern, responsive UI built with Next.js and Tailwind CSS
- 🌓 Dark mode support
- 🔍 Filter by news source

## Sources

- **Social Media**: X/Twitter posts from key AI accounts
- **News Outlets**: TechCrunch AI, The Verge AI, MIT Technology Review, VentureBeat
- **AI Companies**: OpenAI, Anthropic, Google DeepMind, Meta AI blogs

## Project Structure

```
AI_microservice/
├── frontend/              # Next.js web application
├── scripts/               # News aggregation scripts
│   └── aggregate_news.py
├── data/                  # Aggregated news data
│   └── news.json
├── requirements.txt       # Python dependencies
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Twitter Developer API access (Bearer Token)
- GitHub account
- Vercel account (for deployment)

### Local Development

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables:
   ```bash
   export TWITTER_BEARER_TOKEN="your_token_here"
   ```

4. Run news aggregation:
   ```bash
   python scripts/aggregate_news.py
   ```

5. Start the development server:
   ```bash
   cd frontend
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

The site is automatically deployed to Vercel on every push to the main branch. The Oz scheduled agent runs daily at 9 AM UTC to update the news data.

## License

MIT

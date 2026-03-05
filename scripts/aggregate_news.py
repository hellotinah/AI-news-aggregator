#!/usr/bin/env python3
"""
AI News Aggregator Script
Fetches news from X/Twitter, RSS feeds, and AI company blogs
"""

import json
import hashlib
import os
from datetime import datetime
from typing import List, Dict
import feedparser
import requests
from bs4 import BeautifulSoup
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'news.json')
MAX_ARTICLES = 100

# RSS Feed URLs
RSS_FEEDS = {
    'TechCrunch AI': 'https://techcrunch.com/category/artificial-intelligence/feed/',
    'The Verge AI': 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    'VentureBeat AI': 'https://venturebeat.com/category/ai/feed/',
}

# AI Company Blog URLs
COMPANY_BLOGS = {
    'OpenAI': 'https://openai.com/news/',
    'Anthropic': 'https://www.anthropic.com/news',
    'Google DeepMind': 'https://deepmind.google/discover/blog/',
    'Meta AI': 'https://ai.meta.com/blog/',
}

# Twitter/X Configuration
TWITTER_BEARER_TOKEN = os.environ.get('TWITTER_BEARER_TOKEN', '')
TWITTER_ACCOUNTS = [
    'OpenAI',
    'AnthropicAI',
    'GoogleDeepMind',
    'MetaAI',
    'ylecun',
    'AndrewYNg',
]

YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', '')
YOUTUBE_CHANNELS = {
    'Two Minute Papers': 'UCbfYPyITQ-7l4upoX8nvctg',
    'Yannic Kilcher': 'UCZHmQk67mSJgfCCTn7xBfew',
    'AI Explained': 'UCNJ1Ymd5yFuUPtn21xtRbbw',
    'Matthew Berman': 'UCkYzO2xQwbLxUjQqMxlVTCw',
}


def generate_id(url):
    """Generate a unique ID from URL"""
    return hashlib.md5(url.encode()).hexdigest()[:16]


def fetch_rss_news() -> List[Dict]:
    """Fetch news from RSS feeds"""
    articles = []
    
    for source_name, feed_url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:10]:  # Get latest 10 from each source
                article = {
                    'id': generate_id(entry.link),
                    'title': entry.title,
                    'summary': entry.get('summary', entry.get('description', ''))[:300],
                    'url': entry.link,
                    'source': 'news',
                    'source_name': source_name,
                    'published_date': datetime(*entry.published_parsed[:6]).isoformat() if hasattr(entry, 'published_parsed') else datetime.now().isoformat(),
                    'author': entry.get('author', None),
                }
                articles.append(article)
                print(f"✓ Fetched: {article['title'][:60]}... from {source_name}")
        except Exception as e:
            print(f"✗ Error fetching {source_name}: {str(e)}")
    
    return articles


def fetch_twitter_news() -> List[Dict]:
    """Fetch AI-related tweets from key accounts"""
    articles = []
    
    if not TWITTER_BEARER_TOKEN:
        print("⚠ Twitter Bearer Token not found. Skipping Twitter/X posts.")
        return articles
    
    headers = {
        'Authorization': f'Bearer {TWITTER_BEARER_TOKEN}',
    }
    
    for username in TWITTER_ACCOUNTS:
        try:
            # Get user ID
            user_url = f'https://api.twitter.com/2/users/by/username/{username}'
            user_response = requests.get(user_url, headers=headers)
            
            if user_response.status_code != 200:
                print(f"✗ Error fetching Twitter user {username}: {user_response.status_code}")
                continue
                
            user_id = user_response.json()['data']['id']
            
            # Get recent tweets
            tweets_url = f'https://api.twitter.com/2/users/{user_id}/tweets'
            params = {
                'max_results': 5,
                'tweet.fields': 'created_at,text,author_id',
            }
            tweets_response = requests.get(tweets_url, headers=headers, params=params)
            
            if tweets_response.status_code != 200:
                print(f"✗ Error fetching tweets for {username}: {tweets_response.status_code}")
                continue
            
            tweets = tweets_response.json().get('data', [])
            
            for tweet in tweets:
                tweet_url = f"https://twitter.com/{username}/status/{tweet['id']}"
                article = {
                    'id': generate_id(tweet_url),
                    'title': tweet['text'][:100] + ('...' if len(tweet['text']) > 100 else ''),
                    'summary': tweet['text'][:300],
                    'url': tweet_url,
                    'source': 'twitter',
                    'source_name': f'@{username}',
                    'published_date': tweet['created_at'],
                    'author': f'@{username}',
                }
                articles.append(article)
                print(f"✓ Fetched tweet from @{username}")
                
        except Exception as e:
            print(f"✗ Error fetching tweets from @{username}: {str(e)}")
    
    return articles


def fetch_youtube_videos() -> List[Dict]:
    articles = []
    if not YOUTUBE_API_KEY:
        print("⚠ YouTube API Key not found. Skipping YouTube videos.")
        return articles
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        for channel_name, channel_id in YOUTUBE_CHANNELS.items():
            try:
                request = youtube.search().list(part='snippet', channelId=channel_id, maxResults=5, order='date', type='video')
                response = request.execute()
                for item in response.get('items', []):
                    video_id = item['id']['videoId']
                    snippet = item['snippet']
                    article = {
                        'id': generate_id(f"https://youtube.com/watch?v={video_id}"),
                        'title': snippet['title'],
                        'summary': snippet['description'][:300] if snippet['description'] else snippet['title'],
                        'url': f"https://youtube.com/watch?v={video_id}",
                        'source': 'news',
                        'source_name': f"YouTube - {channel_name}",
                        'published_date': snippet['publishedAt'],
                        'author': channel_name,
                    }
                    articles.append(article)
                    print(f"✓ Fetched video: {article['title'][:60]}... from {channel_name}")
            except HttpError as e:
                print(f"✗ Error fetching YouTube videos from {channel_name}: {str(e)}")
    except Exception as e:
        print(f"✗ Error initializing YouTube API: {str(e)}")
    return articles


def fetch_company_blogs() -> List[Dict]:
    """Fetch latest posts from AI company blogs"""
    articles = []
    
    # Note: This is a simplified version. In production, you'd want to implement
    # proper scrapers for each company's blog with their specific HTML structure.
    # For now, we'll create placeholder logic that can be enhanced later.
    
    print("⚠ Company blog scraping requires specific implementations per site.")
    print("  This is a placeholder that should be enhanced with actual scraping logic.")
    
    # Example placeholder for OpenAI (would need actual implementation)
    # You would need to inspect each blog's HTML structure and parse accordingly
    
    return articles


def deduplicate_articles(articles: List[Dict]) -> List[Dict]:
    """Remove duplicate articles based on URL"""
    seen_urls = set()
    unique_articles = []
    
    for article in articles:
        if article['url'] not in seen_urls:
            seen_urls.add(article['url'])
            unique_articles.append(article)
    
    return unique_articles


def main():
    """Main function to aggregate all news"""
    print("🚀 Starting AI News Aggregation...\n")
    
    all_articles = []
    
    # Fetch from all sources
    print("📰 Fetching RSS feeds...")
    all_articles.extend(fetch_rss_news())
    print()
    
    print("𝕏 Fetching Twitter/X posts...")
    all_articles.extend(fetch_twitter_news())
    print()
    
    print("🎥 Fetching YouTube videos...")
    all_articles.extend(fetch_youtube_videos())
    print()

    print("🏢 Fetching company blogs...")
    all_articles.extend(fetch_company_blogs())
    print()
    
    # Deduplicate
    print("🔄 Deduplicating articles...")
    unique_articles = deduplicate_articles(all_articles)
    
    # Sort by date (newest first)
    unique_articles.sort(key=lambda x: x['published_date'], reverse=True)
    
    # Limit to max articles
    unique_articles = unique_articles[:MAX_ARTICLES]
    
    # Create output data
    output_data = {
        'last_updated': datetime.now().isoformat(),
        'articles': unique_articles,
    }
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Write to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Successfully aggregated {len(unique_articles)} articles")
    print(f"📁 Output written to: {OUTPUT_FILE}")


if __name__ == '__main__':
    main()

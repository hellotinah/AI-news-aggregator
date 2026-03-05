"""Tests for aggregate_news.py"""

import os
import hashlib
import pytest

# Ensure API keys are unset so fetch functions exercise the early-return path
os.environ.pop("TWITTER_BEARER_TOKEN", None)
os.environ.pop("YOUTUBE_API_KEY", None)

from aggregate_news import generate_id, deduplicate_articles, fetch_twitter_news, fetch_youtube_videos


# ---------------------------------------------------------------------------
# generate_id
# ---------------------------------------------------------------------------

class TestGenerateId:
    def test_returns_hex_string(self):
        result = generate_id("https://example.com")
        assert isinstance(result, str)
        assert all(c in "0123456789abcdef" for c in result)

    def test_length_is_16(self):
        assert len(generate_id("https://example.com")) == 16

    def test_deterministic(self):
        url = "https://example.com/article"
        assert generate_id(url) == generate_id(url)

    def test_different_urls_produce_different_ids(self):
        assert generate_id("https://a.com") != generate_id("https://b.com")

    def test_matches_md5_prefix(self):
        url = "https://example.com/test"
        expected = hashlib.md5(url.encode()).hexdigest()[:16]
        assert generate_id(url) == expected


# ---------------------------------------------------------------------------
# deduplicate_articles
# ---------------------------------------------------------------------------

class TestDeduplicateArticles:
    def _article(self, url: str, title: str = "t") -> dict:
        return {"url": url, "title": title}

    def test_empty_list(self):
        assert deduplicate_articles([]) == []

    def test_no_duplicates(self):
        articles = [self._article("https://a.com"), self._article("https://b.com")]
        assert deduplicate_articles(articles) == articles

    def test_removes_duplicate_urls(self):
        articles = [
            self._article("https://a.com", "first"),
            self._article("https://a.com", "duplicate"),
            self._article("https://b.com", "second"),
        ]
        result = deduplicate_articles(articles)
        assert len(result) == 2
        assert result[0]["title"] == "first"
        assert result[1]["title"] == "second"

    def test_preserves_order(self):
        articles = [self._article(f"https://{i}.com") for i in range(5)]
        result = deduplicate_articles(articles)
        assert [a["url"] for a in result] == [f"https://{i}.com" for i in range(5)]


# ---------------------------------------------------------------------------
# Safe behaviour when API keys are missing
# ---------------------------------------------------------------------------

class TestFetchTwitterNewsMissingToken:
    def test_returns_empty_list(self):
        result = fetch_twitter_news()
        assert result == []


class TestFetchYoutubeVideosMissingKey:
    def test_returns_empty_list(self):
        result = fetch_youtube_videos()
        assert result == []

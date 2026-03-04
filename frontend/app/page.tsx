'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SourceFilter from '@/components/SourceFilter';
import NewsGrid from '@/components/NewsGrid';
import { NewsData, SourceFilter as SourceFilterType } from '@/types/news';

export default function Home() {
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [activeFilter, setActiveFilter] = useState<SourceFilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        setNewsData(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading news...</p>
        </div>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Failed to load news data.</p>
        </div>
      </div>
    );
  }

  const filteredArticles = activeFilter === 'all'
    ? newsData.articles
    : newsData.articles.filter(article => article.source === activeFilter);

  const counts = {
    all: newsData.articles.length,
    twitter: newsData.articles.filter(a => a.source === 'twitter').length,
    news: newsData.articles.filter(a => a.source === 'news').length,
    company: newsData.articles.filter(a => a.source === 'company').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header lastUpdated={newsData.last_updated} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <SourceFilter 
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />
        </div>
        
        <NewsGrid articles={filteredArticles} />
      </main>
      
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            AI News Aggregator • Updated daily via Oz agent
          </p>
        </div>
      </footer>
    </div>
  );
}

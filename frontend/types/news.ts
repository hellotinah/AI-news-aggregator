export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: 'twitter' | 'news' | 'company';
  source_name: string;
  published_date: string;
  author?: string;
}

export interface NewsData {
  last_updated: string;
  articles: NewsArticle[];
}

export type SourceFilter = 'all' | 'twitter' | 'news' | 'company';

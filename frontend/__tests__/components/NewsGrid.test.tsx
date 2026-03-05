import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import NewsGrid from '@/components/NewsGrid';
import { NewsArticle } from '@/types/news';

const articles: NewsArticle[] = [
  {
    id: '1',
    title: 'Article One',
    summary: 'Summary one',
    url: 'https://example.com/1',
    source: 'news',
    source_name: 'TechCrunch AI',
    published_date: '2025-06-01T12:00:00Z',
  },
  {
    id: '2',
    title: 'Article Two',
    summary: 'Summary two',
    url: 'https://example.com/2',
    source: 'twitter',
    source_name: '@OpenAI',
    published_date: '2025-06-02T12:00:00Z',
  },
];

afterEach(cleanup);

describe('NewsGrid', () => {
  it('renders all provided articles', () => {
    render(<NewsGrid articles={articles} />);
    expect(screen.getByText('Article One')).toBeInTheDocument();
    expect(screen.getByText('Article Two')).toBeInTheDocument();
  });

  it('shows empty-state message when no articles', () => {
    render(<NewsGrid articles={[]} />);
    expect(screen.getByText('No articles found for this filter.')).toBeInTheDocument();
  });
});

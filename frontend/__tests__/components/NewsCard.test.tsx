import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import NewsCard from '@/components/NewsCard';
import { NewsArticle } from '@/types/news';

afterEach(cleanup);

const article: NewsArticle = {
  id: 'abc123',
  title: 'GPT-5 Released',
  summary: 'OpenAI has released GPT-5 with major improvements.',
  url: 'https://example.com/gpt5',
  source: 'news',
  source_name: 'TechCrunch AI',
  published_date: '2025-06-01T12:00:00Z',
  author: 'Jane Doe',
};

describe('NewsCard', () => {
  it('renders the article title', () => {
    render(<NewsCard article={article} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('GPT-5 Released');
  });

  it('renders the article summary', () => {
    render(<NewsCard article={article} />);
    const matches = screen.getAllByText(/OpenAI has released GPT-5/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the source name badge', () => {
    render(<NewsCard article={article} />);
    const matches = screen.getAllByText(/TechCrunch AI/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the author when present', () => {
    render(<NewsCard article={article} />);
    const matches = screen.getAllByText('By Jane Doe');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render author when absent', () => {
    const noAuthor = { ...article, author: undefined };
    render(<NewsCard article={noAuthor} />);
    expect(screen.queryAllByText(/^By /).length).toBe(0);
  });

  it('links to the article URL', () => {
    render(<NewsCard article={article} />);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === 'https://example.com/gpt5')).toBe(true);
  });
});

import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import Header from '@/components/Header';

afterEach(cleanup);

describe('Header', () => {
  it('renders the site title', () => {
    render(<Header lastUpdated="2025-06-01T12:00:00Z" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AI News Aggregator');
  });

  it('renders the subtitle', () => {
    render(<Header lastUpdated="2025-06-01T12:00:00Z" />);
    const matches = screen.getAllByText('Latest AI news from across the web');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('displays the last-updated label', () => {
    render(<Header lastUpdated="2025-06-01T12:00:00Z" />);
    const matches = screen.getAllByText(/Last updated:/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});

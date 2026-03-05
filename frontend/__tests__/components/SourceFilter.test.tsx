import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SourceFilter from '@/components/SourceFilter';

afterEach(cleanup);

const counts = { all: 10, twitter: 3, news: 5, company: 2 };

describe('SourceFilter', () => {
  it('renders all four filter buttons', () => {
    render(<SourceFilter activeFilter="all" onFilterChange={() => {}} counts={counts} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);
  });

  it('renders filter labels and counts', () => {
    render(<SourceFilter activeFilter="all" onFilterChange={() => {}} counts={counts} />);
    expect(screen.getAllByText(/All Sources/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('(10)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/News Outlets/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/AI Companies/).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onFilterChange when a filter button is clicked', () => {
    const onChange = vi.fn();
    render(<SourceFilter activeFilter="all" onFilterChange={onChange} counts={counts} />);
    const newsBtn = screen.getAllByText(/News Outlets/)[0].closest('button')!;
    fireEvent.click(newsBtn);
    expect(onChange).toHaveBeenCalledWith('news');
  });

  it('highlights the active filter', () => {
    render(<SourceFilter activeFilter="twitter" onFilterChange={() => {}} counts={counts} />);
    const twitterBtn = screen.getAllByText(/X\/Twitter/)[0].closest('button')!;
    expect(twitterBtn.className).toContain('bg-blue-600');
  });
});

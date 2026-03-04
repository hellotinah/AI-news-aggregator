import { SourceFilter as SourceFilterType } from '@/types/news';

interface SourceFilterProps {
  activeFilter: SourceFilterType;
  onFilterChange: (filter: SourceFilterType) => void;
  counts: {
    all: number;
    twitter: number;
    news: number;
    company: number;
  };
}

const filters: { value: SourceFilterType; label: string; icon: string }[] = [
  { value: 'all', label: 'All Sources', icon: '🌐' },
  { value: 'twitter', label: 'X/Twitter', icon: '𝕏' },
  { value: 'news', label: 'News Outlets', icon: '📰' },
  { value: 'company', label: 'AI Companies', icon: '🏢' },
];

export default function SourceFilter({ activeFilter, onFilterChange, counts }: SourceFilterProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Filter by Source
      </h2>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeFilter === filter.value
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            {filter.icon} {filter.label}
            <span className="ml-1.5 text-xs opacity-75">
              ({counts[filter.value]})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

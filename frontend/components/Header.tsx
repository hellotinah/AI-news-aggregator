interface HeaderProps {
  lastUpdated: string;
}

export default function Header({ lastUpdated }: HeaderProps) {
  const formattedDate = new Date(lastUpdated).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI News Aggregator
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Latest AI news from across the web
            </p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Last updated:</span> {formattedDate}
          </div>
        </div>
      </div>
    </header>
  );
}

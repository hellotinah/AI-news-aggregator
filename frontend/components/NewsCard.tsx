import { NewsArticle } from '@/types/news';

interface NewsCardProps {
  article: NewsArticle;
}

const sourceColors = {
  twitter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  news: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  company: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

const sourceIcons = {
  twitter: '𝕏',
  news: '📰',
  company: '🏢',
};

export default function NewsCard({ article }: NewsCardProps) {
  const publishedDate = new Date(article.published_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColors[article.source]}`}>
              {sourceIcons[article.source]} {article.source_name}
            </span>
          </div>
          <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {publishedDate}
          </time>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          <a 
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {article.title}
          </a>
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {article.summary}
        </p>
        
        {article.author && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By {article.author}
          </p>
        )}
        
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Read more →
        </a>
      </div>
    </article>
  );
}

'use client';

import { useArticleAudio } from '@/hooks/useArticleAudio';

interface ArticleAudioControlsProps {
  text: string;
}

export default function ArticleAudioControls({ text }: ArticleAudioControlsProps) {
  const { state, error, play, pause, stop, download } = useArticleAudio(text);

  return (
    <div className="flex items-center gap-2 mt-3">
      {state === 'loading' ? (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Generating…
        </span>
      ) : state === 'playing' ? (
        <>
          <button
            onClick={pause}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 transition-colors"
            aria-label="Pause audio"
          >
            ⏸ Pause
          </button>
          <button
            onClick={stop}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
            aria-label="Stop audio"
          >
            ⏹ Stop
          </button>
        </>
      ) : (
        <>
          <button
            onClick={play}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
            aria-label={state === 'paused' ? 'Resume audio' : 'Play audio'}
          >
            ▶ {state === 'paused' ? 'Resume' : 'Listen'}
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Download audio"
          >
            ⬇ Download
          </button>
        </>
      )}
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400 ml-1">{error}</span>
      )}
    </div>
  );
}

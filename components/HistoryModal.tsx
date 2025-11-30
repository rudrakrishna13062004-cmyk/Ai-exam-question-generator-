import React from 'react';
import { HistoryItem } from '../types';
import CloseIcon from './icons/CloseIcon';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onLoad, onClear }) => {
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-50 w-full max-w-2xl max-h-[80vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 id="history-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            Generation History
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close history"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No history yet.</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Generated quizzes will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => onLoad(item)}
                    className="w-full text-left p-4 rounded-md bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.params.quantity} {item.params.subject} questions
                      </p>
                      <time className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-4">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                      </time>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 truncate">
                      Type: {item.params.question_type}, Difficulty: {item.params.difficulty}, Language: {item.params.language}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>

        {history.length > 0 && (
          <footer className="p-4 border-t border-slate-200 dark:border-slate-700 text-right flex-shrink-0">
            <button
              onClick={onClear}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-red-500"
            >
              Clear History
            </button>
          </footer>
        )}
      </div>
    </>
  );
};

export default HistoryModal;

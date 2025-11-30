import React from 'react';
import { Quiz } from '../types';
import QuestionCard from './QuestionCard';
import SpinnerIcon from './icons/SpinnerIcon';

interface QuizDisplayProps {
  loading: boolean;
  error: string | null;
  quizData: Quiz | null;
}

const QuizDisplay: React.FC<QuizDisplayProps> = ({ loading, error, quizData }) => {

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
          <SpinnerIcon className="h-12 w-12 text-sky-500"/>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Generating questions...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }

    if (quizData && quizData.quiz.length > 0) {
      return (
        <div>
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Generated Questions
              </h2>
              <span className="bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                {quizData.quiz.length} Questions
              </span>
           </div>
          <div className="space-y-6">
            {quizData.quiz.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={index} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px] bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 border-2 border-dashed border-slate-300 dark:border-slate-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Your generated questions will appear here</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fill out the form on the left and click "Generate Questions" to begin.</p>
      </div>
    );
  };

  return <div className="w-full">{renderContent()}</div>;
};

export default QuizDisplay;
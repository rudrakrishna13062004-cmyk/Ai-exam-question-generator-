import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  index: number;
}

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {children}
    </span>
);

const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
    const difficultyColors = {
        easy: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        hard: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };

    // Safeguard for question type
    const typeLabel = question.type ? question.type.replace('_', ' ') : 'Unknown Type';
    // Safeguard for difficulty color
    const difficultyClass = difficultyColors[question.difficulty as keyof typeof difficultyColors] || difficultyColors.medium;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <p className="text-lg font-bold text-sky-600 dark:text-sky-400">Question {index + 1}</p>
                <div className="flex items-center gap-x-2">
                    <Badge className={difficultyClass}>{question.difficulty || 'Medium'}</Badge>
                    <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">{typeLabel}</Badge>
                </div>
            </div>

            <p className="text-base text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap">{question.question_text}</p>

            {question.type === 'mcq' && (
                <div className="space-y-2 mb-4">
                    {question.options.map((option, i) => (
                        <div key={i} className={`p-3 rounded-md text-sm ${
                            option === question.correct_answer 
                            ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 font-semibold' 
                            : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700'
                        }`}>
                            {String.fromCharCode(65 + i)}. {option}
                        </div>
                    ))}
                </div>
            )}
            
            {question.type !== 'mcq' && (
                <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">Correct Answer:</p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1 whitespace-pre-wrap">{question.correct_answer}</p>
                </div>
            )}

            {question.explanation && (
                <div className="mt-4 p-3 rounded-md bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800">
                    <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">Explanation:</p>
                    <p className="text-sm text-sky-700 dark:text-sky-300 mt-1">{question.explanation}</p>
                </div>
            )}
            
            {question.tags && question.tags.length > 0 && (
                <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                     <div className="flex flex-wrap gap-2">
                        {question.tags.map(tag => (
                            <Badge key={tag} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">{tag}</Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
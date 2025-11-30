import React, { useState, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Question, QuizGameSetupParams, UserAnswer, QuizFormParams } from '../types';
import { generateQuestions, generateTopics } from '../services/geminiService';
import { SUBJECTS, LANGUAGES } from '../constants';
import SpinnerIcon from './icons/SpinnerIcon';

type GameState = 'setup' | 'loading' | 'playing' | 'results';

interface QuizGameProps {
    user: User | null;
    onRequireAuth: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ user, onRequireAuth }) => {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [setup, setSetup] = useState<QuizGameSetupParams>({ subject: 'Mathematics', topic: '', quantity: 5, language: 'en' });
    const [questions, setQuestions] = useState<Question[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const [topics, setTopics] = useState<string[]>([]);
    const [isGeneratingTopics, setIsGeneratingTopics] = useState<boolean>(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopics = async () => {
            if (!setup.subject || !setup.language) return;
            
            setIsGeneratingTopics(true);
            setError(null);
            setTopics([]);
            setSetup(prev => ({ ...prev, topic: '' })); // Reset topic selection

            try {
                const generatedTopics = await generateTopics(setup.subject, setup.language);
                setTopics(generatedTopics);
            } catch (err) {
                setError(err instanceof Error ? `Failed to load topics: ${err.message}` : 'Failed to load topics.');
            } finally {
                setIsGeneratingTopics(false);
            }
        };
        fetchTopics();
    }, [setup.subject, setup.language]);

    const handleSetupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setSetup(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) : value,
        }));
    };

    const handleStartQuiz = async (e: React.FormEvent) => {
        e.preventDefault();

        // Require Login
        if (!user) {
            onRequireAuth();
            return;
        }

        if (!setup.topic) {
            setError("Please select a topic to start the quiz.");
            return;
        }
        setGameState('loading');
        setError(null);

        const params: QuizFormParams = {
            subject: setup.subject,
            quantity: setup.quantity,
            language: setup.language,
            question_type: 'mcq',
            difficulty: 'medium',
            curriculum: `Topic: ${setup.topic}`,
            include_explanations: true,
        };

        try {
            const data = await generateQuestions(params);
            if (data.quiz && data.quiz.length > 0) {
                setQuestions(data.quiz);
                setCurrentQuestionIndex(0);
                setUserAnswers([]);
                setSelectedAnswer(null);
                setGameState('playing');
            } else {
                throw new Error("The generated quiz has no questions.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setGameState('setup');
        }
    };

    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer) return; // Prevent changing answer

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = answer === currentQuestion.correct_answer;
        setSelectedAnswer(answer);

        setUserAnswers(prev => [...prev, {
            questionText: currentQuestion.question_text,
            selectedAnswer: answer,
            correctAnswer: currentQuestion.correct_answer,
            isCorrect,
            explanation: currentQuestion.explanation,
            options: currentQuestion.options
        }]);

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                setGameState('results');
            }
        }, 1500); // Wait 1.5 seconds before next question or results
    };
    
    const handlePlayAgain = () => {
        setGameState('setup');
        setQuestions([]);
    };

    const score = useMemo(() => userAnswers.filter(a => a.isCorrect).length, [userAnswers]);

    // Render logic
    const renderContent = () => {
        switch(gameState) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center h-96">
                        <SpinnerIcon className="h-12 w-12 text-sky-500" />
                        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">Generating your quiz...</p>
                    </div>
                );
            
            case 'playing':
                const question = questions[currentQuestionIndex];
                return (
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-6">
                            <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                            <h2 className="mt-1 text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">{question.question_text}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.options.map(option => {
                                let buttonClass = "bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600";
                                if (selectedAnswer) {
                                    if (option === question.correct_answer) {
                                        buttonClass = "bg-green-500 text-white";
                                    } else if (option === selectedAnswer) {
                                        buttonClass = "bg-red-500 text-white";
                                    } else {
                                        buttonClass = "bg-slate-200 dark:bg-slate-600 opacity-60";
                                    }
                                }
                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleAnswerSelect(option)}
                                        disabled={!!selectedAnswer}
                                        className={`p-4 rounded-lg text-left w-full transition-all duration-300 font-medium ${buttonClass}`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'results':
                return (
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-200">Quiz Complete!</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">You scored</p>
                        <p className="text-6xl font-bold my-4 text-sky-600 dark:text-sky-400">{score} / {questions.length}</p>
                        <button onClick={handlePlayAgain} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors">Play Again</button>
                    
                        <div className="mt-10 text-left">
                            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Review Your Answers</h3>
                            <div className="space-y-6">
                            {userAnswers.map((answer, index) => (
                                <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{index + 1}. {answer.questionText}</p>
                                    <p className={`mt-2 text-sm p-2 rounded ${answer.isCorrect ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>
                                        Your answer: {answer.selectedAnswer} {answer.isCorrect ? '✔' : '✘'}
                                    </p>
                                    {!answer.isCorrect && <p className="mt-1 text-sm p-2 rounded bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">Correct answer: {answer.correctAnswer}</p>}
                                    {answer.explanation && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 border-t dark:border-slate-700 pt-2">Explanation: {answer.explanation}</p>}
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                );
            
            case 'setup':
            default:
                const commonSelectClass = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md";
                return (
                    <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">Quiz Setup</h2>
                        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                        <form onSubmit={handleStartQuiz} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</label>
                                <select name="language" value={setup.language} onChange={handleSetupChange} className={commonSelectClass}>
                                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                                <select name="subject" value={setup.subject} onChange={handleSetupChange} className={commonSelectClass}>
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                                <select name="topic" value={setup.topic} onChange={handleSetupChange} className={commonSelectClass} disabled={isGeneratingTopics || topics.length === 0}>
                                    <option value="" disabled>
                                        {isGeneratingTopics ? 'Loading topics...' : (topics.length === 0 ? 'Select a subject first' : 'Select a topic')}
                                    </option>
                                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {isGeneratingTopics && <SpinnerIcon className="h-5 w-5 text-sky-500 absolute right-3 top-9" />}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Questions</label>
                                <input type="number" name="quantity" value={setup.quantity} onChange={handleSetupChange} min="1" max="20" required className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                            </div>
                            <button type="submit" disabled={isGeneratingTopics || !setup.topic} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                                {user ? 'Start Quiz' : 'Log in to Start'}
                            </button>
                        </form>
                    </div>
                );
        }
    }

    return <div>{renderContent()}</div>;
};

export default QuizGame;
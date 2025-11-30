
export interface Question {
  id: string;
  subject: string;
  language: 'en' | 'hi';
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  tags: string[];
  estimated_time_seconds: number;
  metadata: {
    curriculum: string | null;
    created_by: string;
    version: string;
  };
}

export interface Quiz {
  quiz: Question[];
}

export interface QuizFormParams {
  subject: string;
  language: string;
  quantity: number;
  question_type: string;
  difficulty: string;
  curriculum: string;
  include_explanations: boolean;
}

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CustomTool {
  id: string;
  name: string;
}

export interface QuizGameSetupParams {
  subject: string;
  topic: string;
  quantity: number;
  language: string;
}

export interface UserAnswer {
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    options: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  params: QuizFormParams;
  quiz: Quiz;
}

export interface ActivityLog {
    id: string;
    userId: string;
    userEmail: string;
    timestamp: string;
    action: string;
    details: string;
}
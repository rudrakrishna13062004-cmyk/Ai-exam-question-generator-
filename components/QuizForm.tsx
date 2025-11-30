
import React from 'react';
import { QuizFormParams } from '../types';
import { SUBJECTS, LANGUAGES, QUESTION_TYPES, DIFFICULTY_LEVELS } from '../constants';
import SpinnerIcon from './icons/SpinnerIcon';

interface QuizFormProps {
  formState: QuizFormParams;
  loading: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    {children}
  </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md ${props.className || ''}`} />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${props.className || ''}`} />
);

const QuizForm: React.FC<QuizFormProps> = ({ formState, loading, onFormChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg space-y-6 sticky top-8">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Generation Parameters</h2>
      
      <FormField label="Subject">
        <Select name="subject" value={formState.subject} onChange={onFormChange}>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </FormField>

      <FormField label="Language">
        <Select name="language" value={formState.language} onChange={onFormChange}>
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </Select>
      </FormField>

      <FormField label="Number of Questions">
        <Input type="number" name="quantity" value={formState.quantity} onChange={onFormChange} min="1" max="200" required />
      </FormField>

      <FormField label="Question Type">
        <Select name="question_type" value={formState.question_type} onChange={onFormChange}>
          {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </FormField>

      <FormField label="Difficulty">
        <Select name="difficulty" value={formState.difficulty} onChange={onFormChange}>
          {DIFFICULTY_LEVELS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </Select>
      </FormField>

      <FormField label="Curriculum (Optional)">
        <Input type="text" name="curriculum" value={formState.curriculum} onChange={onFormChange} placeholder="e.g., CBSE Class 12" />
      </FormField>

      <div className="flex items-center">
        <input
          id="include_explanations"
          name="include_explanations"
          type="checkbox"
          checked={formState.include_explanations}
          onChange={onFormChange}
          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
        />
        <label htmlFor="include_explanations" className="ml-2 block text-sm text-slate-900 dark:text-slate-200">
          Include Explanations
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <SpinnerIcon /> : 'Generate Questions'}
      </button>
    </form>
  );
};

export default QuizForm;

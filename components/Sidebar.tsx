import React, { useState } from 'react';
import { CustomTool } from '../types';
import CloseIcon from './icons/CloseIcon';
import ChatIcon from './icons/ChatIcon';
import PlusIcon from './icons/PlusIcon';
import ToolIcon from './icons/ToolIcon';
import QuizGameIcon from './icons/QuizGameIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTool: string;
  onToolSelect: (toolId: string) => void;
  customTools: CustomTool[];
  onAddTool: (toolName: string) => void;
  isAdmin: boolean;
}

const NavLink: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center px-3 py-2 rounded-md font-medium text-sm transition-colors ${
        isActive
          ? 'bg-sky-100 dark:bg-sky-900/50 text-slate-900 dark:text-white'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      {label}
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTool, onToolSelect, customTools, onAddTool, isAdmin }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newToolName, setNewToolName] = useState('');

  const handleAddToolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newToolName.trim()) {
      onAddTool(newToolName.trim());
      setNewToolName('');
      setIsAdding(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id="sidebar-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            Tools
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close sidebar"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <NavLink
              label="Exam Question Generator"
              isActive={activeTool === 'examGenerator'}
              onClick={() => onToolSelect('examGenerator')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </NavLink>
            <NavLink
              label="Gemini Chat"
              isActive={activeTool === 'geminiChat'}
              onClick={() => onToolSelect('geminiChat')}
            >
              <ChatIcon className="h-5 w-5 mr-3 text-slate-500" />
            </NavLink>
             <NavLink
              label="Quiz Game"
              isActive={activeTool === 'quizGame'}
              onClick={() => onToolSelect('quizGame')}
            >
              <QuizGameIcon className="h-5 w-5 mr-3 text-slate-500" />
            </NavLink>
            
            {isAdmin && (
                <NavLink
                label="Admin Dashboard"
                isActive={activeTool === 'adminDashboard'}
                onClick={() => onToolSelect('adminDashboard')}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                </NavLink>
            )}

            {customTools.map(tool => (
              <NavLink
                key={tool.id}
                label={tool.name}
                isActive={activeTool === tool.id}
                onClick={() => onToolSelect(tool.id)}
              >
                <ToolIcon className="h-5 w-5 mr-3 text-slate-500" />
              </NavLink>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          {isAdding ? (
            <form onSubmit={handleAddToolSubmit}>
              <input
                type="text"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
                placeholder="New tool name..."
                className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-sm rounded-md text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500">Cancel</button>
                <button type="submit" className="px-3 py-1 text-sm rounded-md text-white bg-sky-600 hover:bg-sky-700">Save</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center px-3 py-2 rounded-md font-medium text-sm transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Tool
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
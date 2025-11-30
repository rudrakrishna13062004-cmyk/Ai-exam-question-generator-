
import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { COLOR_THEMES } from '../constants';

interface ProfileMenuProps {
  user: User;
  isAdmin: boolean;
  onSignOut: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentTheme: string;
  onThemeChange: (themeKey: string) => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
  user, 
  isAdmin, 
  onSignOut, 
  darkMode, 
  toggleDarkMode,
  currentTheme,
  onThemeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const themes = Object.entries(COLOR_THEMES);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 focus:outline-none`}
        aria-label="User menu"
      >
         <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email?.split('@')[0]}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isAdmin ? 'Admin' : 'User'}</p>
          </div>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border transition-shadow hover:shadow-md ${isAdmin ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200' : 'bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'}`}>
              {user.email?.[0].toUpperCase()}
          </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{isAdmin ? 'Administrator Access' : 'Standard Account'}</p>
          </div>

          {/* Dark Mode Toggle */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
             <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Appearance</span>
               <button 
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Dark Mode"
               >
                 {darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                    </svg>
                 )}
               </button>
             </div>
             <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Theme Color</div>
             <div className="grid grid-cols-5 gap-2">
                {themes.map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => onThemeChange(key)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${currentTheme === key ? 'border-slate-900 dark:border-white ring-1 ring-offset-1 ring-slate-400' : 'border-transparent'}`}
                    style={{ backgroundColor: theme.colors[500] }}
                    title={theme.label}
                    aria-label={`Select ${theme.label} theme`}
                  />
                ))}
             </div>
          </div>

          {/* Sign Out */}
          <div className="p-2">
            <button
              onClick={() => { setIsOpen(false); onSignOut(); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

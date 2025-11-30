
import React, { useState, useCallback, useEffect } from 'react';
import { Quiz, QuizFormParams, CustomTool, HistoryItem, ActivityLog } from './types';
import { generateQuestions } from './services/geminiService';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { ref, push, set, onValue, off, get } from 'firebase/database';
import QuizForm from './components/QuizForm';
import QuizDisplay from './components/QuizDisplay';
import Sidebar from './components/Sidebar';
import MenuIcon from './components/icons/MenuIcon';
import GeminiChat from './components/GeminiChat';
import PlaceholderTool from './components/PlaceholderTool';
import QuizGame from './components/QuizGame';
import HistoryIcon from './components/icons/HistoryIcon';
import HistoryModal from './components/HistoryModal';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import ProfileMenu from './components/ProfileMenu';
import { COLOR_THEMES } from './constants';

const ADMIN_EMAIL = "kishankumar578990@gmail.com";

function App() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Appearance State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false; // Default to light mode
  });
  
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('themeColor') || 'sky';
  });

  // Derived Admin State
  const isAdmin = user?.email === ADMIN_EMAIL;

  // State for Exam Generator
  const [formState, setFormState] = useState<QuizFormParams>({
    subject: 'Mathematics',
    language: 'en',
    quantity: 5,
    question_type: 'mcq',
    difficulty: 'medium',
    curriculum: 'CBSE Class 10',
    include_explanations: true,
  });
  
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // App structure state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState('examGenerator');
  const [customTools, setCustomTools] = useState<CustomTool[]>([]);
  
  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setHistoryOpen] = useState(false);

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Apply Color Theme (Style Injection)
  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
    
    // Get the selected color palette
    const theme = COLOR_THEMES[themeColor as keyof typeof COLOR_THEMES];
    if (!theme) return;

    // Create dynamic CSS rules to override 'sky' classes
    // We are hijacking the 'sky' classes used throughout the app and replacing them 
    // with the selected theme colors. This avoids rewriting every component.
    const styleId = 'dynamic-theme-styles';
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    // Generate CSS overrides for text, bg, border, ring, etc.
    // Targeting common tailwind classes used in the app.
    let cssRules = '';
    const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    
    shades.forEach(shade => {
      const colorHex = theme.colors[shade as keyof typeof theme.colors];
      
      // Backgrounds
      cssRules += `.bg-sky-${shade} { background-color: ${colorHex} !important; }`;
      cssRules += `.hover\\:bg-sky-${shade}:hover { background-color: ${colorHex} !important; }`;
      cssRules += `.dark\\:bg-sky-${shade}:where(.dark *) { background-color: ${colorHex} !important; }`;
      
      // Text
      cssRules += `.text-sky-${shade} { color: ${colorHex} !important; }`;
      cssRules += `.dark\\:text-sky-${shade}:where(.dark *) { color: ${colorHex} !important; }`;
      cssRules += `.hover\\:text-sky-${shade}:hover { color: ${colorHex} !important; }`;
      
      // Borders
      cssRules += `.border-sky-${shade} { border-color: ${colorHex} !important; }`;
      cssRules += `.dark\\:border-sky-${shade}:where(.dark *) { border-color: ${colorHex} !important; }`;
      
      // Rings (Focus rings)
      cssRules += `.focus\\:ring-sky-${shade}:focus { --tw-ring-color: ${colorHex} !important; }`;
      cssRules += `.ring-sky-${shade} { --tw-ring-color: ${colorHex} !important; }`;
    });

    styleTag.textContent = cssRules;

  }, [themeColor]);

  // Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // Load history based on auth state
      if (currentUser) {
          // Sync from Firebase
          const userHistoryRef = ref(db, `users/${currentUser.uid}/history`);
          onValue(userHistoryRef, (snapshot) => {
              if (snapshot.exists()) {
                  const data = snapshot.val();
                  // Firebase stores as object with push keys, convert to array and reverse (newest first)
                  const historyList = Object.values(data) as HistoryItem[];
                  historyList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                  setHistory(historyList);
              } else {
                  setHistory([]);
              }
          });
      } else {
          // Sync from LocalStorage
          try {
            const savedHistory = localStorage.getItem('quizHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            } else {
                setHistory([]);
            }
          } catch (e) {
            console.error("Failed to load history from localStorage", e);
          }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormState(prevState => ({ ...prevState, [name]: checked }));
    } else {
      setFormState(prevState => ({ ...prevState, [name]: type === 'number' ? parseInt(value, 10) : value }));
    }
  }, []);

  const handleAddTool = (toolName: string) => {
    const newTool: CustomTool = { id: `custom-${Date.now()}`, name: toolName };
    setCustomTools(prev => [...prev, newTool]);
    setActiveTool(newTool.id);
    setSidebarOpen(false);
  };
  
  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    setSidebarOpen(false);
  }

  const logActivity = (action: string, details: string) => {
      if (user) {
          const logRef = push(ref(db, 'global_activity'));
          const log: ActivityLog = {
              id: logRef.key!,
              userId: user.uid,
              userEmail: user.email || 'Anonymous',
              timestamp: new Date().toISOString(),
              action,
              details
          };
          set(logRef, log);
      }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setAuthModalOpen(true);
        return;
    }

    setLoading(true);
    setError(null);
    setQuizData(null);
    
    try {
      const data = await generateQuestions(formState);
      setQuizData(data);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        params: formState,
        quiz: data,
      };

      // Save to Firebase
      const historyRef = push(ref(db, `users/${user.uid}/history`));
      set(historyRef, newHistoryItem);
      
      // Log for Admin Dashboard
      logActivity('GENERATE_QUIZ', `${formState.quantity} ${formState.subject} questions (${formState.difficulty})`);

    } catch (err) {
      let friendlyErrorMessage = "An unexpected error occurred. Please try again later.";
      if (err instanceof Error) {
        if (err.message.includes("Failed to parse") || err.message.includes("Invalid JSON structure")) {
          friendlyErrorMessage = "The AI's response was not in the expected format. This can happen with very specific or complex requests. Please try simplifying your request or generating again.";
        } else if (err.message.includes("API_KEY")) {
          friendlyErrorMessage = "The application is not configured correctly. An API key is required to generate questions.";
        } else if (err.message.toLowerCase().includes("network") || err.message.toLowerCase().includes("failed to fetch")) {
            friendlyErrorMessage = "A network error occurred. Please check your internet connection and try again.";
        } else {
            friendlyErrorMessage = "An error occurred while generating questions. The AI may be experiencing high traffic or the request may have been blocked. Please try again shortly.";
            console.error("Unhandled Gemini API error:", err);
        }
      }
      setError(friendlyErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [formState, user]);

  const loadFromHistory = (item: HistoryItem) => {
    setFormState(item.params);
    setQuizData(item.quiz);
    setHistoryOpen(false);
    setActiveTool('examGenerator');
  };
  
  const clearHistory = () => {
    if (user) {
        set(ref(db, `users/${user.uid}/history`), null);
    } else {
        setHistory([]);
        localStorage.removeItem('quizHistory');
    }
  };

  const handleSignOut = () => {
      signOut(auth);
      setQuizData(null);
      // If user was on admin dashboard, redirect them
      if (activeTool === 'adminDashboard') {
        setActiveTool('examGenerator');
      }
  };

  const handleRequireAuth = () => {
      setAuthModalOpen(true);
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'examGenerator':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
               {/* Show login prompt if not logged in */}
               {!user ? (
                   <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg mb-6 text-center">
                       <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Login Required</h3>
                       <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">Please log in to generate quizzes and save your history.</p>
                       <button 
                         onClick={() => setAuthModalOpen(true)}
                         className="w-full py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                       >
                           Login / Sign Up
                       </button>
                   </div>
               ) : (
                  <QuizForm formState={formState} loading={loading} onFormChange={handleFormChange} onSubmit={handleSubmit} />
               )}
            </div>
            <div className="lg:col-span-2">
              <QuizDisplay loading={loading} error={error} quizData={quizData} />
            </div>
          </div>
        );
      case 'geminiChat':
        return <GeminiChat user={user} onRequireAuth={handleRequireAuth} />;
      case 'quizGame':
        return <QuizGame user={user} onRequireAuth={handleRequireAuth} />;
      case 'adminDashboard':
        // Protect the route in render as well
        if (!isAdmin) {
             return (
                 <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                     <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h2>
                     <p className="text-slate-600 dark:text-slate-400">You do not have permission to view this page.</p>
                     <button 
                         onClick={() => setActiveTool('examGenerator')}
                         className="mt-4 text-sky-600 hover:text-sky-700 font-medium"
                     >
                         Return to Home
                     </button>
                 </div>
             );
        }
        return <AdminDashboard />;
      default:
        const tool = customTools.find(t => t.id === activeTool);
        return <PlaceholderTool toolName={tool ? tool.name : 'Unknown Tool'} />;
    }
  };

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        activeTool={activeTool} 
        onToolSelect={handleToolSelect}
        customTools={customTools}
        onAddTool={handleAddTool}
        isAdmin={isAdmin}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onLoad={loadFromHistory}
        onClear={clearHistory}
      />
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-200">
        <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-sm sticky top-0 z-10 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="mr-4 p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  aria-label="Open sidebar"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Exam Toolkit</h1>
              </div>
              <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryOpen(true)}
                    className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="View history"
                  >
                      <HistoryIcon className="h-6 w-6" />
                  </button>

                  {/* User Profile / Login Section */}
                  {authLoading ? (
                      <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse"></div>
                  ) : user ? (
                      <ProfileMenu 
                        user={user}
                        isAdmin={isAdmin}
                        onSignOut={handleSignOut}
                        darkMode={darkMode}
                        toggleDarkMode={() => setDarkMode(!darkMode)}
                        currentTheme={themeColor}
                        onThemeChange={setThemeColor}
                      />
                  ) : (
                      <button 
                        onClick={() => setAuthModalOpen(true)}
                        className="ml-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                      >
                        Login
                      </button>
                  )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
          {renderActiveTool()}
        </main>
      </div>
    </>
  );
}

export default App;

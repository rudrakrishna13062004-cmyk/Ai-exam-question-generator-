import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { User } from 'firebase/auth';
import { ChatMessage } from '../types';
import SendIcon from './icons/SendIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface GeminiChatProps {
    user: User | null;
    onRequireAuth: () => void;
}

const GeminiChat: React.FC<GeminiChatProps> = ({ user, onRequireAuth }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!process.env.API_KEY) {
            setError("API_KEY environment variable not set. Cannot initialize chat.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chatInstance = ai.chats.create({ model: 'gemini-2.5-flash' });
        setChat(chatInstance);
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Require Login
        if (!user) {
            onRequireAuth();
            return;
        }

        if (!input.trim() || !chat || loading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const stream = await chat.sendMessageStream({ message: input });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = modelResponse;
                    return newMessages;
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to get response: ${errorMessage}`);
            setMessages(prev => prev.slice(0, -1)); // Remove the empty model message on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p className="text-lg font-medium mb-2">Start a conversation with Gemini</p>
                        <p className="text-sm">You must be logged in to chat.</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg lg:max-w-xl px-4 py-2 rounded-lg ${
                            msg.role === 'user' 
                                ? 'bg-sky-500 text-white' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                 {loading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                         <div className="max-w-lg lg:max-w-xl px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                             <SpinnerIcon className="h-5 w-5 text-slate-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {error && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-red-500 text-center">{error}</p>
                </div>
            )}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={chat ? (user ? "Ask me anything..." : "Log in to chat...") : "Initializing chat..."}
                        disabled={!chat || loading}
                        className="flex-1 w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-700 dark:text-white"
                        aria-label="Chat input"
                    />
                    <button
                        type="submit"
                        disabled={!chat || loading || !input.trim()}
                        className="p-3 rounded-full text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 dark:disabled:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                        aria-label="Send message"
                    >
                        {loading ? <SpinnerIcon className="w-5 h-5"/> : <SendIcon className="w-5 h-5"/>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GeminiChat;
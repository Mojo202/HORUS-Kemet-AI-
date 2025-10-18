import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { apiKeyManager } from '../../apiKeyManager';
import LoadingIndicator from '../LoadingIndicator';

interface ChatGptProps {
    onNavigateHome: () => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const FormattedModelResponse: React.FC<{ text: string }> = ({ text }) => {
    // This component will parse the model's text and apply rich formatting.
    const formatInline = (line: string) => {
        // Process **bold** with cyan color
        const boldParts = line.split(/\*\*(.*?)\*\*/g);
        return boldParts.map((part, i) => {
            if (i % 2 === 1) {
                return <strong key={i} className="text-cyan-400 font-bold">{part}</strong>;
            }
            return part;
        });
    };

    const parts = text.split(/```([\s\S]*?)```/g);

    return (
        <div className="prose prose-invert prose-sm max-w-none">
            {parts.map((part, index) => {
                if (index % 2 === 1) {
                    // This is a code block
                    const [lang, ...codeLines] = part.split('\n');
                    const code = codeLines.join('\n');
                    return (
                        <pre key={index} className="bg-black/50 p-3 rounded-md my-2">
                            <code className={`language-${lang.trim()}`}>{code}</code>
                        </pre>
                    );
                } else {
                    // This is regular text
                    return part.split('\n').map((line, lineIndex) => (
                        <p key={`${index}-${lineIndex}`}>{formatInline(line)}</p>
                    ));
                }
            })}
        </div>
    );
};


const ChatGpt: React.FC<ChatGptProps> = ({ onNavigateHome }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const apiKey = apiKeyManager.getActiveGeminiApiKey();
        if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            chatRef.current = ai.chats.create({ model: 'gemini-2.5-flash' });
        } else {
            setError("يرجى إضافة مفتاح Gemini API في الصفحة الرئيسية أولاً.");
        }
    }, []);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        if (!chatRef.current) {
            setError("لم يتم تهيئة الشات. يرجى التحقق من مفتاح API.");
            return;
        }

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: userMessage.text });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (e: any) {
            setError(`حدث خطأ: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <div className="flex flex-col items-center gap-4 text-center my-6">
                 <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-robot relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    استوديو شات حورس
                </h2>
            </div>

            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex-grow" style={{ height: '70vh' }}>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                {msg.role === 'model' ? <FormattedModelResponse text={msg.text} /> : msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xl p-3 rounded-lg bg-gray-700 text-gray-200">
                                <LoadingIndicator />
                            </div>
                        </div>
                    )}
                     <div ref={messagesEndRef} />
                </div>
                {error && <div className="p-3 bg-red-900/50 text-red-300 rounded-md text-sm">{error}</div>}
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="اكتب رسالتك هنا..."
                        rows={1}
                        className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 resize-none"
                    />
                    <button onClick={handleSendMessage} disabled={isLoading} className="px-6 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-600">
                        إرسال
                    </button>
                </div>
            </div>
        </>
    );
};

export default ChatGpt;

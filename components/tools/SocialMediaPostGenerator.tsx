import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ToolType } from '../../types';
import GuideSection from '../GuideSection';
import { PageBanner } from '../PageBanner';
import LoadingIndicator from '../LoadingIndicator';
import { apiKeyManager } from '../../apiKeyManager';
import { extractJsonString } from '../../utils/parser';

interface SocialMediaPostGeneratorProps {
    onNavigateHome: () => void;
    logStatus: (msg: string) => void;
    setError: (err: string | null) => void;
}

const PLATFORMS = [
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook-f' },
    { id: 'twitter', name: 'Twitter (X)', icon: 'fab fa-twitter' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin-in' },
    { id: 'telegram', name: 'Telegram', icon: 'fab fa-telegram-plane' },
    { id: 'viral', name: 'Viral/General', icon: 'fas fa-fire' },
];

type PlatformId = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'telegram' | 'viral';

const SocialMediaPostGenerator: React.FC<SocialMediaPostGeneratorProps> = ({ onNavigateHome, logStatus, setError }) => {
    const [articleText, setArticleText] = useState('');
    const [articleUrl, setArticleUrl] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PlatformId>>(new Set(['facebook', 'twitter']));
    const [generatedPosts, setGeneratedPosts] = useState<Record<string, string> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const togglePlatform = (platformId: PlatformId) => {
        const newSelection = new Set(selectedPlatforms);
        if (newSelection.has(platformId)) {
            newSelection.delete(platformId);
        } else {
            newSelection.add(platformId);
        }
        setSelectedPlatforms(newSelection);
    };

    const handleGenerate = async () => {
        if (!articleText.trim()) {
            setError("يرجى لصق نص المقال أولاً.");
            return;
        }
        if (selectedPlatforms.size === 0) {
            setError("يرجى اختيار منصة واحدة على الأقل.");
            return;
        }
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API في الصفحة الرئيسية.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedPosts(null);
        logStatus("🚀 بدء عملية إنشاء منشورات احترافية...");

        const platforms = Array.from(selectedPlatforms);
        const systemInstruction = `You are a world-class social media strategist and viral content creator. Your task is to transform a given article into compelling, professional social media posts tailored for different platforms. You MUST use Google Search to find the most relevant, trending, and high-value hashtags for the topic. Your output must be a clean, ready-to-use JSON object without any markdown or extra text. CRITICAL: The final text for each post MUST be clean and contain no markdown like asterisks (*).`;
        
        const prompt = `
            Article Text: "${articleText}"
            Article URL: "${articleUrl || 'No URL Provided'}"
            Platforms to generate for: [${platforms.join(', ')}]

            For each platform, create a post in ARABIC that is:
            1.  **Tailored:** Adheres to the platform's style (e.g., short/punchy for Twitter, professional for LinkedIn, engaging for Facebook).
            2.  **Engaging:** Starts with a strong hook (a question, a surprising fact, a bold statement).
            3.  **Viral:** Uses emojis strategically to increase visibility.
            4.  **SEO-Optimized:** Includes the most powerful and trending hashtags found via internet search related to the article's core topics. Find niche, high-traffic ones.
            5.  **Includes the Link:** The Article URL must be included if provided.
        `;

        const schemaProperties: { [key: string]: { type: Type; description: string; } } = {};
        platforms.forEach(p => {
            // FIX: Add a type assertion to resolve the 'unknown' index type error, which may be caused by a strict linter configuration.
            schemaProperties[p as string] = { type: Type.STRING, description: `The generated post for ${p}` };
        });

        try {
            const ai = new GoogleGenAI({ apiKey: apiKeyManager.getActiveGeminiApiKey()! });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    tools: [{ googleSearch: {} }],
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: schemaProperties,
                    },
                },
            });

            const jsonString = extractJsonString(response.text);
            if (!jsonString) {
                throw new Error("Failed to extract valid JSON from the model response. It might be empty or malformed.");
            }
            const data = JSON.parse(jsonString) as Record<string, string>;
            setGeneratedPosts(data);
            logStatus("✅ تم إنشاء المنشورات بنجاح!");

        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(`فشل في إنشاء المنشورات: ${errorMessage}`);
            logStatus(`❌ خطأ: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        logStatus(`تم نسخ المنشور بنجاح.`);
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="استوديو المحتوى الفيروسي" iconClass="fas fa-share-square" />
            
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Column */}
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-purple-500/30 space-y-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-300 mb-2">1. الصق محتوى المقال</label>
                            <textarea 
                                value={articleText}
                                onChange={(e) => setArticleText(e.target.value)}
                                placeholder="كلما كان النص كاملاً، كانت النتائج أفضل..." 
                                className="w-full h-40 bg-gray-900 border border-gray-600 rounded-md p-4 text-sm text-gray-200 resize-y"
                            />
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-300 mb-2">2. أضف رابط المقال (اختياري)</label>
                            <input 
                                type="url"
                                value={articleUrl}
                                onChange={(e) => setArticleUrl(e.target.value)}
                                placeholder="https://example.com/my-awesome-article" 
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 font-mono text-sm text-cyan-300"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">3. اختر المنصات المستهدفة</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {PLATFORMS.map(platform => {
                                    const isSelected = selectedPlatforms.has(platform.id as PlatformId);
                                    return (
                                         <button 
                                            key={platform.id} 
                                            onClick={() => togglePlatform(platform.id as PlatformId)}
                                            className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center justify-center gap-3 font-semibold ${isSelected ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-cyan-500/50'}`}
                                         >
                                            <i className={`${platform.icon} ${isSelected ? 'text-cyan-400' : ''}`}></i>
                                            <span>{platform.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                         <button onClick={handleGenerate} disabled={isLoading || !articleText || selectedPlatforms.size === 0} className="w-full h-14 text-xl font-bold glassy-purple-btn flex items-center justify-center gap-3">
                            {isLoading ? <LoadingIndicator /> : <>🔥 إنشاء المنشورات الفيروسية</>}
                        </button>
                    </div>

                    {/* Output Column */}
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-cyan-500/30 space-y-4">
                        <h3 className="text-xl font-bold text-center text-cyan-400">المنشورات المقترحة</h3>
                        {isLoading && <div className="flex items-center justify-center h-full"><LoadingIndicator /></div>}
                        {!isLoading && !generatedPosts && (
                            <div className="flex items-center justify-center h-full text-center text-gray-500">
                                <i className="fas fa-magic text-5xl mb-4"></i>
                                <p>ستظهر إبداعات الذكاء الاصطناعي هنا...</p>
                            </div>
                        )}
                        {generatedPosts && (
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                {Object.entries(generatedPosts).map(([platformId, text]) => {
                                     const platformInfo = PLATFORMS.find(p => p.id === platformId);
                                     return(
                                        <div key={platformId} className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="flex items-center gap-2 font-bold text-purple-400">
                                                    <i className={platformInfo?.icon}></i>
                                                    <span>{platformInfo?.name}</span>
                                                </h4>
                                                {/* FIX: Explicitly convert 'text' to a string to handle potential 'unknown' type from JSON parsing. */}
                                                <button onClick={() => handleCopy(String(text))} className="px-3 py-1 text-xs rounded-md bg-gray-700 text-white hover:bg-gray-600">نسخ</button>
                                            </div>
                                            <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm">{String(text)}</pre>
                                        </div>
                                     )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <GuideSection 
                    toolType={ToolType.SocialMediaPostGenerator} 
                />
            </div>
        </>
    );
};

export default SocialMediaPostGenerator;
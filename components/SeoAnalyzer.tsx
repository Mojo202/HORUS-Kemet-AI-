import React, { useState, useCallback } from 'react';
import { GeneratedArticle, SeoAnalysis, SeoAnalysisItem } from '../types';
import { analyzeSeo, generateHookTitle, generateSeoMetaDescription, generateSeoSlug } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';

const initialAnalysis: SeoAnalysis = {
    score: 0,
    title: { pass: false, feedback: 'لم يتم التحليل بعد.', fieldName: 'title' },
    metaDescription: { pass: false, feedback: 'لم يتم التحليل بعد.', fieldName: 'metaDescription' },
    slug: { pass: false, feedback: 'لم يتم التحليل بعد.', fieldName: 'slug' },
    keywordInIntroduction: { pass: false, feedback: 'لم يتم التحليل بعد.' },
    imageAltText: { pass: false, feedback: 'لم يتم التحليل بعد.' },
    contentReadability: { pass: false, feedback: 'لم يتم التحليل بعد.' },
    overallSuggestions: 'أدخل كلمة مفتاحية رئيسية وابدأ التحليل للحصول على اقتراحات.'
};

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    let colorClass = 'stroke-red-500';
    if (score >= 80) colorClass = 'stroke-green-500';
    else if (score >= 50) colorClass = 'stroke-yellow-500';

    return (
        <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-gray-300 dark:text-gray-600"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-1000 ${colorClass}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
            </svg>
            <span className="text-3xl font-bold text-gray-700 dark:text-gray-200">{score}</span>
        </div>
    );
};

const AnalysisItem: React.FC<{ 
    label: string; 
    result: SeoAnalysisItem | { pass: boolean; feedback: string }; 
    onApplySuggestion?: (fieldName: 'title' | 'metaDescription' | 'slug', value: string) => void;
    onRegenerate?: () => void;
    isGenerating?: boolean;
}> = ({ label, result, onApplySuggestion, onRegenerate, isGenerating }) => (
    <div className="flex flex-col gap-2 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md">
        <div className="flex items-start gap-3">
            <span className={`flex-shrink-0 text-xl ${result.pass ? 'text-green-500' : 'text-red-500'}`}>
                {result.pass ? '✅' : '❌'}
            </span>
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-300">{label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{result.feedback}</p>
            </div>
        </div>
        <div className="pl-9 mt-1 space-y-2 flex flex-wrap items-center gap-2">
            {'suggestion' in result && result.suggestion && onApplySuggestion && (
                <button
                    onClick={() => onApplySuggestion(result.fieldName, result.suggestion!)}
                    className="px-3 py-1 text-xs rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
                >
                    تطبيق الاقتراح
                </button>
            )}
            {onRegenerate && (
                <button
                    onClick={onRegenerate}
                    disabled={isGenerating}
                    className="px-3 py-1 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400"
                >
                    {isGenerating ? <div className="h-4 w-4"><LoadingIndicator /></div> : '🔄 توليد جديد'}
                </button>
            )}
        </div>
    </div>
);


const SeoAnalyzer: React.FC<{
    article: GeneratedArticle,
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    onArticleUpdate: (articleId: number, field: keyof GeneratedArticle, value: string) => void;
    selectedTextModel: string;
}> = ({ article, logStatus, setError, onArticleUpdate, selectedTextModel }) => {
    const [keyword, setKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<SeoAnalysis>(initialAnalysis);
    const [generationStates, setGenerationStates] = useState({
        title: false,
        metaDescription: false,
        slug: false,
    });
    const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(true);

    const handleAnalyze = useCallback(async () => {
        if (!keyword.trim()) {
            setError("يرجى إدخال الكلمة المفتاحية الرئيسية للتحليل.");
            return;
        }
        setIsLoading(true);
        setError(null);
        logStatus(`--- بدء تحليل السيو للكلمة المفتاحية: "${keyword}" ---`);
        try {
            const result = await analyzeSeo(article, keyword, selectedTextModel, logStatus);
            setAnalysis(result);
            logStatus(`✅ اكتمل تحليل السيو بنجاح. النتيجة: ${result.score}%`);
        } catch (e: any) {
            const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
            setError(`فشل تحليل السيو: ${friendlyMessage}`);
            logStatus(`❌ فشل تحليل السيو: ${friendlyMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [article, keyword, logStatus, setError, selectedTextModel]);

    const handleApplySuggestion = (fieldName: 'title' | 'metaDescription' | 'slug', value: string) => {
        onArticleUpdate(article.id, fieldName, value);
        logStatus(`تم تطبيق الاقتراح لـ ${fieldName}. أعد التحليل لرؤية النتيجة الجديدة.`);
    };

    const handleRegenerate = async (field: 'title' | 'metaDescription' | 'slug') => {
        setGenerationStates(prev => ({ ...prev, [field]: true }));
        setError(null);
        try {
            let newValue: string | null = null;
            const articleTextForContext = new DOMParser().parseFromString(article.html, 'text/html').body.textContent || '';
            
            switch (field) {
                case 'title':
                    newValue = await generateHookTitle(articleTextForContext, selectedTextModel, logStatus);
                    break;
                case 'metaDescription':
                    newValue = await generateSeoMetaDescription(articleTextForContext, selectedTextModel, logStatus);
                    break;
                case 'slug':
                    newValue = await generateSeoSlug(article.title, selectedTextModel, logStatus);
                    break;
            }

            if (newValue !== null) {
                onArticleUpdate(article.id, field, newValue);
                logStatus(`✅ تم توليد وتطبيق قيمة جديدة لـ ${field}.`);
                // Auto-update the suggestion in the UI for immediate feedback
                setAnalysis(prev => ({
                    ...prev,
                    [field]: { ...prev[field], suggestion: newValue }
                }));
            }
        } catch (e: any) {
            const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
            setError(`فشل توليد (${field}): ${friendlyMessage}`);
            logStatus(`❌ فشل توليد (${field}): ${friendlyMessage}`);
        } finally {
            setGenerationStates(prev => ({ ...prev, [field]: false }));
        }
    };


    return (
        <div className="p-4 space-y-6">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 text-center">تحليل وتحسين محركات البحث (SEO)</h4>
            
            <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex-grow w-full">
                    <label htmlFor={`seo-keyword-${article.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        الكلمة المفتاحية الرئيسية
                    </label>
                    <input
                        id={`seo-keyword-${article.id}`}
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="مثال: الوقاية من الإصابات الرياضية"
                        className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !keyword.trim()}
                    className="w-full md:w-auto h-10 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center self-end"
                >
                    {isLoading ? <LoadingIndicator /> : '📊 تحليل الآن'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1 flex flex-col items-center gap-4 text-center">
                     <h5 className="font-semibold text-gray-700 dark:text-gray-300">درجة السيو</h5>
                    <ScoreCircle score={analysis.score} />
                </div>
                <div className="md:col-span-2 space-y-3">
                    <AnalysisItem label="العنوان (Title)" result={analysis.title} onApplySuggestion={handleApplySuggestion} onRegenerate={() => handleRegenerate('title')} isGenerating={generationStates.title} />
                    <AnalysisItem label="الوصف التعريفي (Meta Description)" result={analysis.metaDescription} onApplySuggestion={handleApplySuggestion} onRegenerate={() => handleRegenerate('metaDescription')} isGenerating={generationStates.metaDescription} />
                    <AnalysisItem label="الرابط المخصص (Slug)" result={analysis.slug} onApplySuggestion={handleApplySuggestion} onRegenerate={() => handleRegenerate('slug')} isGenerating={generationStates.slug} />
                    <AnalysisItem label="الكلمة المفتاحية في المقدمة" result={analysis.keywordInIntroduction} />
                    <AnalysisItem label="النص البديل للصورة (Alt Text)" result={analysis.imageAltText} />
                    <AnalysisItem label="سهولة القراءة" result={analysis.contentReadability} />
                </div>
            </div>

            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <button
                    onClick={() => setIsSuggestionsExpanded(!isSuggestionsExpanded)}
                    className="w-full flex justify-between items-center p-4 text-left"
                    aria-expanded={isSuggestionsExpanded}
                >
                    <h5 className="font-bold text-yellow-800 dark:text-yellow-300">💡 اقتراحات التحسين الشاملة</h5>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 text-yellow-700 dark:text-yellow-200 transform transition-transform duration-300 ${isSuggestionsExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isSuggestionsExpanded && (
                    <div className="p-4 pt-0">
                        <p className="text-sm text-yellow-700 dark:text-yellow-200 whitespace-pre-wrap">{analysis.overallSuggestions}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeoAnalyzer;
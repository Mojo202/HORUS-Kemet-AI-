import React, { useState, useCallback, useRef } from 'react';
import { SeoAnalysisAdvanced, SeoCheck } from '../types';
import { analyzeAdvancedSeo } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';

const initialAnalysis: SeoAnalysisAdvanced = {
    overallScore: 0,
    onPageSeo: [],
    technicalSeo: [],
    adsenseCompliance: [],
    strengths: [],
    weaknesses: [],
    finalReport: 'أدخل محتوى HTML وكلمة مفتاحية رئيسية، ثم ابدأ التحليل للحصول على تقرير مفصل.'
};

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 55;
    const offset = circumference - (score / 100) * circumference;

    let color = '#ef4444'; // red-500
    if (score >= 80) color = '#10b981'; // emerald-500
    else if (score >= 50) color = '#f59e0b'; // amber-500

    return (
        <div className="relative flex flex-col items-center justify-center w-40 h-40">
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="55" cx="60" cy="60" />
                <circle
                    className="transform -rotate-90 origin-center transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    r="55"
                    cx="60"
                    cy="60"
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
            </svg>
            <span className="text-5xl font-bold text-gray-100" style={{ textShadow: `0 0 10px ${color}` }}>{score}</span>
            <span className="text-sm font-semibold text-gray-400 mt-1">/ 100</span>
        </div>
    );
};

const AnalysisCheckItem: React.FC<{ item: SeoCheck }> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="p-3 bg-purple-900/40 rounded-lg border border-purple-500/30">
            <div className="flex items-start gap-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <span className="text-xl mt-0.5">{item.pass ? '✅' : '❌'}</span>
                <div className="flex-grow">
                    <p className="font-semibold text-gray-200">{item.check}</p>
                    <p className="text-sm text-gray-400">{item.feedback}</p>
                </div>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {isExpanded && item.suggestion && (
                <div className="mt-3 pt-3 pl-10 border-t border-purple-500/20">
                    <p className="text-xs text-cyan-400 font-semibold">💡 اقتراح:</p>
                    <p className="text-sm text-gray-300">{item.suggestion}</p>
                </div>
            )}
        </div>
    );
};

const StrengthWeaknessList: React.FC<{ title: string; items: string[]; type: 'strength' | 'weakness' }> = ({ title, items, type }) => (
    <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/30 space-y-3 h-full">
        <h4 className={`text-center font-semibold text-lg ${type === 'strength' ? 'text-green-400' : 'text-red-400'}`}>{title}</h4>
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="mt-1">{type === 'strength' ? '👍' : '👎'}</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

const Accordion: React.FC<{ title: string; children: React.ReactNode; icon: string; }> = ({ title, children, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-gray-900/50 rounded-lg border border-purple-500/30">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4">
                <span className="font-semibold text-lg text-purple-400 flex items-center gap-3">{icon} {title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && <div className="p-4 pt-0 space-y-3">{children}</div>}
        </div>
    );
};


const SeoStudio: React.FC<{
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
    setWarning: (warning: string | null) => void;
    onNavigateHome: () => void;
    selectedTextModel: string;
}> = ({ logStatus, setError, setWarning, onNavigateHome, selectedTextModel }) => {
    const [keyword, setKeyword] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<SeoAnalysisAdvanced | null>(null);
    const [inputMode, setInputMode] = useState<'paste' | 'file' | 'url'>('paste');
    const [url, setUrl] = useState('');
    const [isFetchingUrl, setIsFetchingUrl] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAnalyze = useCallback(async () => {
        if (!keyword.trim() || !htmlContent.trim()) {
            setError("يرجى توفير محتوى HTML وكلمة مفتاحية رئيسية للتحليل.");
            return;
        }
        setIsLoading(true);
        setAnalysis(null);
        setError(null);
        logStatus(`--- 🚀 بدء تحليل السيو المتقدم للكلمة المفتاحية: "${keyword}" ---`);
        try {
            const result = await analyzeAdvancedSeo(htmlContent, keyword, selectedTextModel, logStatus);
            setAnalysis(result);
            logStatus(`✅ اكتمل تحليل السيو المتقدم بنجاح. النتيجة: ${result.overallScore}%`);
        } catch (e: any) {
            const friendlyMessage = e instanceof Error ? e.message : "حدث خطأ غير معروف.";
            setError(`فشل تحليل السيو: ${friendlyMessage}`);
            logStatus(`❌ فشل تحليل السيو: ${friendlyMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [htmlContent, keyword, logStatus, setError, selectedTextModel]);
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        logStatus(`جاري قراءة الملف: ${file.name}`);
        setError(null);
        try {
            const text = await file.text();
            if (file.name.endsWith('.xml')) {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "application/xml");
                const contentNode = xmlDoc.querySelector("content[type='html']");
                if (contentNode && contentNode.textContent) {
                    setHtmlContent(contentNode.textContent);
                    logStatus("✅ تم استخلاص محتوى HTML من ملف XML بنجاح.");
                } else {
                    throw new Error("لم يتم العثور على وسم <content type='html'> صالح في ملف XML.");
                }
            } else { // Handles .html, .txt
                setHtmlContent(text);
                logStatus("✅ تم تحميل محتوى الملف بنجاح.");
            }
        } catch (e: any) {
            setError(e.message);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleUrlFetch = async () => {
        if (!url.trim() || !URL.canParse(url)) {
            setError("يرجى إدخال رابط URL صالح.");
            return;
        }
        setIsFetchingUrl(true);
        setError(null);
        logStatus(`جاري جلب المحتوى من الرابط: ${url}`);
        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(url));
            if (!response.ok) throw new Error(`فشل جلب الرابط. الحالة: ${response.status} ${response.statusText}`);
            const fetchedHtml = await response.text();
            setHtmlContent(fetchedHtml);
            logStatus("✅ تم جلب محتوى الرابط بنجاح.");
        } catch (e: any) {
            setError(`فشل في جلب محتوى الرابط: ${e.message}. قد يكون الموقع محميًا أو غير متاح.`);
            logStatus(`❌ ${e.message}`);
        } finally {
            setIsFetchingUrl(false);
        }
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/30">
             <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-purple-600/30 dark:bg-purple-500/20 backdrop-blur-sm border border-purple-500/50 dark:border-purple-400/40 text-white hover:bg-purple-600/50 dark:hover:bg-purple-500/40 transition-colors z-20 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
             <div className="flex flex-col items-center gap-4 text-center mb-8">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-purple-500 pulsing-triangle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" strokeLinejoin="round" strokeWidth="3" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-chart-bar relative text-6xl text-purple-400 eye-animation" style={{ filter: 'drop-shadow(0 0 10px #a855f7)' }}></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px #a855f7' }}>
                    استوديو تحسين محركات البحث (SEO)
                </h2>
                 <p className="mt-2 text-gray-400 text-sm max-w-2xl">
                    أداة تحليل متقدمة لفحص صفحات الويب بناءً على أفضل ممارسات Google SEO وسياسات AdSense. الصق كود HTML لصفحتك للحصول على تقرير شامل ودرجة أداء.
                </p>
            </div>
            
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-purple-500/30">
                <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-300 mb-2">الكلمة المفتاحية الرئيسية</label>
                    <input id="seo-keyword-studio" type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="مثال: أفضل ممارسات السيو 2024" className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">محتوى الصفحة</label>
                    <div className="flex w-full bg-gray-900 rounded-lg p-1 border border-gray-600 mb-2">
                        {(['paste', 'file', 'url'] as const).map(mode => (
                            <button key={mode} onClick={() => setInputMode(mode)} className={`flex-1 text-sm font-semibold p-2 rounded-md transition-all duration-300 ${inputMode === mode ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                                {mode === 'paste' ? 'لصق HTML' : mode === 'file' ? 'رفع ملف' : 'تحليل رابط'}
                            </button>
                        ))}
                    </div>
                    {inputMode === 'paste' && <textarea rows={10} value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} placeholder="الصق كود HTML الكامل للصفحة هنا..." className="w-full bg-gray-900/70 border border-gray-600 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200 resize-y font-mono text-sm" />}
                    {inputMode === 'file' && <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 border-2 border-dashed border-gray-600 rounded-md text-gray-400 hover:bg-gray-700/50 hover:border-purple-500">انقر لاختيار ملف (.html, .xml, .txt)</button>}
                    {inputMode === 'url' && (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" className="flex-grow w-full bg-gray-900/70 border border-gray-600 rounded-md p-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                <button onClick={handleUrlFetch} disabled={isFetchingUrl} className="px-4 py-2 text-sm rounded-md bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center disabled:bg-cyan-500/50">{isFetchingUrl ? <LoadingIndicator /> : 'جلب المحتوى'}</button>
                            </div>
                            <p className="text-xs text-gray-500">ملاحظة: يتم استخدام خدمة وسيطة (CORS proxy) لجلب المحتوى. قد لا يعمل مع جميع المواقع.</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".html,.xml,.txt,text/html,text/xml,text/plain" />
                </div>
            </div>

            <button onClick={handleAnalyze} disabled={isLoading || !htmlContent.trim() || !keyword.trim()} className="w-full h-12 text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-purple-500/50 disabled:cursor-not-allowed">
                {isLoading ? <LoadingIndicator /> : '🚀 تحليل الآن'}
            </button>

            <div className="mt-8">
                {isLoading && <div className="flex flex-col items-center justify-center h-64 gap-6 text-center"><LoadingIndicator statusText="🧠 جاري تحليل الصفحة بعمق..." progress={0.5} /></div>}
                {analysis && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row items-center justify-around gap-8 p-6 bg-gray-900/50 rounded-lg border border-purple-500/30">
                            <ScoreGauge score={analysis.overallScore} />
                            <div className="flex-grow max-w-2xl"><h3 className="font-bold text-xl text-purple-400 mb-2">📄 التقرير النهائي</h3><p className="text-gray-300 whitespace-pre-wrap">{analysis.finalReport}</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StrengthWeaknessList title="✅ نقاط القوة" items={analysis.strengths} type="strength" />
                            <StrengthWeaknessList title="❌ نقاط الضعف" items={analysis.weaknesses} type="weakness" />
                        </div>
                        <div className="space-y-4">
                             <Accordion title="On-Page SEO" icon="📄">
                                {analysis.onPageSeo.map((item, i) => <AnalysisCheckItem key={i} item={item} />)}
                            </Accordion>
                            <Accordion title="Technical SEO" icon="⚙️">
                                {analysis.technicalSeo.map((item, i) => <AnalysisCheckItem key={i} item={item} />)}
                            </Accordion>
                            <Accordion title="AdSense Compliance" icon="💵">
                                {analysis.adsenseCompliance.map((item, i) => <AnalysisCheckItem key={i} item={item} />)}
                            </Accordion>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeoStudio;
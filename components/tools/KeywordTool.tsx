import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { apiKeyManager } from '../../apiKeyManager';
import LoadingIndicator from '../LoadingIndicator';
import { KeywordResults, Keyword, KeywordCompetition, UserIntent } from '../../types';

interface KeywordToolProps {
    onNavigateHome: () => void;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">بوصلة حورس للكلمات المفتاحية: دليلك الكامل للسيطرة على الصفحة الأولى</h3>
        
        <p>أقدم لك أداة ليست كأي أداة أخرى. هذه هي "بوصلة حورس"، سلاحك السري لكشف كنوز الكلمات المفتاحية التي يبحث عنها جمهورك بالفعل. إنها الخطوة الأولى والأهم في أي استراتيجية SEO ناجحة.</p>
        
        <div class="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> تنبيه هام جداً!</h5>
            <p class="text-sm">هذه الأداة تستخدم قوة الذكاء الاصطناعي (Gemini) لتقديم <strong>تقديرات ذكية</strong> لحجم البحث، المنافسة، وتكلفة النقرة. هذه ليست بيانات مباشرة من أدوات SEO التقليدية، بل هي تحليل استراتيجي يمنحك رؤية فريدة حول شعبية وقيمة الكلمات المفتاحية.</p>
        </div>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-map-signs text-2xl w-8 text-center"></i><span>فن استراتيجية الكلمات المفتاحية (مع استشهادات عالمية)</span></h4>
        <p>فهم الكلمات لا يكفي، يجب فهم "نية المستخدم" (User Intent) خلفها. هذا المفهوم، الذي تؤكد عليه جوجل باستمرار، يقسم عمليات البحث إلى فئات:</p>
        <ul class="!list-none !p-0 space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">معلوماتية (Informational):</strong> المستخدم يريد معرفة شيء (مثال: "ما هي فوائد الشاي الأخضر"). هذه هي فرصة لكتابة مقالات إرشادية.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">تجارية (Commercial):</strong> المستخدم يفكر في الشراء ويبحث عن مراجعات ومقارنات (مثال: "أفضل أنواع الشاي الأخضر للتخسيس"). هنا تكمن فرصة مقالات المراجعة والتسويق بالعمولة.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">شرائية (Transactional):</strong> المستخدم جاهز للشراء (مثال: "شراء شاي أخضر عضوي أونلاين").
            </li>
        </ul>
        <p>أداتنا تحدد لك هذه النية تلقائياً لمساعدتك في كتابة المحتوى المناسب للجمهور المناسب.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-gem text-2xl w-8 text-center"></i><span>كنوز "الكلمات الطويلة" (Long-Tail Keywords)</span></h4>
        <p>كما يقول خبير الـ SEO العالمي <strong class="text-cyan-400">Brian Dean</strong> من Backlinko: "الكلمات المفتاحية الطويلة هي العمود الفقري للـ SEO الحديث". لماذا؟ لأنها أسهل في الترتيب وتحقق معدلات تحويل أعلى. أداتنا تستخرج لك هذه الكنوز خصيصاً.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-question-circle text-2xl w-8 text-center"></i><span>السيطرة على "الأسئلة الشائعة"</span></h4>
        <p>قسم "كلمات الأسئلة" هو سلاحك السري للظهور في قسم "People Also Ask" والمقتطفات المميزة في جوجل. كل سؤال هو فكرة لمقال أو قسم داخل مقال يجيب مباشرة على ما يبحث عنه المستخدم.</p>
        
        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-cogs text-2xl w-8 text-center"></i><span>دليل الاستخدام:</span></h4>
        <ol class="!list-decimal list-inside space-y-2 pr-4">
            <li><strong class="text-cyan-300">أدخلي موضوعك:</strong> اكتبي الكلمة أو الفكرة الرئيسية في حقل البحث.</li>
            <li><strong class="text-cyan-300">حددي السياق:</strong> اختاري اللغة والدولة لتحسين دقة النتائج.</li>
            <li><strong class="text-cyan-300">أطلقي البحث:</strong> اضغطي "تحليل" ودعي الذكاء الاصطناعي يعمل.</li>
            <li><strong class="text-cyan-300">استكشفي الخريطة:</strong> تصفحي النتائج المقسمة بوضوح في التبويبات المختلفة.</li>
            <li><strong class="text-cyan-300">صدّري عملك:</strong> استخدمي زر "تحميل" للحصول على ملف نصي منظم بجميع الكلمات التي تم إنشاؤها.</li>
        </ol>
    `}} />
);

const KeywordTable: React.FC<{ title: string; keywords: Keyword[]; }> = ({ title, keywords }) => {
    const getCompetitionClass = (comp: KeywordCompetition) => {
        switch (comp) {
            case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };
    
    const getIntentIcon = (intent: UserIntent) => {
        switch (intent) {
            case 'Informational': return { icon: 'fas fa-info-circle', color: 'text-blue-400', title: 'معلوماتي' };
            case 'Commercial': return { icon: 'fas fa-balance-scale-right', color: 'text-yellow-400', title: 'تجاري/مقارنة' };
            case 'Transactional': return { icon: 'fas fa-shopping-cart', color: 'text-green-400', title: 'شرائي' };
            case 'Navigational': return { icon: 'fas fa-compass', color: 'text-purple-400', title: 'توجيهي' };
            default: return { icon: 'fas fa-question-circle', color: 'text-gray-400', title: 'غير محدد' };
        }
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">{title}</h4>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="p-2">الكلمة المفتاحية</th>
                            <th className="p-2">حجم البحث (تقديري)</th>
                            <th className="p-2">المنافسة (تقديرية)</th>
                            <th className="p-2">تكلفة النقرة (تقديرية)</th>
                            <th className="p-2">نية المستخدم</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keywords.map((kw, i) => (
                            <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 font-mono text-cyan-300">{kw.keyword}</td>
                                <td className="p-2 text-gray-300">{kw.volume}</td>
                                <td className="p-2"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getCompetitionClass(kw.competition)}`}>{kw.competition}</span></td>
                                <td className="p-2 text-green-400 font-mono">{kw.cpc}</td>
                                <td className="p-2 text-center">
                                    <i className={`${getIntentIcon(kw.intent).icon} ${getIntentIcon(kw.intent).color} text-lg`} title={getIntentIcon(kw.intent).title}></i>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const KeywordTool: React.FC<KeywordToolProps> = ({ onNavigateHome, logStatus, setError }) => {
    const [topic, setTopic] = useState('');
    const [language, setLanguage] = useState('ar');
    const [country, setCountry] = useState('Egypt');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<KeywordResults | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(true);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError("يرجى إدخال موضوع أو كلمة مفتاحية للبدء.");
            return;
        }
        const apiKey = apiKeyManager.getActiveGeminiApiKey();
        if (!apiKey) {
            setError("يرجى إضافة مفتاح Gemini API في الصفحة الرئيسية أولاً.");
            return;
        }

        setIsLoading(true);
        setResults(null);
        setError(null);
        logStatus(`🔎 بدء البحث عن كلمات مفتاحية لموضوع: "${topic}"`);

        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = "You are a world-class SEO strategist and keyword research expert like Rand Fishkin or Brian Dean. Your goal is to generate a comprehensive keyword map based on a user's topic. Your response MUST be a single, valid JSON object that adheres to the provided schema.";

        const prompt = `Topic: "${topic}". Language: "${language}". Country for context: "${country}".
        Generate a detailed keyword analysis. Provide:
        1.  'mainKeywords': 10-15 core keywords.
        2.  'longTailKeywords': 15-20 specific, longer phrases.
        3.  'questionKeywords': 15-20 keywords formatted as questions (who, what, why, how, etc.).
        4.  'relatedTopics': 10-15 related LSI keywords or topics for content clusters.
        For each keyword, provide an **estimated** monthly search volume (e.g., '1K-10K', '100-1K'), an **estimated** competition level ('Low', 'Medium', 'High'), an **estimated** CPC range (e.g., '$0.50 - $1.20'), and the primary user intent ('Informational', 'Commercial', 'Transactional', 'Navigational').`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            mainKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: {type: Type.STRING}, volume: {type: Type.STRING}, competition: {type: Type.STRING}, cpc: {type: Type.STRING}, intent: {type: Type.STRING} } } },
                            longTailKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: {type: Type.STRING}, volume: {type: Type.STRING}, competition: {type: Type.STRING}, cpc: {type: Type.STRING}, intent: {type: Type.STRING} } } },
                            questionKeywords: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { keyword: {type: Type.STRING}, volume: {type: Type.STRING}, competition: {type: Type.STRING}, cpc: {type: Type.STRING}, intent: {type: Type.STRING} } } },
                            relatedTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }
                    }
                }
            });

            const jsonString = response.text.trim();
            const data = JSON.parse(jsonString);
            setResults(data);
            logStatus(`✅ تم العثور على خريطة كلمات مفتاحية شاملة.`);
        } catch (e: any) {
            setError(`فشل تحليل الكلمات المفتاحية: ${e.message}`);
            logStatus(`❌ فشل تحليل الكلمات المفتاحية: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!results) return;
        let content = `Keyword Analysis for: ${topic}\n\n`;
        
        const formatSection = (title: string, keywords: Keyword[]) => {
            content += `--- ${title} ---\n`;
            content += `Keyword, Volume, Competition, CPC, Intent\n`;
            keywords.forEach(kw => {
                content += `"${kw.keyword}", "${kw.volume}", "${kw.competition}", "${kw.cpc}", "${kw.intent}"\n`;
            });
            content += `\n`;
        };

        formatSection('Main Keywords', results.mainKeywords);
        formatSection('Long-Tail Keywords', results.longTailKeywords);
        formatSection('Question Keywords', results.questionKeywords);
        
        content += `--- Related Topics ---\n`;
        results.relatedTopics.forEach(topic => {
            content += `${topic}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `keywords-${topic.replace(/\s+/g, '-')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                    <i className="fas fa-key relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    بوصلة حورس للكلمات المفتاحية
                </h2>
            </div>
            
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الاستراتيجي الشامل</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="أدخل الموضوع الرئيسي هنا (مثال: تسويق المحتوى)" className="md:col-span-2 w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200" />
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full h-full text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                            {isLoading ? <LoadingIndicator /> : "🔬 تحليل"}
                        </button>
                     </div>
                     <div className="flex gap-4">
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-gray-900 p-2 rounded border border-gray-600"><option value="ar">العربية</option><option value="en">الإنجليزية</option></select>
                        <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="الدولة (للسياق)" className="w-full bg-gray-900 p-2 rounded border border-gray-600" />
                     </div>
                </div>

                {results && (
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-cyan-400">خريطة الكلمات المفتاحية</h3>
                            <button onClick={handleDownload} className="px-4 py-2 text-sm font-semibold rounded-md bg-green-600 text-white hover:bg-green-700"><i className="fas fa-download mr-2"></i>تحميل كـ TXT</button>
                        </div>
                        <KeywordTable title="الكلمات الرئيسية" keywords={results.mainKeywords} />
                        <KeywordTable title="الكلمات المفتاحية الطويلة (Long-Tail)" keywords={results.longTailKeywords} />
                        <KeywordTable title="كلمات الأسئلة" keywords={results.questionKeywords} />
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-purple-300 mb-3">مواضيع ذات صلة (لأفكار المحتوى)</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.relatedTopics.map((t, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-sm">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default KeywordTool;
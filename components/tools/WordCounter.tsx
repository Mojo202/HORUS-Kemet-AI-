import React, { useState, useEffect, useMemo, useRef } from 'react';
import { fileToText } from '../../utils/file';
import { GoogleGenAI } from '@google/genai';
import { apiKeyManager } from '../../apiKeyManager';
import LoadingIndicator from '../LoadingIndicator';

interface WordCounterProps {
    onNavigateHome: () => void;
}

interface TextStats {
    words: number;
    characters: number;
    charactersNoSpaces: number;
    sentences: number;
    paragraphs: number;
    readingTime: number; // in minutes
    keywordCount: number;
    keywordDensity: number; // as a percentage
}

const StatCard: React.FC<{ icon: string; value: string | number; label: string; }> = ({ icon, value, label }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20 flex items-center gap-4 transition-all duration-300 hover:bg-gray-700/50 hover:border-cyan-500/50">
        <div className="text-3xl text-cyan-400">
            <i className={icon}></i>
        </div>
        <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
        </div>
    </div>
);

const KeywordDensityGauge: React.FC<{ density: number; onOptimize?: () => void; isOptimizing?: boolean }> = ({ density, onOptimize, isOptimizing }) => {
    const getDensityInfo = () => {
        if (density > 2.5) return { label: 'حشو زائد!', color: 'text-red-500', bgColor: 'bg-red-900/50', borderColor: 'border-red-500/50' };
        if (density >= 2.0) return { label: 'مرتفع', color: 'text-yellow-500', bgColor: 'bg-yellow-900/50', borderColor: 'border-yellow-500/50' };
        if (density >= 0.5) return { label: 'ممتاز', color: 'text-green-500', bgColor: 'bg-green-900/50', borderColor: 'border-green-500/50' };
        if (density >= 0.2) return { label: 'منخفض', color: 'text-yellow-500', bgColor: 'bg-yellow-900/50', borderColor: 'border-yellow-500/50' };
        return { label: 'منخفض جداً', color: 'text-red-500', bgColor: 'bg-red-900/50', borderColor: 'border-red-500/50' };
    };

    const { label, color, bgColor, borderColor } = getDensityInfo();
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (Math.min(density, 3) / 3) * circumference;

    return (
        <div className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 ${bgColor} ${borderColor}`}>
            <h4 className="font-semibold text-gray-300 text-sm">كثافة الكلمة المفتاحية</h4>
             <div className="relative w-28 h-28">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" strokeWidth="10" className="text-gray-700" stroke="currentColor" fill="transparent" />
                    <circle
                        cx="50" cy="50" r="40" strokeWidth="10"
                        className={`transform -rotate-90 origin-center transition-all duration-500 ${color}`}
                        stroke="currentColor" fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-bold ${color}`}>{density.toFixed(2)}%</span>
                </div>
            </div>
            <span className={`text-sm font-bold ${color}`}>{label}</span>
            {onOptimize && (
                <button onClick={onOptimize} disabled={isOptimizing} className="mt-2 w-full px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-600 flex items-center justify-center">
                    {isOptimizing ? <LoadingIndicator /> : <>🚀 تحسين الكثافة</>}
                </button>
            )}
        </div>
    );
};

const WordCountGauge: React.FC<{ count: number; onExpand?: () => void; isExpanding?: boolean }> = ({ count, onExpand, isExpanding }) => {
    const target = 1500;
    const percentage = Math.min(100, (count / target) * 100);
    const getLabel = () => {
        if (count > 1200) return 'مقال متعمق';
        if (count > 700) return 'مقال قياسي';
        if (count > 300) return 'مقال قصير';
        return 'قصير جداً';
    };

    return (
        <div className="p-4 rounded-lg border bg-gray-800/50 border-cyan-500/20 col-span-2 space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-300 text-sm">عداد الكلمات</h4>
                <span className="text-xs font-mono text-cyan-300">{count} / {target} كلمة</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
                <div 
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
             <p className="text-center text-sm font-semibold text-cyan-400">{getLabel()}</p>
              {onExpand && (
                <button onClick={onExpand} disabled={isExpanding} className="mt-2 w-full px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-600 flex items-center justify-center">
                    {isExpanding ? <LoadingIndicator /> : <>➕ زيادة عدد الكلمات</>}
                </button>
            )}
        </div>
    );
};


// Simple line diffing utility
const createDiff = (original: string, modified: string) => {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    const diff = [];
    for (let i = 0; i < maxLines; i++) {
        const line1 = originalLines[i];
        const line2 = modifiedLines[i];
        if (line1 !== undefined && line2 === undefined) {
            diff.push({ type: 'delete', line: line1 });
        } else if (line1 === undefined && line2 !== undefined) {
            diff.push({ type: 'add', line: line2 });
        } else if (line1 !== line2) {
            diff.push({ type: 'delete', line: line1 });
            diff.push({ type: 'add', line: line2 });
        } else {
            diff.push({ type: 'common', line: line1 });
        }
    }
    return diff;
};


const SuggestionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (suggestion: string) => void;
    originalText: string;
    suggestion: string;
    isLoading: boolean;
}> = ({ isOpen, onClose, onApply, originalText, suggestion, isLoading }) => {
    if (!isOpen) return null;

    const diff = useMemo(() => {
        if (isLoading || !suggestion) return { original: [], modified: [] };
        
        const originalLines = originalText.split('\n');
        const modifiedLines = suggestion.split('\n');
        
        const modifiedSet = new Set(modifiedLines);
        const originalSet = new Set(originalLines);

        const originalDiff = originalLines.map(line => ({
            line,
            type: modifiedSet.has(line) ? 'common' : 'deleted'
        }));
        
        const modifiedDiff = modifiedLines.map(line => ({
            line,
            type: originalSet.has(line) ? 'common' : 'added'
        }));

        return { original: originalDiff, modified: modifiedDiff };

    }, [originalText, suggestion, isLoading]);


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-purple-500/30" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-purple-400">💡 معاينة التعديلات المقترحة</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <LoadingIndicator />
                            <p className="text-cyan-400">جاري توليد الاقتراح...</p>
                        </div>
                    ) : (
                         <div className="grid grid-cols-2 gap-4 h-full">
                            <div>
                                <h4 className="font-bold text-red-400 mb-2 text-center">قبل (الأصلي)</h4>
                                <pre className="w-full h-96 bg-gray-900 border border-gray-700 rounded-md p-2 text-sm whitespace-pre-wrap overflow-auto">
                                    {diff.original.map((item, i) => (
                                        <div key={i} className={item.type === 'deleted' ? 'bg-red-900/40' : ''}>{item.line || <br/>}</div>
                                    ))}
                                </pre>
                            </div>
                             <div>
                                <h4 className="font-bold text-green-400 mb-2 text-center">بعد (المقترح)</h4>
                                <pre className="w-full h-96 bg-gray-900 border border-gray-700 rounded-md p-2 text-sm whitespace-pre-wrap overflow-auto">
                                     {diff.modified.map((item, i) => (
                                        <div key={i} className={item.type === 'added' ? 'bg-green-900/40' : ''}>{item.line || <br/>}</div>
                                    ))}
                                </pre>
                            </div>
                         </div>
                    )}
                </div>
                <div className="flex justify-end p-4 border-t border-gray-700 gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-500">إلغاء</button>
                    <button onClick={() => onApply(suggestion)} disabled={isLoading || !suggestion} className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-500">تطبيق التعديل</button>
                </div>
            </div>
        </div>
    );
};

const SchemaStudio: React.FC<{ text: string, onApplySchema: (schema: string) => void }> = ({ text, onApplySchema }) => {
    const [schema, setSchema] = useState('');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [isFilling, setIsFilling] = useState(false);

    useEffect(() => {
        const schemaMatch = text.match(/<script type="application\/ld\+json"[\s\S]*?>([\s\S]*?)<\/script>/i);
        if (schemaMatch && schemaMatch[1]) {
            try {
                const parsed = JSON.parse(schemaMatch[1]);
                setSchema(JSON.stringify(parsed, null, 2));
            } catch (e) {
                // If parsing fails, just set the raw text
                setSchema(schemaMatch[1].trim());
            }
        }
    }, [text]);
    
    const performAiAction = async (prompt: string) => {
        const apiKey = apiKeyManager.getActiveGeminiApiKey();
        if (!apiKey) {
            alert("يرجى إضافة مفتاح Gemini API أولاً.");
            return null;
        }
        const ai = new GoogleGenAI({ apiKey });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (e: any) {
            alert(`حدث خطأ أثناء الاتصال بـ Gemini: ${e.message}`);
            return null;
        }
    };


    const handleAnalyze = async () => {
        if (!schema) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        const prompt = `You are a Schema.org expert validator. Analyze the following JSON-LD schema. Provide a concise report in Arabic, listing any errors, missing required fields, or suggestions for improvement.

        Schema:
        \`\`\`json
        ${schema}
        \`\`\``;
        const result = await performAiAction(prompt);
        setAnalysis(result || "فشل التحليل.");
        setIsAnalyzing(false);
    };
    
    const handleFix = async () => {
        if (!schema) return;
        setIsFixing(true);
        const prompt = `You are a Schema.org expert. The following JSON-LD schema may contain errors. Please fix it and return ONLY the corrected, valid JSON code. Do not add any explanation.

        Schema to fix:
        \`\`\`json
        ${schema}
        \`\`\``;
        let result = await performAiAction(prompt);
        if (result) {
            result = result.replace(/```json\n?|```/g, '').trim();
            setSchema(result);
        }
        setIsFixing(false);
    };

    const handleFill = async () => {
        if (!text) return;
        setIsFilling(true);
        const prompt = `You are an SEO expert. Based on the following article text, generate a complete and relevant QAPage schema (application/ld+json). Create one main question and 4 related sub-questions with their answers extracted from the text. Return ONLY the valid JSON-LD code inside a <script> tag.
        
        Article Text:
        ---
        ${text}
        ---`;
        const result = await performAiAction(prompt);
        if (result) {
            onApplySchema(result);
        }
        setIsFilling(false);
    };

    return (
        <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-xl font-bold text-center text-cyan-400">🔍 استوديو السكيما</h3>
            <textarea
                value={schema}
                onChange={e => setSchema(e.target.value)}
                placeholder="الصق كود السكيما هنا، أو سيتم اكتشافه من المقال تلقائياً..."
                className="w-full h-40 bg-gray-900 border border-gray-600 rounded-md p-2 font-mono text-sm text-gray-200 resize-y"
                dir="ltr"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={handleAnalyze} disabled={isAnalyzing} className="p-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-600 flex justify-center">{isAnalyzing ? <LoadingIndicator/> : "🔬 تحليل الجودة"}</button>
                <button onClick={handleFix} disabled={isFixing} className="p-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-600 flex justify-center">{isFixing ? <LoadingIndicator/> : "✨ إصلاح تلقائي"}</button>
                <button onClick={handleFill} disabled={isFilling} className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 flex justify-center">{isFilling ? <LoadingIndicator/> : "📝 ملء من المقال"}</button>
            </div>
            {analysis && (
                <div className="p-4 bg-gray-900/70 rounded-md border border-gray-700">
                    <h4 className="font-semibold text-purple-300 mb-2">نتائج التحليل:</h4>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">{analysis}</pre>
                </div>
            )}
        </div>
    );
};

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300"
         dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">لوحة قيادة حورس: دليلك الكامل لتحويل المحتوى إلى تحفة فنية تتصدر محركات البحث</h3>
        
        <p>هذه ليست مجرد أداة، بل هي شريكك الذكي في رحلة صناعة المحتوى المتكامل.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-tachometer-alt text-2xl w-8 text-center"></i><span>أولاً: لوحة التحليل المرئية - نبض مقالك في لحظة</span></h4>
        <p>وداعاً للأرقام الجامدة! حولنا الإحصائيات إلى مؤشرات تفاعلية تخبرك قصة مقالك بصرياً:</p>
        <ul class="!list-none !p-0 space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">مؤشر عدد الكلمات:</strong> لم يعد مجرد رقم. الآن هو شريط تقدم يوضح لك مدى اقترابك من هدف المقال الاحترافي (1500 كلمة). ستعرف فوراً ما إذا كان مقالك "قصيراً" يحتاج للمزيد، أو "متعمقاً" جاهزاً للسيطرة.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">مؤشر كثافة الكلمات المفتاحية (الأهم):</strong> هذا هو حارسك الأمين ضد عقوبات جوجل. لقد برمجناه ليتغير لونه بذكاء:
                <ul class="!list-disc !marker:text-cyan-400 !pl-8 !mt-2 !space-y-1">
                    <li><span class="text-red-500 font-bold">أحمر (خطر!):</span> إما أن الكلمة المفتاحية شبه غائبة، أو أنك تجاوزت الحدود ووقعت في فخ "حشو الكلمات" الذي يكرهه جوجل.</li>
                    <li><span class="text-yellow-500 font-bold">أصفر (تحذير):</span> الكثافة إما منخفضة أو مرتفعة قليلاً. أنت قريب، لكن تحتاج لبعض التعديلات.</li>
                    <li><span class="text-green-500 font-bold">أخضر (ممتاز!):</span> لقد وصلت إلى "النطاق الذهبي" (0.5% - 2.0%). مقالك الآن يتحدث لغة محركات البحث بطلاقة.</li>
                </ul>
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">البطاقات الإحصائية:</strong> باقي البيانات الحيوية (الحروف، الجمل، وقت القراءة) معروضة في بطاقات أنيقة وسريعة القراءة.</li>
        </ul>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-magic text-2xl w-8 text-center"></i><span>ثانياً: مساعدك الذكي - لمسة من سحر الذكاء الاصطناعي</span></h4>
        <p>تحليل البيانات خطوة أولى، لكن التحسين هو الخطوة الأهم. لذلك، زودنا الأداة بأزرار ذكية تجعل التحسين بضغطة زر:</p>
        <ol class="!list-none !p-0 !space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">زر "🚀 تحسين الكثافة":</strong> هل مؤشر الكثافة في المنطقة الحمراء؟ لا تقلق. هذا الزر يستدعي الذكاء الاصطناعي ليقوم بإعادة صياغة بعض الجمل ودمج كلمتك المفتاحية بشكل طبيعي وسلس، ليرفع الكثافة إلى النطاق الأخضر المثالي.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">زر "➕ زيادة عدد الكلمات":</strong> هل مقالك قصير؟ هذا الزر يطلب من الذكاء الاصطناعي توسيع المحتوى عبر إضافة فقرات جديدة غنية بالمعلومات والتفاصيل، مما يزيد من قيمة المقال وطوله.
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">نافذة المعاينة "قبل وبعد":</strong> نحن نؤمن بسيطرتك الكاملة. لن نغير حرفاً في مقالك دون موافقتك. أي اقتراح من الذكاء الاصطناعي سيظهر لك في نافذة تعرض النص الأصلي بجانب النص المُعدل، مع تظليل الإضافات والحذوفات. القرار النهائي لك دائماً.
            </li>
        </ol>
        
        <div class="p-4 bg-purple-900/30 border-l-4 border-purple-400 text-purple-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-lightbulb"></i> كيف تعمل؟</h5>
            <p class="text-sm">عندما تضغط على أزرار التحسين، نقوم بإرسال مقالك إلى Gemini مع تعليمات (Prompt) دقيقة ومصممة خصيصاً لهذه المهمة، مما يضمن أن تكون النتائج عالية الجودة ومتوافقة مع هدفك.</p>
        </div>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-code text-2xl w-8 text-center"></i><span>ثالثاً: استوديو السكيما - تكلم لغة جوجل السرية</span></h4>
        <p>السكيما (Schema) هي اللغة التي تتحدث بها مع جوجل لتخبره عن محتوى صفحتك بدقة. استوديو السكيما الخاص بنا يجعل التعامل معها سهلاً:</p>
        <ul class="!list-none !p-0 !space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">الكشف التلقائي:</strong> بمجرد لصق مقالك، سيكتشف الاستوديو أي كود سكيما موجود ويعرضه لك.</li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">🔬 تحليل الجودة:</strong> هل السكيما صحيحة؟ هل ينقصها حقول مهمة؟ هذا الزر يرسل الكود للذكاء الاصطناعي ليعطيك تقريراً كاملاً.</li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">✨ إصلاح تلقائي:</strong> بنقرة واحدة، سيقوم الذكاء الاصطناعي بإصلاح الأخطاء وتكملة الحقول الناقصة في السكيما.</li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30"><strong class="text-purple-300">📝 ملء من المقال:</strong> الأداة الأقوى! إذا كان مقالك يحتوي على أسئلة وأجوبة، سيقوم هذا الزر بقراءة المقال واستخراجها وملء قالب سكيما QAPage فارغ تلقائياً.</li>
        </ul>

        <p class="!mt-6">هذه ليست مجرد أداة، بل هي ورشة عمل متكاملة تحت أمرك. استخدمها لتحليل، تحسين، وإتقان كل كلمة تكتبها، وحوّل كل مقال إلى أصل رقمي لا يُقدر بثمن.</p>
`}} />
);


const WordCounter: React.FC<WordCounterProps> = ({ onNavigateHome }) => {
    const [text, setText] = useState('');
    const [keyword, setKeyword] = useState('');
    const [stats, setStats] = useState<TextStats | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isOptimizingDensity, setIsOptimizingDensity] = useState(false);
    const [isExpandingText, setIsExpandingText] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeOptimization, setActiveOptimization] = useState<'density' | 'expand' | null>(null);


    const performAiAction = async (prompt: string) => {
        const apiKey = apiKeyManager.getActiveGeminiApiKey();
        if (!apiKey) {
            alert("يرجى إضافة مفتاح Gemini API أولاً.");
            return null;
        }
        const ai = new GoogleGenAI({ apiKey });
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (e: any) {
            alert(`حدث خطأ أثناء الاتصال بـ Gemini: ${e.message}`);
            return null;
        }
    };
    
    const handleOptimizeDensity = async () => {
        if (!keyword.trim() || !stats) return;
        setActiveOptimization('density');
        setIsOptimizingDensity(true);
        setSuggestion('');
        setIsModalOpen(true);
        const prompt = `You are an expert SEO editor. The following text has a keyword density of ${stats.keywordDensity.toFixed(2)}% for the keyword "${keyword}". Your task is to subtly and naturally rewrite parts of the text to increase the keyword density to the ideal range of 1.5% to 2.0%. Do NOT sound repetitive or stuff keywords. Maintain the original tone and language (Arabic). Return ONLY the full, modified text.
        
        Original Text:
        ---
        ${text}
        ---`;

        const result = await performAiAction(prompt);
        if (result) {
            setSuggestion(result);
        }
        setIsOptimizingDensity(false);
    };

    const handleExpandText = async () => {
        if (!stats) return;
        setActiveOptimization('expand');
        setIsExpandingText(true);
        setSuggestion('');
        setIsModalOpen(true);

        const targetWords = Math.max(stats.words + 300, 1200);
        const prompt = `You are an expert content writer. The following article has ${stats.words} words. Your task is to expand it to approximately ${targetWords} words. Add more details, provide deeper explanations, or introduce new relevant sub-topics. Maintain the original tone, quality, and language (Arabic). Return ONLY the full, expanded text.

        Original Text:
        ---
        ${text}
        ---`;
        const result = await performAiAction(prompt);
        if (result) {
            setSuggestion(result);
        }
        setIsExpandingText(false);
    };
    
    const handleApplySuggestion = (newText: string) => {
        setText(newText);
        setIsModalOpen(false);
        setActiveOptimization(null);
    };


    useEffect(() => {
        const calculateStats = () => {
            if (!text.trim()) {
                setStats(null);
                return;
            }

            const words = text.trim().split(/\s+/).filter(Boolean).length;
            const characters = text.length;
            const charactersNoSpaces = text.replace(/\s/g, '').length;
            const sentences = (text.match(/[.!?…]+(\s|$)/g) || []).length + (text.match(/[\n\r]/g)?.length || 0);
            const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
            const readingTime = Math.ceil(words / 200);

            let keywordCount = 0;
            let keywordDensity = 0;
            if (keyword.trim() && words > 0) {
                 const escapedKeyword = keyword.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                 const regex = new RegExp(escapedKeyword, 'gi');
                keywordCount = (text.match(regex) || []).length;
                keywordDensity = (keywordCount / words) * 100;
            }

            setStats({
                words, characters, charactersNoSpaces, sentences, paragraphs, readingTime, keywordCount, keywordDensity,
            });
        };

        const timeoutId = setTimeout(calculateStats, 300);
        return () => clearTimeout(timeoutId);
    }, [text, keyword]);
    
    const handleFiles = async (files: FileList | null) => {
        if (files && files[0]) {
            try {
                const fileText = await fileToText(files[0]);
                setText(fileText);
            } catch (error) {
                alert("فشل في قراءة الملف.");
            }
        }
    };
    
    const dragEvents = {
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); },
        onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFiles(e.dataTransfer.files); },
    };

    const handleDownload = () => {
        if (!text) return;
        const title = text.split('\n')[0].substring(0, 50) || 'article';
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${slug}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleApplySchemaToText = (schemaCode: string) => {
        // Remove old schema if exists
        const cleanedText = text.replace(/<script type="application\/ld\+json"[\s\S]*?>[\s\S]*?<\/script>/i, '');
        // Append new schema
        setText(cleanedText.trim() + '\n\n' + schemaCode);
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <div className="flex flex-col items-center gap-4 text-center my-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" strokeLinejoin="round" strokeWidth="3" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-tachometer-alt relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    لوحة تحليل وتحسين المحتوى
                </h2>
            </div>

             <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الإرشادي الاحترافي</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                        <div 
                            {...dragEvents}
                            className={`relative transition-all duration-300 ${isDragging ? 'ring-4 ring-cyan-500 ring-offset-2 ring-offset-gray-900 rounded-lg' : ''}`}
                        >
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="اسحب وأفلت ملفًا هنا، أو الصق مقالك لبدء التحليل..."
                                className="w-full h-96 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-4 font-mono text-sm text-gray-800 dark:text-gray-200 resize-y"
                            />
                            {isDragging && <div className="absolute inset-0 bg-cyan-900/50 rounded-lg flex items-center justify-center text-cyan-200 font-bold">أفلت الملف هنا</div>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                             <button onClick={async () => setText(await navigator.clipboard.readText())} className="flex-1 px-3 py-2 text-sm rounded-md bg-gray-700 text-white hover:bg-gray-600"><i className="fas fa-paste mr-2"></i>لصق</button>
                             <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-3 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"><i className="fas fa-upload mr-2"></i>رفع ملف</button>
                             <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} className="hidden" accept=".txt,.html,.md" />
                             <button onClick={handleDownload} disabled={!text} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-500"><i className="fas fa-download mr-2"></i>تحميل كـ TXT</button>
                             <button onClick={() => setText('')} disabled={!text} className="flex-1 px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-500"><i className="fas fa-trash mr-2"></i>مسح الكل</button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-center text-cyan-400">لوحة التحليل الفوري</h3>
                        {stats ? (
                             <div className="grid grid-cols-2 gap-4">
                               <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/20 col-span-2">
                                    <label htmlFor="keyword-input" className="block text-sm font-medium text-purple-300 mb-2">محلل كثافة الكلمات المفتاحية:</label>
                                    <input id="keyword-input" type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="أدخل الكلمة المفتاحية هنا..." className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-gray-200" />
                                </div>
                                <KeywordDensityGauge density={stats.keywordDensity} onOptimize={handleOptimizeDensity} isOptimizing={isOptimizingDensity && activeOptimization === 'density'} />
                                <StatCard icon="fas fa-key" value={stats.keywordCount} label="تكرار الكلمة المفتاحية" />
                                <WordCountGauge count={stats.words} onExpand={handleExpandText} isExpanding={isExpandingText && activeOptimization === 'expand'} />
                                <StatCard icon="fas fa-file-word" value={stats.words} label="مجموع الكلمات" />
                                <StatCard icon="fas fa-hourglass-half" value={`~ ${stats.readingTime} دقيقة`} label="وقت القراءة المقدر" />
                                <StatCard icon="fas fa-text-width" value={stats.characters} label="حرف (مع مسافات)" />
                                <StatCard icon="fas fa-text-height" value={stats.charactersNoSpaces} label="حرف (بدون مسافات)" />
                                <StatCard icon="fas fa-paragraph" value={stats.paragraphs} label="فقرة" />
                                <StatCard icon="fas fa-quote-right" value={stats.sentences} label="جملة" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-gray-800/50 rounded-lg border border-cyan-500/20 p-8">
                                <p className="text-gray-400">في انتظار النص للتحليل...</p>
                            </div>
                        )}
                    </div>
                </div>
                <SchemaStudio text={text} onApplySchema={handleApplySchemaToText} />
            </div>
             <SuggestionModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setActiveOptimization(null); }}
                onApply={handleApplySuggestion}
                originalText={text}
                suggestion={suggestion}
                isLoading={isOptimizingDensity || isExpandingText}
            />
        </>
    );
};

export default WordCounter;
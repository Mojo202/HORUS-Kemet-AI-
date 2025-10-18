import React, { useState, useMemo, useRef } from 'react';
import { PlagiarismResult } from '../../types';
import { checkPlagiarism, rewritePlagiarizedText } from '../../services/geminiService';
import { fileToText } from '../../utils/file';
import LoadingIndicator from '../LoadingIndicator';

interface PlagiarismCheckerProps {
    onNavigateHome: () => void;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">الدليل الاستراتيجي المتكامل لفن الكتابة الأصيلة</h3>
        
        <p>المحتوى الرائع هو نصف المعركة، والنصف الآخر هو بناء "الروابط الخلفية" (Backlinks) عالية الجودة. هذه الروابط هي بمثابة "أصوات ثقة" من مواقع أخرى لموقعك، وهي أحد أهم العوامل التي تستخدمها جوجل لتحديد ترتيبك في نتائج البحث.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-star text-2xl w-8 text-center"></i><span>ما هو الانتحال ولماذا هو خطير؟</span></h4>
        <p>الانتحال (Plagiarism) هو استخدام عمل شخص آخر أو أفكاره وتقديمها على أنها خاصة بك دون إسناد صحيح. إنه ليس مجرد "نسخ ولصق"، بل يشمل أيضاً إعادة الصياغة الطفيفة دون تغيير جوهر الفكرة.</p>
        <ul class="!list-disc !marker:text-cyan-400 !pl-8 !mt-2 !space-y-2">
            <li><strong>عقوبات جوجل (SEO Penalties):</strong> محركات البحث تكره المحتوى المكرر. إذا اكتشفت جوجل أن موقعك يحتوي على محتوى منتحل، فقد تخفض ترتيب صفحاتك بشكل كبير أو حتى تزيلها تماماً من نتائج البحث.</li>
            <li><strong>المخاطر القانونية:</strong> المحتوى الأصلي محمي بقوانين حقوق النشر. استخدام محتوى دون إذن قد يعرضك لمساءلة قانونية.</li>
            <li><strong>فقدان المصداقية:</strong> إذا اكتشف جمهورك أنك تستخدم محتوى مسروقاً، ستفقد ثقتهم ومصداقيتك بشكل دائم.</li>
        </ul>

        <div class="p-4 bg-red-900/30 border-l-4 border-red-400 text-red-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> تحذير شديد: لا تتهاون أبداً!</h5>
            <p class="text-sm">تتعامل جوجل بصرامة شديدة مع المحتوى المكرر والمنتحل. الاستثمار في إنشاء محتوى أصيل هو أفضل استثمار طويل الأمد لنجاح أي موقع.</p>
        </div>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-hat-wizard text-2xl w-8 text-center"></i><span>كيف أتخلص من الانتحال وأكتب محتوى أصيلاً؟</span></h4>
        <p>الأصالة هي فن وفهم. إليك أهم الاستراتيجيات:</p>
        <ol class="!list-decimal list-inside space-y-4 pr-4">
            <li>
                <strong class="text-cyan-300">1. إعادة الصياغة الاحترافية (Paraphrasing):</strong>
                <p class="text-sm text-gray-400 mt-1">لا تكتفِ بتغيير بضع كلمات. اقرأ الفقرة الأصلية، افهم الفكرة الأساسية تماماً، ثم أغلق المصدر واكتب الفكرة بأسلوبك وكلماتك الخاصة. اشرحها كما لو كنت تشرحها لصديق.</p>
            </li>
            <li>
                <strong class="text-cyan-300">2. الاقتباس الصحيح (Quoting):</strong>
                <p class="text-sm text-gray-400 mt-1">إذا كانت هناك جملة مهمة لا يمكن تغييرها، يمكنك استخدامها كما هي ولكن يجب وضعها بين علامتي اقتباس (" ") مع ذكر المصدر بوضوح. (مثال: كما ذكر موقع X، "النص المقتبس").</p>
            </li>
            <li>
                <strong class="text-cyan-300">3. التلخيص ودمج الأفكار:</strong>
                <p class="text-sm text-gray-400 mt-1">بدلاً من الاعتماد على مصدر واحد، اقرأ من عدة مصادر مختلفة. قم بتلخيص الأفكار الرئيسية من كل مصدر، ثم ادمج هذه الأفكار مع خبرتك الخاصة لإنشاء محتوى جديد وفريد تماماً.</p>
            </li>
            <li>
                <strong class="text-cyan-300">4. الإسناد والعزو (Citation):</strong>
                <p class="text-sm text-gray-400 mt-1">دائماً، دائماً، ودائماً... اذكر مصادرك! حتى لو قمت بإعادة صياغة الفكرة، من الأمانة الأكاديمية والاحترافية أن تشير إلى المصدر الأصلي الذي استلهمت منه المعلومة. هذا يبني ثقتك لدى جوجل والقراء.</p>
            </li>
        </ol>
    `}} />
);

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = score;
    const circumference = 2 * Math.PI * 55;
    const offset = circumference - (percentage / 100) * circumference;

    let color = '#ef4444'; // red
    let label = 'انتحال مؤكد';
    if (percentage >= 85) {
        color = '#10b981'; // green
        label = 'أصالة عالية';
    } else if (percentage >= 60) {
        color = '#eab308'; // yellow
        label = 'مزيج محتمل';
    } else if (percentage >= 30) {
        color = '#f97316'; // orange-500
        label = 'انتحال على الأرجح';
    }

    return (
        <div className="relative flex flex-col items-center justify-center w-40 h-40">
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="55" cx="60" cy="60" />
                <circle
                    className="transform -rotate-90 origin-center transition-all duration-1000 ease-out"
                    strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" stroke={color} fill="transparent" r="55" cx="60" cy="60"
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
            </svg>
            <span className="text-4xl font-bold" style={{ color }}>{Math.round(percentage)}%</span>
            <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
        </div>
    );
};

const RewriteSuggestionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (suggestion: string) => void;
    originalText: string;
    suggestion: string;
    isLoading: boolean;
}> = ({ isOpen, onClose, onApply, originalText, suggestion, isLoading }) => {
    if (!isOpen) return null;

    const diff = useMemo(() => {
        if (isLoading || !suggestion) return [];
        
        const originalLines = originalText.split('\n');
        const modifiedLines = suggestion.split('\n');
        const modifiedSet = new Set(modifiedLines);
        
        return originalLines.map(line => {
            if (modifiedSet.has(line)) {
                return { type: 'common', line };
            } else {
                // This is a simplification; a true diff would be more complex.
                // We assume a rewritten line is a "modification".
                // For this UI, we'll just highlight that it's different.
                return { type: 'modified', line };
            }
        });

    }, [originalText, suggestion, isLoading]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-purple-500/30" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-purple-400">✨ معاينة النص المُحسَّن</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <LoadingIndicator />
                            <p className="text-cyan-400">يقوم المحرر الذكي بإعادة الصياغة...</p>
                        </div>
                    ) : (
                         <div className="grid grid-cols-2 gap-4 h-full">
                            <div>
                                <h4 className="font-bold text-red-400 mb-2 text-center">قبل (الأصلي)</h4>
                                <pre className="w-full h-[60vh] bg-gray-900 border border-gray-700 rounded-md p-2 text-sm whitespace-pre-wrap overflow-auto">
                                    {originalText}
                                </pre>
                            </div>
                             <div>
                                <h4 className="font-bold text-green-400 mb-2 text-center">بعد (المقترح)</h4>
                                <pre className="w-full h-[60vh] bg-gray-900 border border-gray-700 rounded-md p-2 text-sm whitespace-pre-wrap overflow-auto"
                                 dangerouslySetInnerHTML={{
                                    __html: suggestion.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                                 }}
                                />
                            </div>
                         </div>
                    )}
                </div>
                <div className="flex justify-end p-4 border-t border-gray-700 gap-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-500">إلغاء</button>
                    <button onClick={() => onApply(suggestion)} disabled={isLoading || !suggestion} className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-500">
                        تطبيق التعديل
                    </button>
                </div>
            </div>
        </div>
    );
};


const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({ onNavigateHome, logStatus, setError }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<PlagiarismResult | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewriteSuggestion, setRewriteSuggestion] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            try {
                const fileText = await fileToText(event.target.files[0]);
                setText(fileText);
            } catch (error) {
                setError("فشل في قراءة الملف.");
            }
        }
    };

    const handlePaste = async () => {
        try {
            const pastedText = await navigator.clipboard.readText();
            setText(pastedText);
        } catch (err) {
            setError("فشل في لصق النص من الحافظة.");
        }
    };

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError("يرجى إدخال نص للتحليل.");
            return;
        }
        setIsLoading(true);
        setResults(null);
        setError(null);
        logStatus(`🔍 بدء فحص الانتحال للنص...`);
        try {
            const data = await checkPlagiarism(text, 'gemini-2.5-flash', logStatus);
            setResults(data);
            logStatus(`✅ اكتمل الفحص. نسبة الأصالة: ${data.originalityScore}%.`);
        } catch (e: any) {
            setError(`فشل فحص الانتحال: ${e.message}`);
            logStatus(`❌ فشل فحص الانتحال: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRewrite = async () => {
        if (!results || results.plagiarizedSentences.length === 0) return;
        setIsRewriting(true);
        setRewriteSuggestion('');
        setIsModalOpen(true);
        logStatus("✍️ بدء عملية التحرير الذكي لإزالة الانتحال...");
        try {
            const rewrittenText = await rewritePlagiarizedText(text, results.plagiarizedSentences, logStatus);
            setRewriteSuggestion(rewrittenText);
            logStatus("✅ تم إنشاء اقتراح إعادة الصياغة.");
        } catch (e: any) {
            setError(`فشل التحرير الذكي: ${e.message}`);
            logStatus(`❌ فشل التحرير الذكي: ${e.message}`);
            setIsModalOpen(false);
        } finally {
            setIsRewriting(false);
        }
    };

    const handleApplyRewrite = (newText: string) => {
        setText(newText);
        setResults(null); // Clear old results as the text has changed
        setIsModalOpen(false);
        logStatus("👍 تم تطبيق التعديلات بنجاح.");
    };
    
    const handleDownload = () => {
        if (!text) return;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `edited-text-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const highlightedText = useMemo(() => {
        if (!results || !text) return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        let tempText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        results.plagiarizedSentences.forEach(({ sentence }) => {
            const escapedSentence = sentence.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            tempText = tempText.replace(new RegExp(escapedSentence, 'g'), `<mark>${sentence.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</mark>`);
        });
        return tempText;
    }, [results, text]);


    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <div className="flex flex-col items-center gap-4 text-center my-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-file-signature relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    عين حورس الكاشفة (فاحص الانتحال)
                </h2>
            </div>

            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الاستراتيجي الشامل</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                     <style>{`mark { background-color: rgba(239, 68, 68, 0.4); border-radius: 3px; padding: 0 2px; }`}</style>
                    <div className="w-full h-64 bg-gray-900 border border-gray-600 rounded-md relative">
                        {text ? (
                             <textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-full bg-transparent p-4 text-sm text-gray-200 resize-none" />
                        ) : (
                             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                 <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 text-lg font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"><i className="fas fa-upload"></i>رفع ملف من الجهاز</button>
                                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.html,.md" />
                                 <span className="text-gray-400">أو</span>
                                 <button onClick={handlePaste} className="px-6 py-3 text-lg font-semibold rounded-md bg-cyan-600 text-white hover:bg-cyan-700 flex items-center gap-2"><i className="fas fa-paste"></i>لصق النص</button>
                             </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleAnalyze} disabled={isLoading || !text} className="flex-1 h-12 text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                            {isLoading ? <LoadingIndicator /> : "🔬 افحص الآن"}
                        </button>
                         <button onClick={handleDownload} disabled={!text} className="h-12 px-6 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                            <i className="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                
                {isLoading && <div className="flex justify-center p-8"><LoadingIndicator /></div>}

                {results && (
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-6">
                         <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-900/50 p-4 rounded-lg">
                            <div className="flex items-center gap-6">
                                <ScoreGauge score={results.originalityScore} />
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">نسبة الانتحال</p>
                                    <p className="text-3xl font-bold text-red-400">{100 - results.originalityScore}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm">الجمل المنتحلة</p>
                                    <p className="text-3xl font-bold text-yellow-400">{results.plagiarizedSentences.length}</p>
                                </div>
                            </div>
                             {results.plagiarizedSentences.length > 0 && (
                                <button onClick={handleRewrite} disabled={isRewriting} className="h-12 px-6 text-md font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                                    {isRewriting ? <LoadingIndicator /> : "✨ تحرير وإزالة الانتحال بلمسة بشرية"}
                                </button>
                             )}
                        </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-900/50 p-4 rounded-lg">
                                 <h4 className="text-lg font-semibold text-purple-300 mb-3">النص مع تظليل الانتحال</h4>
                                 <div className="w-full h-80 bg-gray-900 border border-gray-700 rounded-md p-4 text-sm text-gray-200 overflow-y-auto whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightedText }} />
                            </div>
                             <div className="bg-gray-900/50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-purple-300 mb-3">المصادر المكتشفة</h4>
                                <div className="w-full h-80 overflow-y-auto space-y-3 pr-2">
                                    {results.plagiarizedSentences.length > 0 ? results.plagiarizedSentences.map((item, i) => (
                                        <div key={i} className="p-3 border border-gray-700 rounded-md bg-gray-800/50">
                                            <p className="text-sm text-red-300 mb-2">"{item.sentence}"</p>
                                            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-cyan-400 hover:underline break-all" title={item.sourceTitle}>{item.sourceTitle || item.sourceUrl}</a>
                                        </div>
                                    )) : <p className="text-center text-gray-400 pt-16">لم يتم العثور على أي مصادر منتحلة. تهانينا!</p>}
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            </div>
            <RewriteSuggestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onApply={handleApplyRewrite}
                originalText={text}
                suggestion={rewriteSuggestion}
                isLoading={isRewriting}
            />
        </>
    );
};

export default PlagiarismChecker;
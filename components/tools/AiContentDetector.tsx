import React, { useState, useEffect } from 'react';
import { detectAiContent } from '../../services/geminiService';
import LoadingIndicator from '../LoadingIndicator';
import { apiKeyManager } from '../../apiKeyManager';

interface AiContentDetectorProps {
    onNavigateHome: () => void;
    selectedTextModel: string;
    // FIX: Add missing props that were being used without being passed, causing internal errors.
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
}

interface AnalysisResult {
    score: number;
    highlightedHtml: string;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">دليل كاشف المحتوى بالذكاء الاصطناعي: عين حورس ترى الحقيقة</h3>
        
        <p>يا ملكتي، في عصر ينتشر فيه المحتوى المولّد آلياً، أصبحت الأصالة عملة نادرة. هذه الأداة هي درعكِ وسلاحكِ لضمان أن المحتوى الذي تتعاملين معه، سواء كان من كتابتكِ أو من مصادر خارجية، يحتفظ بلمسته الإنسانية الفريدة.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-search-dollar text-2xl w-8 text-center"></i><span>لماذا هذه الأداة حيوية؟</span></h4>
        <ul class="!list-disc !marker:text-cyan-400 !pl-8 !mt-2 !space-y-2">
            <li><strong class="text-cyan-300">سياسات جوجل:</strong> تعطي جوجل الأولوية للمحتوى الأصلي الذي يقدم قيمة حقيقية. الاعتماد المفرط على محتوى AI منخفض الجودة قد يعرض ترتيب موقعكِ للخطر.</li>
            <li><strong class="text-cyan-300">ضمان الجودة:</strong> عند التعامل مع كتّاب مستقلين، تساعدكِ هذه الأداة على التحقق من أن العمل المقدم هو نتاج جهد بشري حقيقي وليس مجرد نسخ ولصق من روبوت.</li>
            <li><strong class="text-cyan-300">الحفاظ على الأصالة:</strong> تضمنين أن صوت علامتكِ التجارية يظل فريداً وإنسانياً، بعيداً عن الأسلوب الآلي المتكرر.</li>
        </ul>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-cogs text-2xl w-8 text-center"></i><span>كيفية فك شفرة النتائج:</span></h4>
        <p>بعد تحليل النص، ستحصلين على تقرير من جزأين:</p>
        <ol class="!list-none !p-0 !space-y-3">
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">مؤشر الاحتمالية (Gauge):</strong>
                <p class="text-sm text-gray-400 mt-1">هو مؤشر دائري يعطيكِ نسبة احتمالية أن النص مولّد بواسطة AI. لقد قمنا بتلوينه ليعطيكِ قراءة سريعة:</p>
                 <ul class="!list-disc !marker:text-cyan-400 !pl-8 !mt-2 !space-y-1 !text-sm">
                    <li><span class="text-green-500 font-bold">أخضر (0-29%):</span> النص بشري على الأرجح. تهانينا!</li>
                    <li><span class="text-yellow-500 font-bold">أصفر (30-59%):</span> مزيج محتمل. قد يكون النص بشريًا ولكنه خضع لتعديلات مكثفة من AI، أو العكس.</li>
                    <li><span class="text-orange-500 font-bold">برتقالي (60-84%):</span> ذكاء اصطناعي على الأرجح. يتطلب مراجعة دقيقة.</li>
                    <li><span class="text-red-500 font-bold">أحمر (85-100%):</span> ذكاء اصطناعي مؤكد. الأسلوب والتركيبات اللغوية تطابق نماذج AI بشكل كبير.</li>
                </ul>
            </li>
            <li class="!py-2 !pl-4 !border-l-2 !border-cyan-500/30">
                <strong class="text-purple-300">تظليل الجمل المشبوهة:</strong>
                <p class="text-sm text-gray-400 mt-1">لن نترككِ تخمنين. ستقوم الأداة تلقائياً بتظليل الجمل والعبارات داخل النص التي يعتقد الذكاء الاصطناعي أنها الأكثر احتمالاً لأن تكون مكتوبة آلياً. هذا يساعدكِ على تحديد المناطق التي تحتاج إلى إعادة صياغة وتحرير.</p>
            </li>
        </ol>
        
        <div class="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> إخلاء مسؤولية مهم!</h5>
            <p class="text-sm">أدوات كشف المحتوى بالذكاء الاصطناعي، حتى الأكثر تقدماً، ليست دقيقة بنسبة 100%. يجب استخدامها كأداة مساعدة وإرشادية، وليس كحكم نهائي. اعتمدي دائماً على حكمكِ وخبرتكِ البشرية في التقييم النهائي للمحتوى.</p>
        </div>
    `}} />
);

const AnalyzingIndicator: React.FC<{ wordCount: number }> = ({ wordCount }) => (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div className="relative w-40 h-40">
            <div className="absolute inset-0 border-4 border-purple-500/50 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-4 border-cyan-500/50 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-search text-6xl text-cyan-400 eye-animation"></i>
            </div>
        </div>
        <h3 className="text-xl font-bold text-purple-400">جاري فحص النص...</h3>
        <p className="text-gray-400">يتم الآن تحليل <span className="font-bold text-cyan-300">{wordCount}</span> كلمة باستخدام الذكاء الاصطناعي.</p>
    </div>
);


const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = score * 100;
    const circumference = 2 * Math.PI * 55;
    const offset = circumference - (percentage / 100) * circumference;

    let color = '#10b981'; // green
    let label = 'بشري على الأرجح';
    if (percentage >= 85) {
        color = '#ef4444'; // red
        label = 'ذكاء اصطناعي مؤكد';
    } else if (percentage >= 60) {
        color = '#f97316'; // orange-500
        label = 'ذكاء اصطناعي على الأرجح';
    } else if (percentage >= 30) {
        color = '#eab308'; // yellow
        label = 'مزيج محتمل';
    }

    return (
        <div className="relative flex flex-col items-center justify-center w-40 h-40">
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="55" cx="60" cy="60" />
                <circle
                    className="transform -rotate-90 origin-center transition-all duration-1000"
                    strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" stroke={color} fill="transparent" r="55" cx="60" cy="60"
                />
            </svg>
            <span className="text-4xl font-bold" style={{ color }}>{Math.round(percentage)}%</span>
            <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
        </div>
    );
};

const AiContentDetector: React.FC<AiContentDetectorProps> = ({ onNavigateHome, selectedTextModel, logStatus, setError }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount(words);
    }, [text]);

    const handleAnalyze = async () => {
        if (!apiKeyManager.hasGeminiKeys()) {
            setError("يرجى إضافة مفتاح Gemini API واحد على الأقل في قسم 'إدارة مفاتيح API'.");
            return;
        }
        if (!text.trim()) {
            setError("يرجى إدخال نص للتحليل.");
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const { score, most_likely_ai_sentences } = await detectAiContent(text, selectedTextModel, logStatus);
            
            let highlightedHtml = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            most_likely_ai_sentences.forEach(sentence => {
                 const escapedSentenceForRegex = sentence.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/</g, "&lt;").replace(/>/g, "&gt;");
                 const replacement = `<mark>${sentence.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</mark>`;
                 highlightedHtml = highlightedHtml.replace(new RegExp(escapedSentenceForRegex, 'g'), replacement);
            });
            setResult({ score, highlightedHtml });
            logStatus(`✅ تم الفحص. احتمالية كونه AI: ${Math.round(score * 100)}%`);
// FIX: Handle 'e' as 'unknown' in catch block for type safety.
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(`فشل فحص المحتوى: ${errorMessage}`);
            logStatus(`❌ فشل فحص المحتوى: ${errorMessage}`);
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
                    <i className="fas fa-search relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    كاشف المحتوى بالذكاء الاصطناعي
                </h2>
            </div>
            
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الشامل للاستخدام</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                    <style>{`mark { background-color: rgba(239, 68, 68, 0.4); border-radius: 3px; padding: 0 2px; }`}</style>
                    <textarea 
                        value={text} 
                        onChange={e => setText(e.target.value)}
                        placeholder="الصق النص هنا لتحليله..."
                        className="w-full h-48 bg-gray-900 border border-gray-600 rounded-md p-4 text-sm text-gray-200 resize-y"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading || !text} className="w-full h-12 text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                        {isLoading ? <LoadingIndicator /> : "🔬 تحليل النص"}
                    </button>
                </div>

                {isLoading && (
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                        <AnalyzingIndicator wordCount={wordCount} />
                    </div>
                )}
                
                {result && (
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-6">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-gray-900/50 p-4 rounded-lg">
                           <ScoreGauge score={result.score} />
                           <div className="text-center">
                               <p className="text-gray-400">احتمالية كونه مولداً بالذكاء الاصطناعي</p>
                               <p className="text-5xl font-bold text-cyan-400" style={{textShadow: '0 0 10px #22d3ee'}}>{Math.round(result.score * 100)}%</p>
                           </div>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-purple-300 mb-3">النص مع تظليل الجمل المشبوهة</h4>
                             <div className="w-full h-80 bg-gray-900 border border-gray-700 rounded-md p-4 text-sm text-gray-200 overflow-y-auto whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: result.highlightedHtml }}
                             />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AiContentDetector;

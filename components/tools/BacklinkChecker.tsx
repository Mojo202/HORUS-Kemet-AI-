import React, { useState } from 'react';
import { apiKeyManager } from '../../apiKeyManager';
import LoadingIndicator from '../LoadingIndicator';
import { BacklinkAnalysisResult, BacklinkOpportunity } from '../../types';
import { analyzeBacklinks } from '../../services/geminiService';

interface BacklinkCheckerProps {
    onNavigateHome: () => void;
    logStatus: (message: string) => void;
    setError: (error: string | null) => void;
}

const GuideSection = () => (
    <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8" dangerouslySetInnerHTML={{ __html: `
        <h3 class="!text-2xl !font-bold text-center !text-cyan-400 !mb-6 !pb-2 !border-b-2 !border-cyan-500/30" style="text-shadow: 0 0 8px rgba(34, 211, 238, 0.5);">الدليل الاستراتيجي المتكامل لبناء الروابط الخلفية (Backlinks)</h3>
        
        <p>المحتوى الرائع هو نصف المعركة، والنصف الآخر هو بناء "الروابط الخلفية" (Backlinks) عالية الجودة. هذه الروابط هي بمثابة "أصوات ثقة" من مواقع أخرى لموقعك، وهي أحد أهم العوامل التي تستخدمها جوجل لتحديد ترتيبك في نتائج البحث.</p>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-star text-2xl w-8 text-center"></i><span>ما هي الروابط الخلفية ولماذا هي بهذه الأهمية؟</span></h4>
        <p>الرابط الخلفي (Backlink) هو ببساطة رابط من موقع ويب آخر يؤدي إلى صفحة في موقعك. كل رابط هو إشارة لمحركات البحث بأن موقعك يحتوي على محتوى قيم وموثوق يستحق الإشارة إليه.</p>
        <ul class="!list-disc !marker:text-cyan-400 !pl-8 !mt-2 !space-y-2">
            <li><strong>تحسين الترتيب (SEO):</strong> الروابط من مواقع ذات سلطة عالية ترفع من سلطة موقعك وتساعدك على تصدر نتائج البحث.</li>
            <li><strong>زيارات مستهدفة:</strong> تحصل على زيارات مباشرة من القراء المهتمين الذين ينقرون على هذه الروابط.</li>
            <li><strong>بناء المصداقية:</strong> عندما تشير إليك مواقع معروفة، تزداد مصداقية علامتك التجارية في أعين الجمهور.</li>
        </ul>

        <div class="p-4 bg-red-900/30 border-l-4 border-red-400 text-red-200 space-y-2 rounded-r-lg mt-6">
            <h5 class="font-bold flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> تحذير شديد: مخاطر ممارسات القبعة السوداء (Black-Hat SEO)</h5>
            <p class="text-sm">هناك طرق مختصرة ومخادعة لبناء الروابط مثل شرائها أو استخدام شبكات المدونات الخاصة (PBNs). هذه الممارسات، المعروفة باسم "Black-Hat SEO"، قد تعطيك دفعة مؤقتة، لكنها تؤدي حتمًا إلى عقوبات قاسية من جوجل قد تصل إلى إزالة موقعك بالكامل من نتائج البحث. <strong>لا تقم أبدًا بشراء الروابط أو استخدام أي طرق غير طبيعية لبنائها.</strong></p>
        </div>

        <h4 class="!text-xl !font-semibold !text-purple-400 !flex !items-center !gap-3 !mt-8 !mb-4 !pb-2 !border-b !border-purple-500/20"><i class="fas fa-hat-wizard text-2xl w-8 text-center"></i><span>كيف أبني الروابط الخلفية بنفسي؟ (طرق القبعة البيضاء الآمنة)</span></h4>
        <p>بناء الروابط هو فن يتطلب الصبر والجودة. إليك أشهر الطرق الآمنة والفعالة التي يوصي بها الخبراء:</p>
        <ol class="!list-decimal list-inside space-y-4 pr-4">
            <li>
                <strong class="text-cyan-300">1. كتابة المقالات كضيف (Guest Posting):</strong>
                <p class="text-sm text-gray-400 mt-1">ابحث عن مدونات مرموقة في مجالك تقبل مقالات من كتاب ضيوف. قدم لهم فكرة مقال عالي الجودة ومفيد لجمهورهم، وفي المقابل، ستحصل على رابط خلفي لموقعك في المقال أو في تعريف الكاتب. هذه الطريقة تبني سلطتك ورابطًا قيّمًا في نفس الوقت.</p>
            </li>
            <li>
                <strong class="text-cyan-300">2. استراتيجية بناء الروابط المكسورة (Broken Link Building):</strong>
                <p class="text-sm text-gray-400 mt-1">ابحث عن روابط لا تعمل في المقالات الموجودة على المواقع الأخرى في مجالك. إذا كان لديك مقال يغطي نفس الموضوع، تواصل مع صاحب الموقع، أبلغه بالرابط المكسور، واقترح عليه استبداله برابط مقالك كبديل مفيد. إنها خدمة مقابل خدمة!</p>
            </li>
            <li>
                <strong class="text-cyan-300">3. الإدراج في صفحات المصادر (Resource Pages):</strong>
                <p class="text-sm text-gray-400 mt-1">العديد من المواقع التعليمية والمدونات الكبيرة لديها صفحات تجمع أفضل المصادر حول موضوع معين (مثل "أفضل 50 مدونة عن التسويق"). إذا كان لديك محتوى استثنائي، تواصل معهم واقترح إضافة رابطك إلى القائمة كمصدر قيم لجمهورهم.</p>
            </li>
            <li>
                <strong class="text-cyan-300">4. إنشاء محتوى "جاذب للروابط" (Linkbait):</strong>
                <p class="text-sm text-gray-400 mt-1">هذه هي الاستراتيجية الأقوى على المدى الطويل. قم بإنشاء محتوى فريد وعالي القيمة لدرجة أن الناس سيرغبون في مشاركته ووضع روابط له بشكل طبيعي. استخدم قسم "أفكار المحتوى" في هذه الأداة للحصول على إلهام.</p>
            </li>
        </ol>
    `}} />
);

const BacklinkChecker: React.FC<BacklinkCheckerProps> = ({ onNavigateHome, logStatus, setError }) => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<BacklinkAnalysisResult | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(true);

    const handleAnalyze = async () => {
        if (!topic.trim()) {
            setError("يرجى إدخال موضوع أو رابط منافس للبدء.");
            return;
        }

        setIsLoading(true);
        setResults(null);
        setError(null);
        logStatus(`🔗 بدء تحليل فرص الباك لينك لموضوع: "${topic}"`);

        try {
            // NOTE: The model is hardcoded to gemini-2.5-flash as it's the main one for text tasks.
            const data = await analyzeBacklinks(topic, 'gemini-2.5-flash', logStatus);
            setResults(data);
            logStatus(`✅ تم العثور على استراتيجية باك لينك شاملة.`);
        } catch (e: any) {
            setError(`فشل تحليل الباك لينك: ${e.message}`);
            logStatus(`❌ فشل تحليل الباك لينك: ${e.message}`);
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
                    <i className="fas fa-link relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    مرصد حورس لفرص الروابط الخلفية
                </h2>
            </div>
            
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الاستراتيجي المتكامل</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="أدخل موضوعك أو رابط منافس..." className="md:col-span-2 w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200" />
                        <button onClick={handleAnalyze} disabled={isLoading} className="w-full h-full text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                            {isLoading ? <LoadingIndicator /> : "🔬 تحليل"}
                        </button>
                     </div>
                </div>

                {isLoading && <div className="flex justify-center p-8"><LoadingIndicator /></div>}

                {results && (
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-6">
                        <h3 className="text-xl font-bold text-cyan-400 text-center">نتائج التحليل</h3>
                        
                        {/* Opportunities Table */}
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-purple-300 mb-3">🎯 فرص الروابط الخلفية</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead><tr className="border-b border-gray-700"><th className="p-2">الموقع المستهدف</th><th className="p-2">السلطة (تقديرية)</th><th className="p-2">الاستراتيجية</th><th className="p-2">ملاحظات</th></tr></thead>
                                    <tbody>
                                        {results.opportunities.map((op, i) => (
                                            <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                <td className="p-2 font-mono text-cyan-300"><a href={op.siteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{op.siteUrl}</a></td>
                                                <td className="p-2 text-center text-yellow-300">{op.authorityScore}</td>
                                                <td className="p-2 text-gray-300">{op.strategy}</td>
                                                <td className="p-2 text-gray-400">{op.notes}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Content Ideas */}
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                             <h4 className="text-lg font-semibold text-purple-300 mb-3">💡 أفكار محتوى جاذبة للروابط</h4>
                             <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {results.contentIdeas.map((idea, i) => <li key={i}>{idea}</li>)}
                             </ul>
                        </div>

                        {/* Outreach Templates */}
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-purple-300 mb-3">✉️ قوالب تواصل</h4>
                            <div className="space-y-4">
                                {results.outreachTemplates.map((template, i) => (
                                    <div key={i} className="p-3 border border-gray-700 rounded-md">
                                        <p className="font-semibold text-cyan-300">الموضوع: {template.title}</p>
                                        <pre className="mt-2 text-sm text-gray-300 whitespace-pre-wrap font-sans">{template.body}</pre>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
};

export default BacklinkChecker;
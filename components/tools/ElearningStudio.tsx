import React, { useState } from 'react';
import { ToolType } from '../../types';
import GuideSection from '../GuideSection';
import { PageBanner } from '../PageBanner';
import LoadingIndicator from '../LoadingIndicator';

const ElearningStudio: React.FC<{ onNavigateHome: () => void; logStatus: (msg: string) => void; setError: (err: string | null) => void; }> = ({ onNavigateHome, logStatus, setError }) => {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('beginner');
    const [generatedContent, setGeneratedContent] = useState({ objectives: '', content: '', quiz: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = () => {
        if (!topic) {
            setError("يرجى إدخال موضوع الدرس.");
            return;
        }
        setIsLoading(true);
        setError(null);
        logStatus(`بدء إنشاء محتوى تعليمي لـ: "${topic}"...`);
        // Placeholder for AI logic
        setTimeout(() => {
            setGeneratedContent({
                objectives: "1. فهم المفهوم الأساسي لـ [الموضوع].\n2. تحديد أهمية [الموضوع] في [السياق].\n3. تطبيق [مفهوم] على مثال عملي.",
                content: "- **المفهوم الأول:** شرح مبسط للمفهوم.\n- **المفهوم الثاني:** تفصيل أعمق مع أمثلة.\n- **التطبيق العملي:** خطوة بخطوة لتطبيق المفهوم.",
                quiz: "1. ما هو التعريف الرئيسي لـ [الموضوع]؟ (اختيار من متعدد)\n2. اذكر مثالاً على [تطبيق عملي للموضوع]. (سؤال مقالي)"
            });
            logStatus("✅ تم إنشاء المحتوى التعليمي بنجاح.");
            setIsLoading(false);
        }, 2000);
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="استوديو المحتوى التعليمي" iconClass="fas fa-chalkboard-teacher" />

             <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
                {/* Input Section */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                    <h3 className="text-xl font-bold text-center text-cyan-400">1. تفاصيل الدرس</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">موضوع الدرس</label>
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="مثال: أساسيات التسويق الرقمي" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">المستوى التعليمي</label>
                        <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200">
                            <option value="beginner">مبتدئ</option>
                            <option value="intermediate">متوسط</option>
                            <option value="advanced">متقدم</option>
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                        {isLoading ? <LoadingIndicator /> : '🎓 أنشئ محتوى الدرس'}
                    </button>
                </div>

                {/* Output Section */}
                {isLoading ? <div className="flex justify-center p-8"><LoadingIndicator /></div> : generatedContent.content && (
                    <div className="space-y-6">
                        <div className="bg-black/40 p-6 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
                            <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-3 mb-3"><i className="fas fa-bullseye"></i> أهداف الدرس</h4>
                            <pre className="whitespace-pre-wrap font-sans text-gray-300">{generatedContent.objectives}</pre>
                        </div>
                        <div className="bg-black/40 p-6 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
                            <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-3 mb-3"><i className="fas fa-book-open"></i> المحتوى الرئيسي</h4>
                            <pre className="whitespace-pre-wrap font-sans text-gray-300">{generatedContent.content}</pre>
                        </div>
                        <div className="bg-black/40 p-6 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm">
                            <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-3 mb-3"><i className="fas fa-question-circle"></i> أسئلة الاختبار</h4>
                            <pre className="whitespace-pre-wrap font-sans text-gray-300">{generatedContent.quiz}</pre>
                        </div>
                    </div>
                )}
                
                <GuideSection 
                    toolType={ToolType.ElearningStudio}
                />
            </div>
        </>
    );
};

export default ElearningStudio;

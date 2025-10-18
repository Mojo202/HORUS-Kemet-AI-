import React, { useState } from 'react';
import { ToolType } from '../../types';
import GuideSection from '../GuideSection';
import { PageBanner } from '../PageBanner';
import LoadingIndicator from '../LoadingIndicator';

interface Scene {
    icon: string;
    title: string;
    content: string;
    sfx: string;
}

const PodcastScriptGenerator: React.FC<{ onNavigateHome: () => void; logStatus: (msg: string) => void; setError: (err: string | null) => void; }> = ({ onNavigateHome, logStatus, setError }) => {
    const [idea, setIdea] = useState('');
    const [script, setScript] = useState<Scene[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = () => {
        if (!idea) {
            setError("يرجى إدخال فكرة الحلقة.");
            return;
        }
        setIsLoading(true);
        setError(null);
        logStatus(`بدء كتابة سكريبت بودكاست عن: "${idea}"...`);
        // Placeholder for AI logic
        setTimeout(() => {
            setScript([
                { icon: 'fas fa-play-circle', title: 'المقدمة (Hook)', content: 'مرحباً بكم في حلقة اليوم حيث سنكشف أسرار [الموضوع]. هل تساءلتم يوماً كيف يمكن تحقيق [الهدف]؟ ابقوا معنا.', sfx: 'موسيقى تصويرية حماسية تبدأ ثم تخفت تدريجياً.' },
                { icon: 'fas fa-microphone-alt', title: 'الجزء الأول: الأساسيات', content: 'قبل أن نتعمق، دعونا نضع الأساس. [الموضوع] هو ببساطة... وهذا مهم لأنه...', sfx: 'مؤثر صوتي خفيف للانتقال.' },
                { icon: 'fas fa-microphone-alt', title: 'الجزء الثاني: التطبيق العملي', content: 'الآن للجزء الممتع. أول خطوة عملية هي... تذكروا دائماً أن...', sfx: 'لا يوجد.' },
                { icon: 'fas fa-stop-circle', title: 'الخاتمة (CTA)', content: 'في الختام، تعلمنا أن [ملخص]. لا تنسوا الاشتراك ومتابعتنا على [حسابات التواصل]. شكراً لاستماعكم ونلقاكم في الحلقة القادمة!', sfx: 'الموسيقى التصويرية تعود تدريجياً وتتصاعد.' },
            ]);
            logStatus("✅ تم إنشاء سكريبت البودكاست بنجاح.");
            setIsLoading(false);
        }, 2000);
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="مولّد نصوص البودكاست والفيديو الطويل" iconClass="fas fa-podcast" />
            
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                    <label className="block text-lg font-medium text-center text-gray-300 mb-2">فكرة الحلقة أو نقاطها الرئيسية</label>
                    <textarea 
                        value={idea}
                        onChange={e => setIdea(e.target.value)}
                        placeholder="مثال: حلقة عن كيفية بدء بودكاست ناجح من الصفر، تغطي المعدات، المحتوى، والتسويق..." 
                        rows={4}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-4 text-lg text-center text-gray-200 resize-y"
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !idea} className="w-full h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                        {isLoading ? <LoadingIndicator /> : '🎙️ أنشئ السكريبت'}
                    </button>
                </div>

                {isLoading && <div className="flex justify-center p-8"><LoadingIndicator /></div>}
                {script.length > 0 && (
                    <div className="space-y-6">
                        {script.map((scene, index) => (
                             <div key={index} className="bg-black/40 p-6 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm" style={{ animation: `fadeInUp 0.5s ${index * 0.1}s ease-out forwards`, opacity: 0 }}>
                                <h4 className="text-lg font-semibold text-purple-300 flex items-center gap-3 mb-3"><i className={`${scene.icon} w-6 text-center`}></i>{scene.title}</h4>
                                <p className="text-gray-300 mb-4">{scene.content}</p>
                                <p className="text-xs text-cyan-400 font-mono border-t border-cyan-500/20 pt-2"><strong className="font-semibold">SFX:</strong> {scene.sfx}</p>
                            </div>
                        ))}
                    </div>
                )}

                <GuideSection 
                    toolType={ToolType.PodcastScriptGenerator}
                />
            </div>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </>
    );
};

export default PodcastScriptGenerator;

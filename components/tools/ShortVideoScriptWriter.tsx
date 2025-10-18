import React, { useState } from 'react';
import { ToolType } from '../../types';
import GuideSection from '../GuideSection';
import { PageBanner } from '../PageBanner';

const ShortVideoScriptWriter: React.FC<{ onNavigateHome: () => void; logStatus: (msg: string) => void; setError: (err: string | null) => void; }> = ({ onNavigateHome, logStatus, setError }) => {
    const [topic, setTopic] = useState('');
    const [script, setScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = () => {
        setIsLoading(true);
        setError(null);
        logStatus(`بدء كتابة سكريبت فيديو قصير عن: "${topic}"...`);
        setTimeout(() => {
            setScript(
`**مدة الفيديو: ~30 ثانية**

**(مشهد 1: الخطاف - أول 3 ثواني)**
- **[فيديو]** لقطة سريعة وجذابة لـ [صورة متعلقة بالموضوع].
- **[نص على الشاشة]** هل تعاني من [المشكلة التي يحلها الموضوع]؟
- **[صوت]** موسيقى حماسية وسريعة.

**(مشهد 2: النقطة الأولى - 10 ثواني)**
- **[فيديو]** لقطة توضيحية لـ [النقطة الأولى].
- **[نص على الشاشة]** أولاً: [شرح مبسط للنقطة الأولى].
- **[تعليق صوتي]** "الحل يبدأ بخطوة بسيطة: [شرح النقطة الأولى بصوت واضح]".

**(مشهد 3: النقطة الثانية - 10 ثواني)**
- **[فيديو]** لقطة مختلفة توضح [النقطة الثانية].
- **[نص على الشاشة]** ثانياً: لا تنسَ [شرح مبسط للنقطة الثانية].
- **[تعليق صوتي]** "والأهم من ذلك هو [شرح النقطة الثانية بصوت مشجع]".

**(مشهد 4: دعوة للعمل - آخر 5 ثواني)**
- **[فيديو]** لقطة نهائية جذابة مع ظهور شعارك.
- **[نص على الشاشة]** تابعنا للمزيد من النصائح!
- **[تعليق صوتي]** "هل تريد معرفة المزيد؟ تابع حسابنا الآن!"`
            );
            logStatus("✅ تم إنشاء السكريبت بنجاح.");
            setIsLoading(false);
        }, 1500);
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="كاتب نصوص الفيديو القصيرة" iconClass="fas fa-file-video" />

            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                    <textarea 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="الصق نص المقال أو النقاط الرئيسية هنا..." 
                        className="w-full h-40 bg-gray-900 border border-gray-600 rounded-md p-4 text-sm text-gray-200 resize-y"
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !topic} className="w-full h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                        {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : '🎬 حوّل إلى سكريبت فيديو'}
                    </button>
                    <textarea 
                        value={script}
                        readOnly
                        placeholder="سيظهر السكريبت الجاهز للتسجيل هنا..." 
                        className="w-full h-72 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-cyan-300 resize-y"
                    />
                </div>
                 <GuideSection 
                    toolType={ToolType.ShortVideoScriptWriter}
                 />
            </div>
        </>
    );
};

export default ShortVideoScriptWriter;

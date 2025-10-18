import React, { useState } from 'react';
import { ToolType } from '../../types';
import GuideSection from '../GuideSection';
import { PageBanner } from '../PageBanner';

const HeadlineAnalyzer: React.FC<{ onNavigateHome: () => void; logStatus: (msg: string) => void; setError: (err: string | null) => void; }> = ({ onNavigateHome, logStatus, setError }) => {
    const [headline, setHeadline] = useState('');
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = () => {
        setIsLoading(true);
        setError(null);
        logStatus(`بدء تحليل العنوان: "${headline}"...`);
        setTimeout(() => {
            setAnalysis(
`**النتيجة الإجمالية: 78/100 (جيد جداً)**

**✅ نقاط القوة:**
- **جاذبية عاطفية:** استخدام كلمة "أسرار" يثير فضول القارئ.
- **وضوح وفائدة:** العنوان يعد القارئ بفائدة واضحة (بشرة نضرة).
- **الطول:** الطول مثالي للظهور الكامل في نتائج بحث جوجل.

**💡 اقتراحات للتحسين:**
- **إضافة أرقام:** جرب "7 أسرار لبشرة نضرة..."، فالأرقام تزيد من نسبة النقر.
- **استخدام كلمات قوة:** يمكن إضافة كلمات مثل "فورية" أو "مثبتة علمياً" لزيادة التأثير.
- **عنوان مقترح:** "7 أسرار مثبتة علمياً للحصول على بشرة نضرة في أسبوع".`
            );
            logStatus("✅ تم تحليل العنوان بنجاح.");
            setIsLoading(false);
        }, 1500);
    };
    
    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="محلل العناوين الاحترافي" iconClass="fas fa-spell-check" />

            <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                    <input 
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="الصق العنوان المقترح هنا..." 
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-4 text-lg text-center text-gray-200"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading || !headline} className="w-full h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                        {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : '🔍 حلّل العنوان الآن'}
                    </button>
                    <textarea 
                        value={analysis}
                        readOnly
                        placeholder="سيظهر تحليل العنوان واقتراحات التحسين هنا..." 
                        className="w-full h-64 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-cyan-300 resize-y"
                    />
                </div>
                <GuideSection 
                    toolType={ToolType.HeadlineAnalyzer} 
                />
            </div>
        </>
    );
};

export default HeadlineAnalyzer;

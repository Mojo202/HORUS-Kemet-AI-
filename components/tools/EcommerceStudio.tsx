import React, { useState } from 'react';
import { ToolType } from '../../types';
import GuideSection from '../GuideSection';
import { PageBanner } from '../PageBanner';
import LoadingIndicator from '../LoadingIndicator';

const EcommerceStudio: React.FC<{ onNavigateHome: () => void; logStatus: (msg: string) => void; setError: (err: string | null) => void; }> = ({ onNavigateHome, logStatus, setError }) => {
    const [productName, setProductName] = useState('');
    const [features, setFeatures] = useState('');
    const [tone, setTone] = useState('persuasive');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        if (!productName || !features) {
            setError("يرجى إدخال اسم المنتج ومميزاته على الأقل.");
            return;
        }
        setIsLoading(true);
        setError(null);
        logStatus(`بدء إنشاء وصف لمنتج: "${productName}"...`);
        // Placeholder for AI logic
        setTimeout(() => {
            setGeneratedContent(
`**وصف المنتج:**
"ارتقِ بأسلوبك مع **${productName}**! صُمم هذا المنتج الاستثنائي بدقة ليمنحك تجربة لا مثيل لها، حيث يجمع بين الأناقة الفائقة والأداء القوي. ${features}. مثالي للمستخدمين الذين يقدرون الجودة والتصميم."

**النقاط الرئيسية:**
- **جودة فائقة:** مصنوع من مواد عالية الجودة لضمان المتانة.
- **تصميم أنيق:** يتميز بتصميم عصري يناسب جميع الأذواق.
- **سهولة الاستخدام:** واجهة بسيطة وتجربة استخدام سلسة.`
            );
            logStatus("✅ تم إنشاء وصف المنتج بنجاح.");
            setIsLoading(false);
        }, 2000);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="استوديو التجارة الإلكترونية" iconClass="fas fa-store" />

            <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                        <h3 className="text-xl font-bold text-center text-cyan-400">1. بيانات المنتج</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">اسم المنتج</label>
                            <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="مثال: ساعة ذكية Pro X" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">أهم المميزات (كل ميزة في سطر)</label>
                            <textarea value={features} onChange={e => setFeatures(e.target.value)} rows={5} placeholder="شاشة AMOLED مقاومة للماء بطارية تدوم 7 أيام" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">نبرة الوصف</label>
                            <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200">
                                <option value="persuasive">إقناعي وتسويقي</option>
                                <option value="professional">احترافي وتقني</option>
                                <option value="friendly">ودي وبسيط</option>
                            </select>
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                            {isLoading ? <LoadingIndicator /> : '🛒 أنشئ وصف المنتج'}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col">
                         <h3 className="text-xl font-bold text-center text-cyan-400 mb-4">2. المحتوى المولد</h3>
                         <div className="relative bg-black/40 p-6 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm min-h-[300px] flex-grow flex flex-col">
                            {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"><LoadingIndicator /></div>}
                            {!isLoading && !generatedContent && <div className="m-auto text-center text-gray-500">سيظهر وصف المنتج هنا...</div>}
                            {generatedContent && (
                                <>
                                    <button onClick={handleCopy} className="absolute top-3 left-3 px-3 py-1 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-700 z-10">
                                        {copied ? '✓ تم النسخ' : 'نسخ'}
                                    </button>
                                    <pre className="whitespace-pre-wrap font-sans text-gray-200">{generatedContent}</pre>
                                </>
                            )}
                         </div>
                    </div>
                </div>

                <GuideSection 
                    toolType={ToolType.EcommerceStudio}
                />
            </div>
        </>
    );
};

export default EcommerceStudio;

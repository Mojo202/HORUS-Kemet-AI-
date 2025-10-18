import React, { useState } from 'react';
import { ToolType } from '../../types';
import GuideSection from '../GuideSection';
import { PageBanner } from '../PageBanner';
import LoadingIndicator from '../LoadingIndicator';

const EmailMarketingGenerator: React.FC<{ onNavigateHome: () => void; logStatus: (msg: string) => void; setError: (err: string | null) => void; }> = ({ onNavigateHome, logStatus, setError }) => {
    const [audience, setAudience] = useState('');
    const [subject, setSubject] = useState('');
    const [goal, setGoal] = useState('');
    const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        if (!audience || !subject || !goal) {
            setError("يرجى ملء جميع الحقول لإنشاء البريد الإلكتروني.");
            return;
        }
        setIsLoading(true);
        setError(null);
        logStatus(`بدء إنشاء بريد إلكتروني...`);
        // Placeholder for AI logic
        setTimeout(() => {
            setGeneratedEmail({
                subject: `حصرياً لـ ${audience}: ${subject}`,
                body: `مرحباً،\n\nبصفتك جزءاً من جمهورنا المميز، يسعدنا أن نقدم لك محتوى حصرياً حول ${subject}. هدفنا هو مساعدتك على ${goal}.\n\nفي هذا البريد، ستكتشف:\n- نقطة مهمة 1\n- نقطة مهمة 2\n\nنتمنى أن تجد هذا المحتوى مفيداً.\n\nمع تحيات،\nفريق [اسم موقعك]`
            });
            logStatus("✅ تم إنشاء البريد الإلكتروني بنجاح.");
            setIsLoading(false);
        }, 2000);
    };

    const handleCopy = () => {
        const content = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
            <PageBanner title="مولّد محتوى التسويق عبر البريد" iconClass="fas fa-paper-plane" />

             <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                        <h3 className="text-xl font-bold text-center text-cyan-400">1. تفاصيل الحملة</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">الجمهور المستهدف</label>
                            <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="مثال: مشتركين جدد، عملاء مهتمين بالتسويق" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">موضوع الحملة</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="مثال: إطلاق منتج جديد، نشرة إخبارية أسبوعية" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">الهدف الرئيسي للبريد</label>
                            <input type="text" value={goal} onChange={e => setGoal(e.target.value)} placeholder="مثال: زيادة المبيعات، بناء علاقة مع الجمهور" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200" />
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-gray-600">
                            {isLoading ? <LoadingIndicator /> : '✉️ أنشئ البريد الإلكتروني'}
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col">
                        <h3 className="text-xl font-bold text-center text-cyan-400 mb-4">2. المحتوى المولد</h3>
                         <div className="relative bg-gray-900/70 p-4 rounded-lg border border-cyan-500/30 shadow-lg shadow-cyan-500/10 backdrop-blur-sm min-h-[300px] flex-grow flex flex-col">
                            {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"><LoadingIndicator /></div>}
                            {!isLoading && !generatedEmail.body && <div className="m-auto text-center text-gray-500">سيظهر البريد الإلكتروني هنا...</div>}
                            {generatedEmail.body && (
                                <>
                                    <button onClick={handleCopy} className="absolute top-3 left-3 px-3 py-1 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-700 z-10">
                                        {copied ? '✓ تم النسخ' : 'نسخ'}
                                    </button>
                                    <div className="border-b border-gray-700 pb-2 mb-3">
                                        <p className="text-sm text-gray-400">الموضوع:</p>
                                        <p className="font-semibold text-gray-200">{generatedEmail.subject}</p>
                                    </div>
                                    <pre className="flex-grow whitespace-pre-wrap font-sans text-gray-300 text-sm overflow-y-auto">{generatedEmail.body}</pre>
                                </>
                            )}
                         </div>
                    </div>
                </div>

                <GuideSection 
                    toolType={ToolType.EmailMarketingGenerator} 
                />
            </div>
        </>
    );
};

export default EmailMarketingGenerator;

import React, { useState, useRef } from 'react';
import { fileToText } from '../../utils/file';

interface CodeConverterProps {
    onNavigateHome: () => void;
}

type ConversionType = 'encodeHTML' | 'decodeHTML' | 'encodeURL' | 'decodeURL' | 'toBase64' | 'fromBase64';

const CodeConverter: React.FC<CodeConverterProps> = ({ onNavigateHome }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleConversion = (type: ConversionType) => {
        try {
            let result = '';
            switch (type) {
                case 'encodeHTML':
                    result = input.replace(/[\u00A0-\u9999<>\&"']/g, i => '&#'+i.charCodeAt(0)+';');
                    break;
                case 'decodeHTML':
                    const txt = document.createElement("textarea");
                    txt.innerHTML = input;
                    result = txt.value;
                    break;
                case 'encodeURL':
                    result = encodeURIComponent(input);
                    break;
                case 'decodeURL':
                    result = decodeURIComponent(input);
                    break;
                case 'toBase64':
                    result = btoa(unescape(encodeURIComponent(input)));
                    break;
                case 'fromBase64':
                    result = decodeURIComponent(escape(atob(input)));
                    break;
                default:
                    break;
            }
            setOutput(result);
        } catch (e: any) {
            setOutput(`خطأ في التحويل: ${e.message}`);
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            try {
                const text = await fileToText(event.target.files[0]);
                setInput(text);
            } catch (error) {
                alert("فشل في قراءة الملف.");
            }
        }
        if (event.target) event.target.value = "";
    };
    
    const handlePaste = async () => {
        const text = await navigator.clipboard.readText();
        setInput(text);
    };

    const handleCopy = () => {
        if (output) navigator.clipboard.writeText(output);
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted-code.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const GuideSection = () => (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-6">
            <h3 className="text-xl font-bold text-center text-cyan-400">الدليل الشامل لأداة تحويل الأكواد</h3>
            <p className="text-center text-gray-400">
                هذه الأداة هي السكين السويسري للمطورين ومنشئي المحتوى، تتيح لك تحويل النصوص والأكواد بين التنسيقات المختلفة بسهولة وأمان.
            </p>

            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400 border-b-2 border-purple-500/30 pb-2">أنواع التحويلات المتاحة</h4>
                <ul className="space-y-3">
                    <li className="p-3 bg-gray-800/50 rounded-md">
                        <strong className="text-cyan-300">تشفير/فك تشفير HTML (Encode/Decode):</strong>
                        <p className="text-sm text-gray-400 mt-1">مثالي لعرض أمثلة أكواد HTML في مقالاتك. يقوم بتحويل الرموز مثل `&lt;` و `&gt;` إلى `&amp;lt;` و `&amp;gt;` حتى لا يفسرها المتصفح ككود فعلي.</p>
                    </li>
                    <li className="p-3 bg-gray-800/50 rounded-md">
                        <strong className="text-cyan-300">تشفير/فك تشفير الروابط (URL Encode/Decode):</strong>
                        <p className="text-sm text-gray-400 mt-1">ضروري للتعامل مع الروابط التي تحتوي على رموز خاصة أو مسافات أو حروف عربية، مما يضمن أنها تعمل بشكل صحيح في جميع المتصفحات.</p>
                    </li>
                    <li className="p-3 bg-gray-800/50 rounded-md">
                        <strong className="text-cyan-300">تشفير/فك تشفير Base64:</strong>
                        <p className="text-sm text-gray-400 mt-1">طريقة شائعة لترميز البيانات النصية (أو حتى الملفات) في شكل سلسلة نصية آمنة للنقل أو التضمين في أماكن لا تدعم البيانات الثنائية.</p>
                    </li>
                </ul>
            </div>
             <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg">
                <h5 className="font-bold flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> تحذير مهم!</h5>
                <p className="text-sm">عند فك تشفير محتوى من مصدر غير موثوق (خصوصًا HTML أو Base64)، كن حذرًا. قد يحتوي النص الأصلي على أكواد ضارة (مثل JavaScript) يمكن أن تشكل خطرًا أمنيًا إذا تم تنفيذها.</p>
            </div>
        </div>
    );

    return (
        <>
             <button onClick={onNavigateHome} className="absolute top-24 left-4 sm:left-6 lg:left-8 px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2 z-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                العودة للرئيسية
            </button>
             <div className="flex flex-col items-center gap-4 text-center my-6">
                <div className="relative h-24 w-24 flex items-center justify-center">
                    <svg className="absolute h-full w-full text-cyan-500 dark:text-cyan-400 pulsing-triangle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" strokeLinejoin="round" strokeWidth="3" stroke="currentColor" fill="none"><path d="M50 5 L95 85 L5 85 Z" /></svg>
                    <i className="fas fa-exchange-alt relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    محول الأكواد الاحترافي
                </h2>
            </div>

            <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
                 <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isGuideOpen}>
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3"><i className="fas fa-book-open"></i>الدليل الشامل للاستخدام</h3>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>
                
                 <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Area */}
                        <div className="flex flex-col gap-2">
                             <div className="flex justify-between items-center">
                                <label htmlFor="input-area" className="font-semibold text-gray-800 dark:text-gray-200">النص الأصلي:</label>
                                <div className="flex gap-2">
                                    <button onClick={handlePaste} title="لصق" className="px-3 py-1 text-xs rounded-md bg-gray-500 text-white hover:bg-gray-600"><i className="fas fa-paste"></i></button>
                                    <button onClick={() => fileInputRef.current?.click()} title="رفع ملف" className="px-3 py-1 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-700"><i className="fas fa-upload"></i></button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.html,.xml,.css,.js" />
                                </div>
                            </div>
                            <textarea id="input-area" value={input} onChange={e => setInput(e.target.value)} placeholder="أدخل النص أو الكود هنا..." className="w-full h-64 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm text-gray-800 dark:text-gray-200 resize-y" dir="ltr" />
                        </div>
                        {/* Output Area */}
                        <div className="flex flex-col gap-2">
                             <div className="flex justify-between items-center">
                                <label htmlFor="output-area" className="font-semibold text-gray-800 dark:text-gray-200">النتيجة:</label>
                                <div className="flex gap-2">
                                    <button onClick={handleCopy} title="نسخ" disabled={!output} className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-500"><i className="fas fa-copy"></i></button>
                                    <button onClick={handleDownload} title="تحميل" disabled={!output} className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-500"><i className="fas fa-download"></i></button>
                                </div>
                            </div>
                            <textarea id="output-area" value={output} readOnly placeholder="النتيجة ستظهر هنا..." className="w-full h-64 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm text-cyan-400 resize-y" dir="ltr" />
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <button onClick={() => handleConversion('encodeHTML')} className="p-3 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 font-semibold">تشفير HTML</button>
                        <button onClick={() => handleConversion('decodeHTML')} className="p-3 rounded-md bg-cyan-800 text-white hover:bg-cyan-900 font-semibold">فك تشفير HTML</button>
                        <button onClick={() => handleConversion('encodeURL')} className="p-3 rounded-md bg-purple-600 text-white hover:bg-purple-700 font-semibold">تشفير URL</button>
                        <button onClick={() => handleConversion('decodeURL')} className="p-3 rounded-md bg-purple-800 text-white hover:bg-purple-900 font-semibold">فك تشفير URL</button>
                        <button onClick={() => handleConversion('toBase64')} className="p-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">تشفير Base64</button>
                        <button onClick={() => handleConversion('fromBase64')} className="p-3 rounded-md bg-indigo-800 text-white hover:bg-indigo-900 font-semibold">فك تشفير Base64</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CodeConverter;
import React, { useState, useRef } from 'react';
import LoadingIndicator from '../LoadingIndicator';
import { fileToText } from '../../utils/file';

interface BloggerCleanerProps {
    onNavigateHome: () => void;
}

const BLOGGER_RESET_TEMPLATE = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:responsive='true' b:templateVersion='1.3.0' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
  <head>
    <meta charset='UTF-8' />
    <title><data:blog.pageTitle/></title>
    <b:skin><![CDATA[/* No CSS to declare */]]></b:skin>
  </head>
  <body>
    <b:section class='main' id='main' showaddelement='yes'>
      <b:widget id='Blog1' locked='true' title='Blog Posts' type='Blog' version='1'/>
    </b:section>
  </body>
</html>`;


const BloggerCleaner: React.FC<BloggerCleanerProps> = ({ onNavigateHome }) => {
    const [inputCode, setInputCode] = useState('');
    const [outputCode, setOutputCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedOutput, setCopiedOutput] = useState(false);

    const [resetTemplateCode, setResetTemplateCode] = useState('');
    const [copiedReset, setCopiedReset] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(true);


    const handleCleanCode = () => {
        setIsLoading(true);
        setOutputCode('');

        setTimeout(() => {
            let cleaned = inputCode.replace(/<!--[\s\S]*?-->/g, '');
            cleaned = cleaned.replace(/\n\s*\n/g, '\n');
            setOutputCode(cleaned.trim());
            setIsLoading(false);
        }, 500);
    };

    const handleCopy = (content: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
        if (content) {
            navigator.clipboard.writeText(content);
            setCopiedState(true);
            setTimeout(() => setCopiedState(false), 2000);
        }
    };

    const handleDownload = (content: string, filename: string) => {
        if (!content) return;
        const blob = new Blob([content], { type: 'text/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInputCode(text);
        } catch (err) {
            alert("فشل في قراءة الحافظة. يرجى التأكد من منح الإذن اللازم للمتصفح.");
        }
    };

    const handleClear = () => {
        setInputCode('');
        setOutputCode('');
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            try {
                const text = await fileToText(event.target.files[0]);
                setInputCode(text);
            } catch (error) {
                alert("فشل في قراءة الملف.");
            }
        }
        if (event.target) {
          event.target.value = "";
        }
    };
    
    const handleGenerateResetTemplate = () => {
        setResetTemplateCode(BLOGGER_RESET_TEMPLATE);
    };

    const GuideSection = () => (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30 text-gray-300 space-y-8">
            <h3 className="text-xl font-bold text-center text-cyan-400">الدليل الشامل لمركز صيانة قوالب بلوجر</h3>
            <p className="text-center text-gray-400">
                مرحباً بك في مركز الصيانة المتقدم. هذا الدليل يشرح لك بالتفصيل الأدوات القوية المتاحة هنا وكيفية استخدامها لتحقيق أفضل أداء لمدوناتك.
            </p>

            {/* Section 1: Code Cleaner */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400 border-b-2 border-purple-500/30 pb-2">1. أداة تنظيف الكود (إزالة التعليقات والمسافات)</h4>
                <p>هذه الأداة هي خطوتك الأولى نحو قالب سريع وخفيف. تقوم بإزالة كل التعليقات البرمجية (comments) والأسطر الفارغة الزائدة من كود القالب، مما يقلل من حجمه ويحسن سرعة تحميله.</p>
                
                <h5 className="font-semibold text-cyan-400">📋 دليل الاستخدام:</h5>
                <ol className="list-decimal list-inside space-y-2 pr-4">
                    <li><strong className="text-purple-300">إدخال الكود:</strong> الصق الكود مباشرة في صندوق "كود القالب الأصلي"، أو استخدم زر "رفع" لاختيار ملف <code>.xml</code> أو <code>.txt</code> من جهازك.</li>
                    <li><strong className="text-purple-300">بدء التنظيف:</strong> اضغط على زر "✨ تنظيف الكود الآن".</li>
                    <li><strong className="text-purple-300">الحصول على النتيجة:</strong> سيظهر الكود النظيف في الصندوق السفلي. يمكنك نسخه أو تحميله كملف جاهز للاستخدام.</li>
                </ol>
            </div>

            {/* Section 2: Reset Template */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-purple-400 border-b-2 border-purple-500/30 pb-2">2. مولّد قالب إعادة التعيين (التنظيف العميق)</h4>
                <p>هذه هي الأداة الاحترافية الأهم. عند تغيير القوالب في بلوجر، غالبًا ما تتبقى أكواد وأدوات (widgets) قديمة مخفية، مما يسبب مشاكل في التوافق ويبطئ القالب الجديد. "قالب إعادة التعيين" هو قالب فارغ تمامًا يقوم بمسح كل هذه البقايا، لتبدأ من صفحة بيضاء ونظيفة.</p>

                <div className="p-4 bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-200 space-y-2 rounded-r-lg">
                    <h5 className="font-bold flex items-center gap-2"><i className="fas fa-exclamation-triangle"></i> نقطة مهمة جداً!</h5>
                    <p className="text-sm">استخدام هذا القالب سيؤدي إلى حذف جميع الأدوات (Widgets) من الشريط الجانبي والفوتر. لن يتم حذف مشاركاتك أو صفحاتك، ولكن ستحتاج إلى إعادة إضافة الأدوات يدويًا بعد تثبيت قالبك الجديد.</p>
                </div>
                
                <h5 className="font-semibold text-cyan-400">📋 دليل الاستخدام الآمن:</h5>
                <ol className="list-decimal list-inside space-y-2 pr-4">
                    <li><strong className="text-purple-300">إنشاء القالب:</strong> اضغط على زر "🚀 إنشاء قالب إعادة التعيين".</li>
                    <li><strong className="text-purple-300">نسخ الكود:</strong> انسخ الكود الذي سيظهر بالكامل.</li>
                    <li><strong className="text-purple-300">الذهاب إلى بلوجر:</strong> افتح لوحة تحكم مدونتك ← المظهر ← تعديل HTML.</li>
                    <li><strong className="text-purple-300">التطبيق:</strong> حدد كل الكود الموجود في المحرر (Ctrl+A) واحذفه، ثم الصق "كود إعادة التعيين" مكانه.</li>
                    <li><strong className="text-purple-300">حفظ التغييرات:</strong> اضغط على أيقونة الحفظ.</li>
                    <li><strong className="text-purple-300">الخطوة النهائية:</strong> الآن، عد مرة أخرى إلى "تعديل HTML"، واحذف كود إعادة التعيين، ثم الصق كود قالبك الجديد والأساسي. اضغط على حفظ.</li>
                </ol>
                <p className="mt-2 text-sm text-gray-400">بهذه الطريقة، تضمن أن قالبك الجديد يعمل على بيئة نظيفة تماماً بدون أي مشاكل موروثة.</p>
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
                    <i className="fab fa-blogger-b relative text-6xl text-cyan-500 dark:text-cyan-400 eye-animation"></i>
                </div>
                <h2 className="font-extrabold text-2xl text-gray-800 dark:text-gray-100 tracking-wider" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.6)' }}>
                    مركز صيانة قوالب بلوجر
                </h2>
            </div>
            
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
                 {/* Guide Section */}
                 <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setIsGuideOpen(!isGuideOpen)}
                        className="w-full flex justify-between items-center p-4 text-left"
                        aria-expanded={isGuideOpen}
                    >
                        <h3 className="text-lg font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-3">
                            <i className="fas fa-book-open"></i>
                            الدليل الشامل لاستخدام أدوات الصيانة
                        </h3>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isGuideOpen && <GuideSection />}
                </div>

                {/* Tool 1: Code Cleaner */}
                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-center text-cyan-600 dark:text-cyan-400 mb-2">أداة تنظيف الكود (إزالة التعليقات والمسافات)</h3>
                    
                    <div className="flex justify-between items-center">
                        <label htmlFor="input-code" className="font-semibold text-gray-800 dark:text-gray-200">1. كود القالب الأصلي:</label>
                        <div className="flex gap-2">
                             <button onClick={handlePaste} title="لصق" className="px-3 py-1 text-xs rounded-md bg-gray-500 text-white hover:bg-gray-600"><i className="fas fa-paste"></i> لصق</button>
                             <button onClick={() => fileInputRef.current?.click()} title="رفع ملف" className="px-3 py-1 text-xs rounded-md bg-purple-600 text-white hover:bg-purple-700"><i className="fas fa-upload"></i> رفع</button>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xml,.txt" />
                             <button onClick={handleClear} title="مسح" className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"><i className="fas fa-trash"></i> مسح</button>
                        </div>
                    </div>
                    <textarea
                        id="input-code"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="<!-- الصق كود قالب بلوجر الكامل هنا... -->"
                        className="w-full h-48 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm text-gray-800 dark:text-gray-200 resize-y"
                        dir="ltr"
                    />

                    <button
                        onClick={handleCleanCode}
                        disabled={isLoading || !inputCode}
                        className="w-full h-12 text-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-lg flex items-center justify-center disabled:bg-purple-500/20 disabled:border disabled:border-purple-400/30 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingIndicator /> : '✨ تنظيف الكود الآن'}
                    </button>
                    
                    <div className="flex justify-between items-center">
                        <label htmlFor="output-code" className="font-semibold text-gray-800 dark:text-gray-200">2. الكود النظيف:</label>
                         <div className="flex gap-2">
                            <button onClick={() => handleCopy(outputCode, setCopiedOutput)} disabled={!outputCode} className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-500">
                                {copiedOutput ? '✓ تم النسخ' : 'نسخ'}
                            </button>
                            <button onClick={() => handleDownload(outputCode, 'cleaned-template.xml')} disabled={!outputCode} className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-500"><i className="fas fa-download"></i> تحميل</button>
                         </div>
                    </div>
                     <textarea
                        id="output-code"
                        value={outputCode}
                        readOnly
                        placeholder="<!-- سيظهر الكود النظيف هنا... -->"
                        className="w-full h-48 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm text-green-400 resize-y"
                        dir="ltr"
                    />
                </div>

                {/* Tool 2: Reset Template Generator */}
                <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
                    <h3 className="text-xl font-bold text-center text-cyan-600 dark:text-cyan-400 mb-2">مولّد قالب إعادة التعيين (التنظيف العميق)</h3>
                    <p className="text-sm text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        استخدم هذا القالب الصغير لإعادة تعيين إعدادات مدونتك وإزالة أي بقايا من القوالب القديمة قبل تثبيت قالب جديد. قم بتركيبه، احفظ التغييرات، ثم قم بتثبيت قالبك الجديد على نظافة.
                    </p>
                    <button
                        onClick={handleGenerateResetTemplate}
                        className="w-full max-w-xs mx-auto h-12 text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow-lg flex items-center justify-center"
                    >
                        🚀 إنشاء قالب إعادة التعيين
                    </button>
                     {resetTemplateCode && (
                        <div className="flex flex-col gap-4 mt-4">
                             <div className="flex justify-between items-center">
                                <label htmlFor="reset-code" className="font-semibold text-gray-800 dark:text-gray-200">كود قالب إعادة التعيين:</label>
                                 <div className="flex gap-2">
                                    <button onClick={() => handleCopy(resetTemplateCode, setCopiedReset)} className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700">
                                       {copiedReset ? '✓ تم النسخ' : 'نسخ'}
                                    </button>
                                    <button onClick={() => handleDownload(resetTemplateCode, 'reset-template.xml')} className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"><i className="fas fa-download"></i> تحميل</button>
                                 </div>
                            </div>
                            <textarea
                                id="reset-code"
                                value={resetTemplateCode}
                                readOnly
                                className="w-full h-48 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm text-amber-400 resize-y"
                                dir="ltr"
                            />
                        </div>
                     )}
                </div>
            </div>
        </>
    );
};

export default BloggerCleaner;